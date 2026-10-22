import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChefHat,
  Clock3,
  Flame,
  Send,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  ShieldAlert,
  BadgeCheck,
  Sun,
  MoonStar,
  Sunrise,
  PartyPopper,
  FileText,
  Users,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore, canSeeAll } from '../lib/store';
import { BLOCKS, defsForRole } from '../lib/seed';
import { computeProgress, cx, fmtLongID, fmtTime, todayStr } from '../lib/utils';
import { Avatar, BigCheckbox, Button, Card, ProgressBar, StatusBadge } from '../components/ui';
import { ROLE_META, SHIFT_META, type StatusMark } from '../lib/types';

export default function HariIni() {
  const store = useStore();
  const user = store.currentUser!;
  const today = todayStr();
  const defs = useMemo(() => defsForRole(user.role), [user.role]);
  const roleMeta = ROLE_META[user.role];
  const shiftMeta = SHIFT_META[user.shift];
  const ShiftIcon = user.shift === 'Pagi' ? Sunrise : user.shift === 'Siang' ? Sun : MoonStar;

  const itemsMap = useMemo(() => {
    const m: Record<string, ReturnType<typeof store.getItemState>> = {};
    for (const d of defs) m[d.id] = store.getItemState(user.id, d.id, today);
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defs, user.id, today, store]);

  const progress = useMemo(() => {
    const items: Record<string, NonNullable<ReturnType<typeof store.getItemState>>> = {};
    for (const d of defs) if (itemsMap[d.id]) items[d.id] = itemsMap[d.id]!;
    return computeProgress({ items, sentAt: null, verifiedAt: null, verifiedBy: null }, defs.length);
  }, [defs, itemsMap, store]);

  const sentToday = useMemo(
    () => store.reports.find((r) => r.userId === user.id && r.date === today) ?? null,
    [store.reports, user.id, today],
  );

  const [showReport, setShowReport] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [sending, setSending] = useState(false);
  const [sentPulse, setSentPulse] = useState(false);

  useEffect(() => {
    if (sentPulse) {
      const t = setTimeout(() => setSentPulse(false), 2200);
      return () => clearTimeout(t);
    }
  }, [sentPulse]);

  const criticalUnchecked = defs.filter((d) => d.critical && !itemsMap[d.id]);
  const allDone = progress.done === progress.total && progress.total > 0;

  const doSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (progress.done === 0) {
      toast.error('Centang minimal 1 pekerjaan dulu sebelum mengirim laporan.');
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      const rep = store.submitReport(catatan);
      setSending(false);
      if (rep) {
        setShowReport(false);
        setSentPulse(true);
        setCatatan('');
        toast.success('Laporan terkirim ke Kepala Koki!', {
          description: `${rep.done}/${rep.total} item · ${rep.okCount} OK · ${rep.periksaCount} diperiksa · ${rep.masalahCount} masalah. Menunggu verifikasi.`,
        });
      } else {
        toast.error('Gagal mengirim laporan. Coba lagi.');
      }
    }, 650);
  };

  return (
    <div className="space-y-4">
      {/* ============ HERO OPERASIONAL ============ */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[1.25fr_1fr]">
          <div className="relative bg-[#20120c] p-4 text-[#f8f3ea] sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(245,189,79,.16), transparent 42%), radial-gradient(circle at 85% 80%, rgba(245,189,79,.1), transparent 40%)' }} />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#ffd87e]/90">
                <span className="flex items-center gap-1 rounded-md border border-[#f5bd4f]/30 bg-black/30 px-2 py-1"><CalendarDays size={10} />{fmtLongID(today)}</span>
                <span className="flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-950/50 px-2 py-1 text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Toko Buka 06.00–22.00</span>
              </div>
              <h1 className="mt-2.5 font-display text-[24px] font-black leading-[1.06] text-[#f8f3ea] sm:text-[30px]">
                Selamat bertugas,<br />
                <span className="italic text-[#f5bd4f]">{user.name.split(' ')[0]}!</span>
              </h1>
              <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#f8f3ea]/55">{user.jabatan} · {shiftMeta.label} <span className="font-mono normal-case text-[#ffd87e]">({shiftMeta.jam})</span></p>

              {/* Progress besar */}
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f8f3ea]/45">Progress Checklist Hari Ini</p>
                  <p className="mt-0.5 font-mono text-4xl font-bold leading-none text-[#f8f3ea]"><span className="text-emerald-400">{progress.pct}</span><span className="text-lg text-[#f8f3ea]/50">%</span></p>
                  <p className="mt-1 text-[10.5px] font-semibold text-[#f8f3ea]/60">{progress.done} dari {progress.total} pekerjaan selesai</p>
                </div>
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-950/45">
                  <ShiftIcon size={20} className="text-[#ffd87e]" />
                  <span className="mt-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wide text-emerald-300">{user.shift}</span>
                </div>
              </div>
              <ProgressBar pct={progress.pct} className="mt-2.5 bg-white/10" />

              {/* Chip ringkasan status */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                <span className="rounded-md border border-emerald-400/30 bg-emerald-950/50 px-2 py-1 uppercase tracking-wide text-emerald-300">{progress.ok} OK</span>
                <span className="rounded-md border border-amber-400/30 bg-amber-950/50 px-2 py-1 uppercase tracking-wide text-amber-300">{progress.periksa} Diperiksa</span>
                <span className="rounded-md border border-red-400/30 bg-red-950/50 px-2 py-1 uppercase tracking-wide text-red-300">{progress.masalah} Masalah</span>
                {sentToday && <span className="flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-950/50 px-2 py-1 uppercase tracking-wide text-sky-300"><BadgeCheck size={10} /> Terkirim {fmtTime(sentToday.sentAt)}{sentToday.verified && ' · Terverifikasi'}</span>}
              </div>
            </div>
          </div>

          {/* Sisi kanan hero — gambar dapur + CTA */}
          <div className="relative flex min-h-[150px] flex-col justify-end overflow-hidden">
            <img src="/images/dapur-team.jpg" alt="Tim dapur Kampung Kecil sedang memasak dengan wajan" className="absolute inset-0 h-full w-full object-cover object-[62%_30%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#20120c]/95 via-[#20120c]/25 to-transparent md:bg-gradient-to-r md:from-[#20120c] md:via-[#20120c]/30 md:to-transparent" />
            <div className="relative p-4 sm:p-5">
              <p className="font-display text-[15px] font-black italic leading-tight text-[#f8f3ea]">“Ayam gorengnya bikin <span className="text-[#f5bd4f]">nambah</span> terus!”</p>
              <p className="mb-3 mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#ffd87e]/80">Ulasan Google · 4.9 ★ (2.300+ ulasan)</p>
              <Button variant="navy" onClick={() => setShowReport(true)} className="h-12 w-full text-[13px] uppercase tracking-wide">
                <Send size={17} strokeWidth={2.4} /> Kirim ke Kepala Koki
              </Button>
              <p className="mt-1.5 text-center font-mono text-[8.5px] uppercase tracking-wider text-[#f8f3ea]/55">Laporan otomatis tercatat di Riwayat</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============ PERINGATAN ITEM KRITIS ============ */}
      {criticalUnchecked.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/60 bg-amber-50 px-3.5 py-2.5 text-[11px] font-semibold text-amber-900 shadow-sm">
          <ShieldAlert size={18} className="shrink-0 text-amber-600" />
          <span><b>{criticalUnchecked.length} item KRITIS</b> belum dicentang: {criticalUnchecked.slice(0, 2).map((c) => c.title.split('(')[0].trim()).join(' · ')}{criticalUnchecked.length > 2 ? '…' : ''}. Item ini wajib untuk keamanan dapur!</span>
        </div>
      )}

      {/* ============ LEADER STRIP ============ */}
      {canSeeAll(user) && <LeaderStrip today={today} />}

      {/* ============ CHECKLIST PER BLOK ============ */}
      {BLOCKS.map((block) => {
        const blockDefs = defs.filter((d) => d.block === block);
        if (blockDefs.length === 0) return null;
        const done = blockDefs.filter((d) => itemsMap[d.id]).length;
        const complete = done === blockDefs.length;
        const blockMeta = {
          'Persiapan Buka': { icon: Sunrise, desc: '05.30 – 10.00 · Sebelum toko buka', tone: 'text-amber-700' },
          'Operasional': { icon: Flame, desc: '10.00 – 21.00 · Saat jam melayani', tone: 'text-orange-700' },
          'Tutup Toko': { icon: MoonStar, desc: '21.00 – 22.30 · Setelah tutup', tone: 'text-indigo-800' },
        }[block];
        const BlockIcon = blockMeta.icon;
        return (
          <section key={block} aria-label={`Checklist ${block}`}>
            <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#20120c] text-[#f5bd4f]"><BlockIcon size={15} /></span>
                <div>
                  <h2 className="font-display text-[15px] font-black leading-none text-[#20120c]">{block}</h2>
                  <p className={cx('mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.14em]', blockMeta.tone)}>{blockMeta.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cx('rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold', complete ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-black/10 bg-white text-[#20120c]/70')}>{done}/{blockDefs.length}</span>
                <button
                  onClick={() => {
                    blockDefs.forEach((d) => {
                      if (!store.getItemState(user.id, d.id, today)) store.toggleItem(d.id);
                    });
                    toast.success(`Semua item ${block} ditandai OK`);
                  }}
                  className="hidden rounded-lg border border-[#152a46]/25 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wide text-[#152a46] transition-colors hover:bg-[#152a46] hover:text-white sm:block"
                >
                  Semua OK
                </button>
              </div>
            </div>

            <Card className="divide-y divide-black/[0.06]">
              {blockDefs.map((def) => {
                const st = itemsMap[def.id];
                const checked = !!st;
                return (
                  <div key={def.id} className={cx('group p-3 transition-colors sm:p-3.5', checked && 'bg-emerald-50/40')}>
                    <div className="flex items-start gap-3">
                      <BigCheckbox checked={checked} onToggle={() => store.toggleItem(def.id)} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className={cx('text-[13px] font-bold leading-snug transition-colors sm:text-[13.5px]', checked ? 'text-emerald-950' : 'text-[#20120c]')}>{def.title}</p>
                          {def.critical && <span className="flex items-center gap-0.5 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-red-700"><Flame size={9} />Penting</span>}
                        </div>
                        <p className="mt-0.5 text-[10.5px] leading-snug text-[#20120c]/60">{def.detail}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#20120c]/50"><Clock3 size={10} />target {def.time} WIB</span>
                          {checked && st && <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-emerald-700">✓ {fmtTime(st.checkedAt)}</span>}
                          {/* Status cycle badge — ketuk untuk ganti OK → Periksa → Masalah */}
                          <button
                            onClick={() => store.setItemStatus(def.id, nextStatusOf(st?.status))}
                            title="Ketuk untuk mengubah status: OK → Perlu Diperiksa → Masalah"
                            className="transition-transform active:scale-95"
                            aria-label={`Status: ${st?.status ?? 'ok'}. Ketuk untuk mengubah.`}
                          >
                            <StatusBadge status={st?.status ?? 'ok'} size="sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Keterangan di bawah setiap pekerjaan */}
                    <div className="mt-2 pl-[56px]">
                      <input
                        value={st?.note ?? ''}
                        onChange={(e) => store.setItemNote(def.id, e.target.value)}
                        placeholder="Keterangan… (mis. suhu 175°C, ayam 24 potong, tabung A penuh)"
                        aria-label={`Keterangan untuk ${def.title}`}
                        className="h-9 w-full rounded-lg border border-black/10 bg-[#f7f6f8] px-2.5 text-[11px] font-medium text-[#20120c] outline-none transition-all placeholder:text-[#20120c]/35 focus:border-amber-400 focus:bg-amber-50/60 focus:ring-2 focus:ring-amber-300/40"
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>
        );
      })}

      {/* ============ CTA BAWAH ============ */}
      <Card className="flex flex-col items-center gap-2 bg-[#152a46] p-5 text-center text-white sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          {allDone ? <PartyPopper size={34} className="shrink-0 text-[#f5bd4f]" /> : <ClipboardList size={34} className="shrink-0 text-[#f5bd4f]" />}
          <div>
            <p className="font-display text-[15px] font-black text-[#ffd87e]">{allDone ? 'Semua pekerjaan tuntas!' : 'Hampir selesai?'}</p>
            <p className="text-[11px] font-medium text-white/70">{allDone ? 'Laporan menunggu untuk dikirim ke Kepala Koki.' : 'Centang semua pekerjaan, lalu kirim laporanmu.'}</p>
          </div>
        </div>
        <Button variant="gold" onClick={() => setShowReport(true)} className="h-11 shrink-0 px-6 text-[12px] uppercase tracking-wide"><Send size={15} strokeWidth={2.5} /> Kirim ke Kepala Koki</Button>
      </Card>

      {/* ============ MODAL LAPORAN ============ */}
      <AnimatePresence>
        {showReport && (
          <ReportModal
            catatan={catatan}
            setCatatan={setCatatan}
            onClose={() => setShowReport(false)}
            onSubmit={() => doSubmit()}
            sending={sending}
            progress={progress}
            items={defs.filter((d) => itemsMap[d.id]).map((d) => ({ def: d, st: itemsMap[d.id]! }))}
            sentToday={sentToday}
          />
        )}
      </AnimatePresence>

      {/* ============ TOAST SUKSES TERKIRIM (pulse bar) ============ */}
      <AnimatePresence>
        {sentPulse && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed inset-x-4 bottom-[86px] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-700 p-3.5 text-white shadow-2xl lg:bottom-6">
            <BadgeCheck size={30} className="shrink-0 text-emerald-200" />
            <div className="min-w-0">
              <p className="font-display text-[13px] font-black">Laporan berhasil terkirim!</p>
              <p className="text-[10px] font-medium text-emerald-100/85">Kepala Koki Rani akan segera memverifikasi. Cek tab Riwayat.</p>
            </div>
            <Link to="/riwayat" onClick={() => setSentPulse(false)} className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide hover:bg-white/25">Riwayat <ChevronRight size={11} /></Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const nextStatusOf = (s?: StatusMark): StatusMark => (s === 'ok' ? 'periksa' : s === 'periksa' ? 'masalah' : 'ok');

function LeaderStrip({ today }: { today: string }) {
  const store = useStore();
  const members = useMemo(() => store.users.filter((u) => u.active && u.role !== 'wakil'), [store.users]);
  const rows = members.map((u) => {
    const defs = defsForRole(u.role);
    const done = defs.filter((d) => store.getItemState(u.id, d.id, today)).length;
    return { u, done, total: defs.length, pct: defs.length ? Math.round((done / defs.length) * 100) : 0 };
  });
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length) : 0;
  return (
    <Link to="/anggota" className="block">
      <Card className="flex items-center gap-3 p-3 transition-all hover:border-[#152a46]/30 hover:shadow-lg">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#152a46] text-[#ffd87e]"><Users size={21} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-black uppercase tracking-wide text-[#20120c]">Pantau Anggota Dapur <span className="font-mono text-[#152a46]">{avg}%</span></p>
            <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide text-[#152a46]">Detail <ChevronRight size={11} /></span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="-space-x-1.5">{rows.slice(0, 6).map((r) => <Avatar key={r.u.id} name={r.u.name} color={r.u.color} size={22} className="ring-2 ring-white" />)}</div>
            <ProgressBar pct={avg} thin className="flex-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ReportModal({
  catatan,
  setCatatan,
  onClose,
  onSubmit,
  sending,
  progress,
  items,
  sentToday,
}: {
  catatan: string;
  setCatatan: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  sending: boolean;
  progress: { done: number; total: number; pct: number; ok: number; periksa: number; masalah: number };
  items: { def: { title: string; time: string }; st: { status: StatusMark; note: string } }[];
  sentToday: { sentAt: string; verified: boolean } | null;
}) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button aria-label="Tutup" className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 340 }} role="dialog" aria-modal="true" aria-label="Kirim laporan ke Kepala Koki" className="relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-[#f8f3ea] shadow-2xl sm:rounded-3xl">
        {/* Kepala modal */}
        <div className="flex items-center justify-between border-b border-black/10 bg-[#20120c] px-5 py-3.5 text-[#f8f3ea]">
          <div className="flex items-center gap-2.5">
            <ChefHat size={22} className="text-[#f5bd4f]" />
            <div>
              <p className="font-display text-[15px] font-black leading-none text-[#f8f3ea]">Laporan Akhir Shift</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#ffd87e]">Kepada: Koki Kepala · Rani Puspitasari</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#f8f3ea]/60 hover:bg-white/10"><X size={18} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {/* Ringkasan */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[
                { v: `${progress.done}/${progress.total}`, l: 'Selesai', tone: 'text-[#20120c]' },
                { v: String(progress.ok), l: 'OK', tone: 'text-emerald-700' },
                { v: String(progress.periksa), l: 'Diperiksa', tone: 'text-amber-700' },
                { v: String(progress.masalah), l: 'Masalah', tone: 'text-red-700' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-black/8 bg-white px-1 py-2 shadow-sm">
                  <p className={cx('font-mono text-[17px] font-bold leading-none', s.tone)}>{s.v}</p>
                  <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-[#20120c]/50">{s.l}</p>
                </div>
              ))}
            </div>
            <ProgressBar pct={progress.pct} className="mt-2" />
            {sentToday && <p className="mt-1.5 flex items-center gap-1 text-[9.5px] font-semibold text-sky-800"><BadgeCheck size={11} /> Anda sudah mengirim laporan hari ini ({fmtTime(sentToday.sentAt)}). Mengirim lagi akan memperbarui laporan terakhir.</p>}

            {/* Daftar item */}
            <p className="mb-1 mt-3 text-[9.5px] font-black uppercase tracking-[0.18em] text-[#20120c]/50">Rincian Pekerjaan ({items.length})</p>
            <ul className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-black/8 bg-white p-1.5">
              {items.map(({ def, st }) => (
                <li key={def.title} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10.5px]">
                  <StatusBadge status={st.status} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-[#20120c]/85">{def.title}</span>
                  {st.note && <span className="max-w-[38%] truncate font-mono text-[9px] italic text-amber-800" title={st.note}>“{st.note}”</span>}
                </li>
              ))}
              {items.length === 0 && <li className="flex items-center gap-2 px-2 py-3 text-[11px] font-semibold text-red-700"><AlertTriangle size={14} /> Belum ada item yang dicentang.</li>}
            </ul>

            {/* Catatan */}
            <label htmlFor="catatan-laporan" className="mb-1 mt-3 block text-[9.5px] font-black uppercase tracking-[0.18em] text-[#20120c]/50">Catatan untuk Kepala Koki</label>
            <textarea
              id="catatan-laporan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Contoh: ayam sisa 12 potong disimpan di freezer, sambal habis jam 21.00, kulkas display nomor 2 masih kurang dingin…"
              className="w-full resize-none rounded-xl border border-black/10 bg-white p-3 text-[11.5px] font-medium leading-snug text-[#20120c] outline-none transition-all placeholder:text-[#20120c]/35 focus:border-[#152a46] focus:ring-2 focus:ring-[#152a46]/20"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {['Semua aman & sesuai SOP', 'Stok bahan mulai menipis', 'Ada alat bermasalah', 'Pelayanan ramai lancar'].map((t) => (
                <button key={t} type="button" onClick={() => setCatatan(catatan ? `${catatan}. ${t}` : t)} className="rounded-full border border-[#152a46]/25 bg-white px-2 py-1 text-[9px] font-bold text-[#152a46] transition-colors hover:bg-[#152a46] hover:text-white">+ {t}</button>
              ))}
            </div>
          </div>

          {/* Footer aksi */}
          <div className="border-t border-black/10 bg-[#f0ebe1] p-3">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="h-12 border border-black/15 bg-white">Batal</Button>
              <Button variant="navy" type="submit" disabled={sending || items.length === 0} className="h-12 flex-1 text-[13px] uppercase tracking-wide">
                {sending ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Mengirim…</span> : <><Send size={17} strokeWidth={2.4} /> Kirim ke Kepala Koki</>}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
