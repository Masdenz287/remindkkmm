import { FormEvent, useMemo, useState } from 'react';
import {
  ClipboardCheck,
  Star,
  Plus,
  X,
  CalendarDays,
  UserRound,
  Building2,
  Trash2,
  TrendingUp,
  BadgeCheck,
  NotebookPen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore, canSeeAll } from '../lib/store';
import { cx, fmtLongID, todayStr } from '../lib/utils';
import { Button, Card, EmptyState } from '../components/ui';

const AREA_PRESETS = [
  'Kebersihan Area Dapur',
  'Suhu & Penyimpanan Bahan',
  'Personal Hygiene Kru',
  'Tanggal Kedaluwarsa / FIFO',
  'Kesiapan Alat & Gas',
  'Standar Porsi & Resep',
  'Dokumen & Log Harian',
  'Manajemen Sampah',
];

export default function Kunjungan() {
  const store = useStore();
  const user = store.currentUser!;
  const canEdit = canSeeAll(user);

  const [showForm, setShowForm] = useState(false);
  const [visitor, setVisitor] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState('');
  const [areas, setAreas] = useState<{ name: string; score: number }[]>(
    AREA_PRESETS.slice(0, 6).map((name) => ({ name, score: 4 })),
  );
  const [customArea, setCustomArea] = useState('');

  const sorted = useMemo(() => [...store.visits].sort((a, b) => b.date.localeCompare(a.date)), [store.visits]);
  const avgAll = useMemo(
    () => (sorted.length ? (sorted.reduce((a, v) => a + v.overall, 0) / sorted.length).toFixed(1) : '—'),
    [sorted],
  );

  const overall = areas.length ? Math.round(areas.reduce((a, x) => a + x.score, 0) / areas.length) : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!visitor.trim()) return toast.error('Isi nama tamu / pengunjung.');
    if (!purpose.trim()) return toast.error('Isi tujuan kunjungan.');
    store.addVisit({ date, visitor: visitor.trim(), purpose: purpose.trim(), areas: areas.map((a) => ({ area: a.name, score: a.score })), overall, notes: notes.trim() });
    toast.success('Kunjungan audit tersimpan.', { description: `Skor keseluruhan: ${overall}/5 — ${overall >= 4 ? 'Sangat baik!' : 'Perlu perbaikan.'}` });
    setShowForm(false);
    setVisitor(''); setPurpose(''); setNotes('');
    setAreas(AREA_PRESETS.slice(0, 6).map((name) => ({ name, score: 4 })));
  };

  const setScore = (idx: number, score: number) => setAreas((arr) => arr.map((a, i) => (i === idx ? { ...a, score } : a)));
  const removeArea = (idx: number) => setAreas((arr) => arr.filter((_, i) => i !== idx));
  const addCustomArea = () => {
    const t = customArea.trim();
    if (!t) return;
    setAreas((arr) => [...arr, { name: t, score: 4 }]);
    setCustomArea('');
  };

  return (
    <div className="space-y-4">
      {/* Kepala */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20120c] text-[#f5bd4f] shadow-md"><ClipboardCheck size={23} /></span>
          <div>
            <h1 className="font-display text-[22px] font-black leading-none text-[#20120c]">Kunjungan Audit</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20120c]/55">Inspeksi tamu, dinkes &amp; konsultan · {sorted.length} kunjungan</p>
          </div>
        </div>
        {canEdit && (
          <Button variant="navy" onClick={() => setShowForm((v) => !v)} className="h-11 text-[11px] uppercase tracking-wide">
            {showForm ? <><X size={16} /> Tutup Form</> : <><Plus size={16} strokeWidth={2.6} /> Catat Kunjungan</>}
          </Button>
        )}
      </div>

      {/* Ringkasan skor */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="font-mono text-[22px] font-bold leading-none text-[#20120c]">{sorted.length}</p>
          <p className="mt-1 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#20120c]/50">Total Kunjungan</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="flex items-center justify-center gap-1 font-mono text-[22px] font-bold leading-none text-amber-600"><Star size={16} fill="currentColor" />{avgAll}</p>
          <p className="mt-1 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#20120c]/50">Rata-rata Skor /5</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-mono text-[22px] font-bold leading-none text-[#152a46]">{sorted.length ? Math.max(...sorted.map((v) => v.overall)) : 0}/5</p>
          <p className="mt-1 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#20120c]/50">Skor Tertinggi</p>
        </Card>
      </div>

      {/* ===== FORM TAMBAH ===== */}
      <AnimatePresence>
        {showForm && (
          <motion.form key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={submit} className="overflow-hidden">
            <Card className="border-[#f5bd4f]/50 p-4">
              <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#7a4a12]"><NotebookPen size={14} /> Form Kunjungan Audit</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor="v-visitor" className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[#20120c]/55">Tamu / Pengunjung *</label>
                  <input id="v-visitor" value={visitor} onChange={(e) => setVisitor(e.target.value)} placeholder="Pak H. Darmawan (Pengawas PT…)" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] font-medium outline-none focus:border-[#152a46]" />
                </div>
                <div>
                  <label htmlFor="v-date" className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[#20120c]/55">Tanggal</label>
                  <input id="v-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 font-mono text-[12px] font-medium outline-none focus:border-[#152a46]" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="v-purpose" className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[#20120c]/55">Tujuan Kunjungan *</label>
                  <input id="v-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Audit kebersihan & sanitasi bulanan…" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] font-medium outline-none focus:border-[#152a46]" />
                </div>
              </div>

              {/* Skor per area */}
              <p className="mb-1.5 mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/55">Penilaian per Area (ketuk bintang)</p>
              <ul className="space-y-1">
                {areas.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl border border-black/8 bg-[#fdfcf9] px-2.5 py-1.5">
                    <span className="min-w-0 flex-1 text-[10.5px] font-semibold leading-tight text-[#20120c]/85">{a.name}</span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setScore(i, s)} aria-label={`Skor ${s}`} className="p-0.5 transition-transform hover:scale-125">
                          <Star size={17} strokeWidth={1.5} className={s <= a.score ? 'fill-amber-400 text-amber-500' : 'text-black/20'} />
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => removeArea(i)} aria-label="Hapus area" className="shrink-0 text-black/25 hover:text-red-600"><X size={14} /></button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-1.5">
                <input value={customArea} onChange={(e) => setCustomArea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomArea())} placeholder="Tambah area lain…" className="h-9 flex-1 rounded-lg border border-black/10 bg-white px-2.5 text-[11px] outline-none focus:border-[#152a46]" />
                <Button variant="outline" onClick={addCustomArea} className="h-9 px-3 text-[10px]"><Plus size={13} /> Tambah</Button>
              </div>

              <label htmlFor="v-notes" className="mb-1 mt-3 block text-[9px] font-black uppercase tracking-wider text-[#20120c]/55">Catatan &amp; Rekomendasi</label>
              <textarea id="v-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Temuan &amp; rekomendasi perbaikan…" className="w-full resize-none rounded-xl border border-black/10 bg-[#f7f6f8] p-3 text-[11.5px] font-medium outline-none focus:border-[#152a46]" />

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold text-[#20120c]/60">Skor keseluruhan: <span className="font-mono text-[14px] font-black text-amber-600">{overall}/5</span></p>
                <Button variant="navy" type="submit" className="h-11 px-6 text-[11px] uppercase tracking-wide"><BadgeCheck size={16} /> Simpan Kunjungan</Button>
              </div>
            </Card>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ===== DAFTAR KUNJUNGAN ===== */}
      {sorted.length === 0 ? (
        <EmptyState icon={<Building2 size={44} />} title="Belum ada kunjungan audit" sub="Catat kunjungan dinkes, pengawas, atau konsultan di sini." />
      ) : (
        <ul className="space-y-3">
          {sorted.map((v) => (
            <li key={v.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#fdf6e3] text-amber-700 ring-1 ring-amber-300">
                      <span className="font-mono text-[15px] font-black leading-none">{v.overall}</span>
                      <Star size={10} fill="currentColor" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-extrabold leading-snug text-[#20120c]">{v.visitor}</p>
                      <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#20120c]/70">{v.purpose}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#20120c]/50">
                        <span className="flex items-center gap-1"><CalendarDays size={10} />{fmtLongID(v.date)}</span>
                        <span className="flex items-center gap-1"><TrendingUp size={10} />Rata-rata {v.areas.length} area dinilai</span>
                      </p>
                    </div>
                  </div>
                  {canEdit && <button onClick={() => { if (confirm('Hapus catatan kunjungan ini?')) { store.deleteVisit(v.id); toast.info('Kunjungan dihapus.'); } }} aria-label="Hapus kunjungan" className="flex h-8 w-8 items-center justify-center rounded-lg text-black/25 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>}
                </div>

                {/* Bar skor area */}
                <div className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                  {v.areas.map((a) => (
                    <div key={a.area} className="flex items-center gap-2">
                      <span className="w-40 shrink-0 truncate text-[9px] font-bold text-[#20120c]/60" title={a.area}>{a.area}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
                        <div className={cx('h-full rounded-full transition-all', a.score >= 4 ? 'bg-emerald-500' : a.score === 3 ? 'bg-amber-400' : 'bg-red-500')} style={{ width: `${(a.score / 5) * 100}%` }} />
                      </div>
                      <span className="w-6 shrink-0 text-right font-mono text-[9px] font-bold text-[#20120c]/60">{a.score}</span>
                    </div>
                  ))}
                </div>

                {v.notes && (
                  <div className="mt-3 rounded-xl border border-amber-300/50 bg-amber-50/60 px-3 py-2 text-[10.5px] font-medium leading-snug text-amber-950">
                    <UserRound size={11} className="mr-1 inline text-amber-700" /><b>Catatan:</b> {v.notes}
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
