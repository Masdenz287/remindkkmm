import { useMemo, useState } from 'react';
import {
  History,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  BadgeCheck,
  Clock3,
  ChevronDown,
  ChevronUp,
  Printer,
  XCircle,
  ShieldCheck,
  ClipboardList,
  CalendarDays,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore, canVerify, canSeeAll } from '../lib/store';
import { cx, fmtFullID, fmtLongID, fmtShortID, fmtTime } from '../lib/utils';
import { Avatar, Button, Card, ProgressBar, StatusBadge, ROLE_TONE, RoleChip, EmptyState } from '../components/ui';
import { ROLE_META, type Role, type Shift } from '../lib/types';

type StatusFilter = 'semua' | 'terverifikasi' | 'menunggu' | 'masalah';

export default function Riwayat() {
  const store = useStore();
  const user = store.currentUser!;
  const leader = canSeeAll(user);

  const [query, setQuery] = useState('');
  const [statusF, setStatusF] = useState<StatusFilter>('semua');
  const [roleF, setRoleF] = useState<'semua' | Role>('semua');
  const [shiftF, setShiftF] = useState<'semua' | Shift>('semua');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...store.reports];
    if (!leader) list = list.filter((r) => r.userId === user.id); // goreng hanya miliknya
    if (statusF === 'terverifikasi') list = list.filter((r) => r.verified);
    else if (statusF === 'menunggu') list = list.filter((r) => !r.verified);
    else if (statusF === 'masalah') list = list.filter((r) => r.masalahCount > 0);
    if (roleF !== 'semua') list = list.filter((r) => r.role === roleF);
    if (shiftF !== 'semua') list = list.filter((r) => r.shift === shiftF);
    if (from) list = list.filter((r) => r.date >= from);
    if (to) list = list.filter((r) => r.date <= to);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => [r.userName, r.jabatan, r.catatan, r.id, ...r.items.map((i) => i.title + ' ' + i.note)].join(' ').toLowerCase().includes(q));
    return list;
  }, [store.reports, leader, user.id, statusF, roleF, shiftF, from, to, query]);

  const stats = useMemo(() => ({
    total: filtered.length,
    verified: filtered.filter((r) => r.verified).length,
    masalah: filtered.filter((r) => r.masalahCount > 0).length,
    avgPct: filtered.length ? Math.round(filtered.reduce((a, r) => a + (r.total ? (r.done / r.total) * 100 : 0), 0) / filtered.length) : 0,
  }), [filtered]);

  /* ===== Ekspor Excel (.xls kompatibel, tab-separated HTML) ===== */
  const exportExcel = () => {
    if (filtered.length === 0) return toast.error('Tidak ada data untuk diekspor.');
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const rows = filtered
      .map(
        (r, i) => `<Row><Cell><Data ss:Type="Number">${i + 1}</Data></Cell><Cell><Data ss:Type="String">${esc(r.date)}</Data></Cell><Cell><Data ss:Type="String">${esc(r.userName)}</Data></Cell><Cell><Data ss:Type="String">${esc(r.jabatan)}</Data></Cell><Cell><Data ss:Type="String">${ROLE_META[r.role].label}</Data></Cell><Cell><Data ss:Type="String">${r.shift}</Data></Cell><Cell><Data ss:Type="Number">${r.done}</Data></Cell><Cell><Data ss:Type="Number">${r.total}</Data></Cell><Cell><Data ss:Type="Number">${r.okCount}</Data></Cell><Cell><Data ss:Type="Number">${r.periksaCount}</Data></Cell><Cell><Data ss:Type="Number">${r.masalahCount}</Data></Cell><Cell><Data ss:Type="String">${r.verified ? 'TERVERIFIKASI — ' + esc(r.verifiedBy ?? '') : 'MENUNGGU VERIFIKASI'}</Data></Cell><Cell><Data ss:Type="String">${esc(r.catatan)}</Data></Cell></Row>`,
      )
      .join('');
    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Riwayat Laporan"><Table>
<Row>${['No', 'Tanggal', 'Nama', 'Jabatan', 'Peran', 'Shift', 'Item Selesai', 'Total Item', 'OK', 'Perlu Diperiksa', 'Masalah', 'Status', 'Catatan'].map((h) => `<Cell ss:StyleID="h"><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>
${rows}
</Table></Worksheet></Workbook>`;
    const blob = new Blob(['\ufeff' + xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KKMB-Riwayat-Laporan-${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File Excel berhasil diunduh.');
  };

  /* ===== Ekspor PDF (print) ===== */
  const exportPDF = () => {
    if (filtered.length === 0) return toast.error('Tidak ada data untuk diekspor.');
    window.print();
    toast.info('Pilih “Save as PDF” pada dialog cetak.');
  };

  const resetFilters = () => {
    setQuery(''); setStatusF('semua'); setRoleF('semua'); setShiftF('semua'); setFrom(''); setTo('');
  };

  return (
    <div className="space-y-4">
      {/* ===== KEPALA HALAMAN ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20120c] text-[#f5bd4f] shadow-md"><History size={23} /></span>
          <div>
            <h1 className="font-display text-[22px] font-black leading-none text-[#20120c]">Riwayat Laporan</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20120c]/55">{leader ? 'Semua anggota dapur' : 'Laporan milik Anda'} · {filtered.length} laporan</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="success" onClick={exportExcel} className="h-10 text-[10.5px] uppercase tracking-wide"><FileSpreadsheet size={16} /> <span className="hidden sm:inline">Excel</span></Button>
          <Button variant="danger" onClick={exportPDF} className="h-10 text-[10.5px] uppercase tracking-wide"><FileText size={16} /> <span className="hidden sm:inline">PDF</span></Button>
        </div>
      </div>

      {/* ===== RINGKASAN ===== */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { v: stats.total, l: 'Total Laporan', tone: 'text-[#20120c]' },
          { v: stats.verified, l: 'Terverifikasi', tone: 'text-emerald-700' },
          { v: stats.masalah, l: 'Ada Masalah', tone: 'text-red-700' },
          { v: `${stats.avgPct}%`, l: 'Rata-rata Selesai', tone: 'text-[#152a46]' },
        ].map((s) => (
          <Card key={s.l} className="p-3 text-center">
            <p className={cx('font-mono text-[22px] font-bold leading-none', s.tone)}>{s.v}</p>
            <p className="mt-1 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#20120c]/50">{s.l}</p>
          </Card>
        ))}
      </div>

      {/* ===== FILTER ===== */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Cari */}
          <div className="relative min-w-[170px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#20120c]/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, jabatan, catatan, item…" aria-label="Cari laporan" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] pl-9 pr-3 text-[12px] font-medium outline-none focus:border-[#152a46] focus:ring-2 focus:ring-[#152a46]/15" />
          </div>
          {/* Status */}
          <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-[#f7f6f8] p-1">
            <Filter size={13} className="ml-1.5 text-[#20120c]/45" />
            {([['semua', 'Semua'], ['terverifikasi', 'Terverifikasi'], ['menunggu', 'Menunggu'], ['masalah', 'Masalah']] as [StatusFilter, string][]).map(([v, l]) => (
              <button key={v} onClick={() => setStatusF(v)} className={cx('h-8 rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-wide transition-all', statusF === v ? 'bg-[#152a46] text-white shadow-sm' : 'text-[#20120c]/65 hover:bg-black/5')}>{l}</button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={roleF} onChange={(e) => setRoleF(e.target.value as 'semua' | Role)} aria-label="Filter peran" className="h-9 rounded-lg border border-black/10 bg-white px-2 text-[11px] font-semibold outline-none focus:border-[#152a46]">
            <option value="semua">Semua Peran</option>
            {(Object.keys(ROLE_META) as Role[]).map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
          </select>
          <select value={shiftF} onChange={(e) => setShiftF(e.target.value as 'semua' | Shift)} aria-label="Filter shift" className="h-9 rounded-lg border border-black/10 bg-white px-2 text-[11px] font-semibold outline-none focus:border-[#152a46]">
            <option value="semua">Semua Shift</option>
            <option value="Pagi">Shift Pagi</option>
            <option value="Siang">Shift Siang</option>
            <option value="Malam">Shift Malam</option>
          </select>
          <label className="flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2 text-[11px] font-semibold text-[#20120c]/70">
            <CalendarDays size={13} className="text-[#152a46]" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Dari tanggal" className="w-[112px] bg-transparent font-mono text-[10.5px] outline-none" />
            <span className="text-black/30">→</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Sampai tanggal" className="w-[112px] bg-transparent font-mono text-[10.5px] outline-none" />
          </label>
          <button onClick={resetFilters} className="flex h-9 items-center gap-1 rounded-lg border border-black/10 px-2.5 text-[10px] font-bold uppercase tracking-wide text-[#20120c]/60 hover:bg-black/5"><XCircle size={13} /> Reset</button>
        </div>
      </Card>

      {/* ===== DAFTAR LAPORAN ===== */}
      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList size={44} />} title="Tidak ada laporan ditemukan" sub="Ubah kata pencarian atau rentang tanggal filter Anda." action={<Button variant="outline" onClick={resetFilters}>Reset Filter</Button>} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => {
            const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
            const open = expanded === r.id;
            return (
              <li key={r.id}>
                <Card className="overflow-hidden">
                  <div className="flex items-start gap-2.5 p-3 sm:gap-3.5 sm:p-4">
                    <Avatar name={r.userName} color={store.users.find((u) => u.id === r.userId)?.color ?? '#334155'} size={44} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-[13px] font-extrabold leading-tight text-[#20120c]">{r.userName}</p>
                        <RoleChip label={ROLE_META[r.role].short} tone={ROLE_TONE[r.role]} />
                        {r.verified
                          ? <span className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-emerald-800"><ShieldCheck size={10} /> Terverifikasi</span>
                          : <span className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-amber-800"><Clock3 size={10} /> Menunggu Verifikasi</span>}
                      </div>
                      <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#20120c]/50">{r.jabatan} · Shift {r.shift}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-semibold text-[#20120c]/55">
                        <span className="flex items-center gap-1 font-mono"><CalendarDays size={10} />{fmtShortID(r.date)}</span>
                        <span className="flex items-center gap-1 font-mono"><Clock3 size={10} />{fmtTime(r.sentAt)} WIB</span>
                        <span className="flex items-center gap-1"><UserRound size={10} />ID: {r.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar pct={pct} thin className="w-28 sm:w-40" />
                        <span className="font-mono text-[9px] font-bold text-[#20120c]/60">{r.done}/{r.total} · {pct}%</span>
                        <span className="hidden items-center gap-1 text-[8.5px] font-bold text-emerald-700 min-[400px]:flex">{r.okCount} OK</span>
                        {r.periksaCount > 0 && <span className="hidden items-center gap-1 text-[8.5px] font-bold text-amber-700 min-[400px]:flex">{r.periksaCount} PERIKSA</span>}
                        {r.masalahCount > 0 && <span className="flex items-center gap-1 text-[8.5px] font-bold text-red-700">{r.masalahCount} MASALAH</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {canVerify(user) && !r.verified && (
                        <button onClick={() => { store.verifyReport(r.id); toast.success(`Laporan ${r.userName.split(' ')[0]} terverifikasi.`); }} className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2 text-[9.5px] font-black uppercase tracking-wide text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"><BadgeCheck size={12} /> Verifikasi</button>
                      )}
                      {canVerify(user) && r.verified && (
                        <button onClick={() => { store.unverifyReport(r.id); toast.info('Verifikasi dibatalkan.'); }} className="h-8 rounded-lg border border-black/12 px-2 text-[9px] font-bold uppercase tracking-wide text-[#20120c]/55 hover:bg-black/5">Batalkan</button>
                      )}
                      <button onClick={() => setExpanded(open ? null : r.id)} aria-expanded={open} className="flex h-8 items-center gap-0.5 rounded-lg border border-[#152a46]/25 px-2 text-[9.5px] font-bold uppercase tracking-wide text-[#152a46] hover:bg-[#152a46] hover:text-white">{open ? 'Tutup' : 'Detail'}{open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</button>
                    </div>
                  </div>

                  {/* ===== DETAIL LAPORAN ===== */}
                  {open && (
                    <div className="border-t border-black/8 bg-[#fdfcf9] p-3 sm:p-4">
                      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                        <div>
                          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/45">Rincian Checklist</p>
                          <ul className="max-h-56 space-y-1 overflow-y-auto">
                            {r.items.map((i) => (
                              <li key={i.id} className="flex items-center gap-2 rounded-lg border border-black/6 bg-white px-2 py-1.5">
                                <StatusBadge status={i.status} size="sm" />
                                <span className="min-w-0 flex-1 text-[10.5px] font-semibold leading-snug text-[#20120c]/85">{i.title}</span>
                                {i.note && <span className="max-w-[40%] truncate font-mono text-[9px] italic text-amber-800" title={i.note}>{i.note}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="rounded-xl border border-black/8 bg-white p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/45">Catatan Pekerja</p>
                            <p className="mt-1 text-[11px] font-medium italic leading-snug text-[#20120c]/80">“{r.catatan || 'Tidak ada catatan.'}”</p>
                          </div>
                          <div className="rounded-xl border border-black/8 bg-white p-3 text-[10px] font-semibold text-[#20120c]/65">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/45">Verifikasi</p>
                            {r.verified ? (
                              <p className="mt-1 leading-snug text-emerald-800"><BadgeCheck size={11} className="mr-1 inline" />Diverifikasi oleh <b>{r.verifiedBy}</b><br />{r.verifiedAt ? fmtFullID(r.verifiedAt) : ''}</p>
                            ) : (
                              <p className="mt-1 leading-snug text-amber-800"><Clock3 size={11} className="mr-1 inline" />Menunggu verifikasi Koki / Komandan Mispin.</p>
                            )}
                          </div>
                          <button onClick={exportPDF} className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-800/30 bg-red-50 text-[9.5px] font-black uppercase tracking-wide text-red-800 hover:bg-red-100"><Printer size={13} /> Cetak / PDF</button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* ===== AREA CETAK (PDF) — disembunyikan di layar ===== */}
      <div id="print-area" aria-hidden>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '3px solid #20120c', paddingBottom: 10, marginBottom: 12 }}>
          <svg viewBox="0 0 64 64" width="52" height="52"><rect width="64" height="64" rx="12" fill="#20120c" /><path d="M13 41h38" stroke="#f5bd4f" strokeWidth="4" strokeLinecap="round" /><path d="M17 38c0-10 7.3-17.5 15-17.5S47 28 47 38" fill="none" stroke="#f5bd4f" strokeWidth="4" strokeLinecap="round" /><circle cx="32" cy="15.5" r="3" fill="#f5bd4f" /></svg>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 21, margin: 0, color: '#20120c' }}>Kampung Kecil Metropolitan Bekasi</h1>
            <p style={{ margin: '2px 0 0', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8a6a1a', fontWeight: 700 }}>Rasanya ngeraja · Harganya ngerakyat</p>
            <p style={{ margin: '2px 0 0', fontSize: 9, color: '#555' }}>Jl. Metropolitan No. 88, Bekasi · Telp 0812-1100-0000 · Laporan Checklist Dapur</p>
          </div>
        </div>
        <p style={{ fontSize: 10, margin: '0 0 8px', color: '#333' }}>
          Dicetak: {fmtFullID(new Date().toISOString())} · Filter: {statusF}/{roleF}/{shiftF}{from ? ` · dari ${fmtLongID(from)}` : ''}{to ? ` · sampai ${fmtLongID(to)}` : ''} · Total {filtered.length} laporan
        </p>
        <table>
          <thead>
            <tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Jabatan</th><th>Shift</th><th>Selesai</th><th>OK</th><th>Periksa</th><th>Masalah</th><th>Status</th><th>Catatan</th></tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{fmtShortID(r.date)}</td>
                <td>{r.userName}</td>
                <td>{r.jabatan}</td>
                <td>{r.shift}</td>
                <td>{r.done}/{r.total}</td>
                <td>{r.okCount}</td>
                <td>{r.periksaCount}</td>
                <td>{r.masalahCount}</td>
                <td>{r.verified ? `DIVERIFIKASI — ${r.verifiedBy}` : 'MENUNGGU'}</td>
                <td>{r.catatan}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 18, fontSize: 9, color: '#555' }}>Dokumen ini dicetak otomatis dari Sistem Checklist Dapur Kampung Kecil Metropolitan Bekasi. © 2026</p>
        <div style={{ marginTop: 34, display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <div>Mengetahui,<br /><b>Komandan Mispin</b><br /><br /><br />( ____________________ )</div>
          <div>Diverifikasi oleh,<br /><b>Koki Kepala — Rani Puspitasari</b><br /><br /><br />( ____________________ )</div>
        </div>
      </div>
    </div>
  );
}
