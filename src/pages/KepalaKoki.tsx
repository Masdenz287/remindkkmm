import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Gauge,
  Users,
  ListChecks,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Flame,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  CircleDot,
  Loader,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore, canSeeAll } from '../lib/store';
import { defsForRole } from '../lib/seed';
import { cx, fmtShortID, todayStr } from '../lib/utils';
import { Avatar, Button, Card, ProgressBar, StatusBadge, ROLE_TONE, RoleChip } from '../components/ui';
import { ROLE_META, type IssueSeverity, type IssueStatus, type Role } from '../lib/types';

const SEVERITY_META: Record<IssueSeverity, { label: string; cls: string; bar: string }> = {
  tinggi: { label: 'Tinggi', cls: 'border-red-300 bg-red-50 text-red-800', bar: 'bg-red-500' },
  sedang: { label: 'Sedang', cls: 'border-amber-300 bg-amber-50 text-amber-900', bar: 'bg-amber-400' },
  rendah: { label: 'Rendah', cls: 'border-sky-300 bg-sky-50 text-sky-900', bar: 'bg-sky-400' },
};
const STATUS_META: Record<IssueStatus, { label: string; cls: string }> = {
  open: { label: 'Belum Ditangani', cls: 'border-red-300 bg-red-50 text-red-800' },
  progress: { label: 'Sedang Ditangani', cls: 'border-amber-300 bg-amber-50 text-amber-900' },
  selesai: { label: 'Selesai', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
};

export default function KepalaKoki() {
  const store = useStore();
  const user = store.currentUser!;
  const navigate = useNavigate();
  const today = todayStr();

  useEffect(() => {
    if (!canSeeAll(user)) navigate('/', { replace: true });
  }, [user, navigate]);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDetail, setIssueDetail] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<IssueSeverity>('sedang');
  const [issueFilter, setIssueFilter] = useState<'semua' | IssueStatus>('semua');
  const [weekChartOpen, setWeekChartOpen] = useState(true);

  // ===== Data turunan =====
  const members = useMemo(() => store.users.filter((u) => u.active && u.role !== 'wakil'), [store.users]);

  const memberProgress = useMemo(
    () =>
      members.map((m) => {
        const defs = defsForRole(m.role);
        const done = defs.filter((d) => store.getItemState(m.id, d.id, today)).length;
        return { member: m, done, total: defs.length, pct: defs.length ? Math.round((done / defs.length) * 100) : 0 };
      }),
    [members, store, today],
  );

  const totals = useMemo(() => {
    const done = memberProgress.reduce((a, r) => a + r.done, 0);
    const total = memberProgress.reduce((a, r) => a + r.total, 0);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [memberProgress]);

  const todayReports = useMemo(() => store.reports.filter((r) => r.date === today), [store.reports, today]);
  const pendingVerify = todayReports.filter((r) => !r.verified);
  const periksaCount = memberProgress.reduce((a, r) => {
    const defs = defsForRole(r.member.role);
    return a + defs.filter((d) => store.getItemState(r.member.id, d.id, today)?.status === 'periksa').length;
  }, 0);
  const masalahToday = memberProgress.reduce((a, r) => {
    const defs = defsForRole(r.member.role);
    return a + defs.filter((d) => store.getItemState(r.member.id, d.id, today)?.status === 'masalah').length;
  }, 0);
  const openIssues = store.issues.filter((i) => i.status !== 'selesai');
  const highIssues = openIssues.filter((i) => i.severity === 'tinggi').length;

  // ===== 7 hari terakhir =====
  const week = useMemo(() => {
    const days: { label: string; date: string; avg: number; count: number }[] = [];
    for (let d = 6; d >= 0; d--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const dayReports = store.reports.filter((r) => r.date === date);
      // Hari ini pakai live progress bila belum ada laporan
      const avg = d === 0
        ? totals.pct
        : dayReports.length
          ? Math.round(dayReports.reduce((a, r) => a + (r.total ? (r.done / r.total) * 100 : 0), 0) / dayReports.length)
          : 0;
      days.push({
        label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(dt),
        date,
        avg,
        count: dayReports.length,
      });
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.reports, totals.pct]);

  const filteredIssues = useMemo(
    () => (issueFilter === 'semua' ? store.issues : store.issues.filter((i) => i.status === issueFilter)),
    [store.issues, issueFilter],
  );

  const submitIssue = () => {
    if (issueTitle.trim().length < 5) return toast.error('Judul masalah minimal 5 karakter.');
    if (issueDetail.trim().length < 8) return toast.error('Jelaskan masalah lebih detail (min. 8 karakter).');
    store.addIssue(issueTitle, issueDetail, issueSeverity);
    toast.success('Masalah berhasil dilaporkan.', { description: 'Notifikasi terkirim ke Komandan Mispin & Wakil Rahmat.' });
    setIssueOpen(false);
    setIssueTitle(''); setIssueDetail(''); setIssueSeverity('sedang');
  };

  return (
    <div className="space-y-4">
      {/* ===== KEPALA ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20120c] text-[#f5bd4f] shadow-md"><Gauge size={23} /></span>
          <div>
            <h1 className="font-display text-[22px] font-black leading-none text-[#20120c]">Dashboard Kepala Koki</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20120c]/55">Pantau anggota · checklist · masalah — real time</p>
          </div>
        </div>
        <button onClick={() => setIssueOpen(true)} className="flex h-11 items-center gap-1.5 rounded-xl bg-red-700 px-4 text-[10.5px] font-black uppercase tracking-wide text-white shadow-[0_2px_0_#7f1d1d] transition-all hover:bg-red-800 active:translate-y-[2px] active:shadow-none"><AlertOctagon size={16} strokeWidth={2.3} /> Laporkan Masalah</button>
      </div>

      {/* ===== KPI ===== */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Card className="p-3">
          <p className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.16em] text-[#20120c]/50">Checklist Kru <Users size={12} /></p>
          <p className="mt-1.5 font-mono text-[26px] font-bold leading-none text-[#152a46]">{totals.pct}<span className="text-sm">%</span></p>
          <ProgressBar pct={totals.pct} thin className="mt-1.5" />
          <p className="mt-1 font-mono text-[8.5px] font-semibold text-[#20120c]/50">{totals.done}/{totals.total} item selesai</p>
        </Card>
        <Card className="p-3">
          <p className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.16em] text-[#20120c]/50">Menunggu Verifikasi <Clock3 size={12} /></p>
          <p className="mt-1.5 font-mono text-[26px] font-bold leading-none text-amber-600">{pendingVerify.length}</p>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-[#20120c]/55">laporan hari ini{pendingVerify.length > 0 ? ' — perlu dicek!' : ' — semua bersih'}</p>
        </Card>
        <Card className="p-3">
          <p className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.16em] text-[#20120c]/50">Item Perlu Periksa <ListChecks size={12} /></p>
          <p className="mt-1.5 font-mono text-[26px] font-bold leading-none text-amber-700">{periksaCount}</p>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-[#20120c]/55">+ {masalahToday} item bermasalah hari ini</p>
        </Card>
        <Card className="p-3">
          <p className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.16em] text-[#20120c]/50">Masalah Aktif <AlertOctagon size={12} /></p>
          <p className="mt-1.5 font-mono text-[26px] font-bold leading-none text-red-700">{openIssues.length}</p>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-[#20120c]/55">{highIssues > 0 ? <span className="text-red-700">{highIssues} prioritas TINGGI!</span> : 'tidak ada prioritas tinggi'}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* ===== MONITOR ANGGOTA (kiri) ===== */}
        <Card className="p-4 xl:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><Users size={13} /> Monitoring Anggota Hari Ini</p>
            <Link to="/anggota" className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-[#152a46] hover:underline">Semua anggota <ArrowRight size={11} /></Link>
          </div>
          <ul className="mt-2 divide-y divide-black/[0.06]">
            {memberProgress.map(({ member: m, done, total, pct }) => {
              const defs = defsForRole(m.role);
              const masalah = defs.filter((d) => store.getItemState(m.id, d.id, today)?.status === 'masalah').length;
              const periksa = defs.filter((d) => store.getItemState(m.id, d.id, today)?.status === 'periksa').length;
              const rep = todayReports.find((r) => r.userId === m.id);
              return (
                <li key={m.id} className="flex items-center gap-2.5 py-2">
                  <Avatar name={m.name} color={m.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-[11.5px] font-extrabold text-[#20120c]">{m.name.split(' ')[0]}</p>
                      <RoleChip label={ROLE_META[m.role].short} tone={ROLE_TONE[m.role]} />
                      {masalah > 0 && <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-red-800">{masalah} masalah</span>}
                      {periksa > 0 && <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-800">{periksa} periksa</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ProgressBar pct={pct} thin className="w-28 sm:w-36" />
                      <span className="font-mono text-[8.5px] font-bold text-[#20120c]/55">{done}/{total}</span>
                    </div>
                  </div>
                  {rep ? (
                    rep.verified ? (
                      <span title="Laporan terverifikasi"><ShieldCheck size={18} className="shrink-0 text-emerald-600" /></span>
                    ) : (
                      <button onClick={() => { store.verifyReport(rep.id); toast.success(`Laporan ${m.name.split(' ')[0]} terverifikasi.`); }} title="Verifikasi sekarang" aria-label="Verifikasi laporan" className="flex h-7 shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2 text-[8px] font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-700"><BadgeCheck size={11} /> Verif</button>
                    )
                  ) : (
                    <span className="shrink-0 font-mono text-[8px] font-bold uppercase text-black/35">Belum<br />lapor</span>
                  )}
                </li>
              );
            })}
          </ul>

          {/* ===== GRAFIK 7 HARI ===== */}
          <div className="mt-3 border-t border-black/8 pt-3">
            <button onClick={() => setWeekChartOpen((v) => !v)} aria-expanded={weekChartOpen} className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50">Tren Penyelesaian 7 Hari {weekChartOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
            {weekChartOpen && (
              <div className="mt-2 flex h-32 items-end justify-between gap-1.5" role="img" aria-label="Grafik bar rata-rata penyelesaian checklist 7 hari terakhir">
                {week.map((d) => (
                  <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="font-mono text-[8.5px] font-bold text-[#152a46]">{d.avg}%</span>
                    <div className="flex h-[76px] w-full max-w-10 items-end overflow-hidden rounded-t-md bg-black/8">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-700 via-emerald-500 to-green-400 transition-all duration-700" style={{ height: `${Math.max(d.avg, 3)}%` }} />
                    </div>
                    <span className={cx('font-mono text-[8.5px] font-bold uppercase', d.date === today ? 'text-[#20120c] underline underline-offset-2' : 'text-[#20120c]/50')}>{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ===== MASALAH & LAPORAN (kanan) ===== */}
        <Card className="flex flex-col p-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><AlertOctagon size={13} /> Masalah &amp; Temuan <span className="rounded-md bg-red-100 px-1.5 py-0.5 font-mono text-[9px] font-black text-red-800">{openIssues.length}</span></p>
            <div className="flex items-center gap-1">
              {(['semua', 'open', 'progress', 'selesai'] as const).map((f) => (
                <button key={f} onClick={() => setIssueFilter(f)} className={cx('h-7 rounded-lg px-2 text-[8.5px] font-black uppercase tracking-wide transition-all', issueFilter === f ? 'bg-[#152a46] text-white' : 'text-[#20120c]/55 hover:bg-black/5')}>{f === 'semua' ? 'Semua' : f === 'open' ? 'Baru' : f === 'progress' ? 'Diproses' : 'Selesai'}</button>
              ))}
            </div>
          </div>

          <ul className="mt-2 max-h-[300px] min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
            {filteredIssues.map((i) => (
              <li key={i.id} className="rounded-2xl border border-black/8 bg-[#fdfcf9] p-2.5">
                <div className="flex items-start gap-2">
                  <span className={cx('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', SEVERITY_META[i.severity].bar)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold leading-snug text-[#20120c]">{i.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-snug text-[#20120c]/60">{i.detail}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[8px] font-semibold uppercase text-black/40"><span>{i.reporterName.split(' ')[0]}</span><span>{fmtShortID(i.date)} {i.time}</span></p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={cx('rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide', SEVERITY_META[i.severity].cls)}>{SEVERITY_META[i.severity].label}</span>
                      {/* Siklus status */}
                      <button onClick={() => { const order: IssueStatus[] = ['open', 'progress', 'selesai']; const next = order[(order.indexOf(i.status) + 1) % order.length]; store.setIssueStatus(i.id, next); toast.info(`Status: ${STATUS_META[next].label}`); }} title="Ketuk untuk mengubah status" className={cx('rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide transition-all', STATUS_META[i.status].cls)}>
                        {i.status === 'open' && <CircleDot size={8} className="mr-0.5 inline" />}
                        {i.status === 'progress' && <Loader size={8} className="mr-0.5 inline animate-spin" />}
                        {i.status === 'selesai' && <CheckCircle2 size={8} className="mr-0.5 inline" />}
                        {STATUS_META[i.status].label}
                      </button>
                      <button onClick={() => { store.deleteIssue(i.id); toast.info('Masalah dihapus dari daftar.'); }} aria-label="Hapus masalah" className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-black/25 hover:bg-red-50 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {filteredIssues.length === 0 && <li className="py-8 text-center text-[11px] font-semibold text-[#20120c]/40">Tidak ada masalah pada kategori ini.</li>}
          </ul>

          {/* ===== LAPORAN HARI INI ===== */}
          <div className="mt-3 border-t border-black/8 pt-3">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><Flame size={12} /> Laporan Masuk Hari Ini <span className="font-mono text-[#152a46]">{todayReports.length}</span></p>
            {todayReports.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-black/12 bg-black/[.02] px-3 py-3 text-center text-[10px] font-semibold text-black/40">Belum ada laporan terkirim hari ini. Tekan para anggota untuk segera mengirim!</p>
            ) : (
              <ul className="mt-1.5 space-y-1">
                {todayReports.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-2 py-1.5">
                    <Avatar name={r.userName} color={store.users.find((u) => u.id === r.userId)?.color ?? '#334155'} size={24} />
                    <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-[#20120c]/80">{r.userName.split(' ')[0]} — {r.done}/{r.total} item</span>
                    <StatusBadge status={r.masalahCount > 0 ? 'masalah' : r.periksaCount > 0 ? 'periksa' : 'ok'} size="sm" />
                  </li>
                ))}
              </ul>
            )}
            <Link to="/riwayat" className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#152a46]/25 text-[9px] font-black uppercase tracking-[0.16em] text-[#152a46] transition-all hover:bg-[#152a46] hover:text-white">Lihat Semua Riwayat &amp; Ekspor <ArrowRight size={11} /></Link>
          </div>
        </Card>
      </div>

      {/* ===== MODAL LAPORKAN MASALAH ===== */}
      <AnimatePresence>
        {issueOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Laporkan masalah">
            <button className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]" aria-label="Tutup" onClick={() => setIssueOpen(false)} />
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-md rounded-t-3xl bg-[#f8f3ea] p-5 shadow-2xl sm:rounded-3xl">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-[16px] font-black text-[#20120c]"><AlertOctagon size={19} className="text-red-700" /> Laporkan Masalah</p>
                <button onClick={() => setIssueOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-black/45 hover:bg-black/5"><X size={17} /></button>
              </div>
              <label htmlFor="issue-title" className="mb-1 mt-4 block text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/55">Judul / Ringkasan *</label>
              <input id="issue-title" autoFocus value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder="Contoh: Kompor utama bau gas tipis…" className="h-11 w-full rounded-xl border border-black/12 bg-white px-3 text-[12.5px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200" />
              <label htmlFor="issue-detail" className="mb-1 mt-3 block text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/55">Detail Temuan *</label>
              <textarea id="issue-detail" value={issueDetail} onChange={(e) => setIssueDetail(e.target.value)} rows={3} placeholder="Ceritakan detailnya: lokasi, waktu ditemukan, kondisi, langkah sementara yang sudah dilakukan…" className="w-full resize-none rounded-xl border border-black/12 bg-white p-3 text-[12px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200" />
              <span className="mb-1 mt-3 block text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/55">Tingkat Urgensi</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['tinggi', 'sedang', 'rendah'] as IssueSeverity[]).map((s) => (
                  <button key={s} onClick={() => setIssueSeverity(s)} className={cx('h-10 rounded-xl border text-[11px] font-black uppercase tracking-wide transition-all', issueSeverity === s ? (s === 'tinggi' ? 'border-red-700 bg-red-700 text-white' : s === 'sedang' ? 'border-amber-500 bg-amber-400 text-amber-950' : 'border-sky-600 bg-sky-500 text-white') : 'border-black/12 bg-white text-[#20120c]/60')}>{SEVERITY_META[s].label}</button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" onClick={() => setIssueOpen(false)} className="h-11 border border-black/12 bg-white">Batal</Button>
                <Button variant="danger" onClick={submitIssue} className="h-11 flex-1 text-[11px] uppercase tracking-wide"><Plus size={16} strokeWidth={2.6} /> Kirim Laporan Masalah</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
