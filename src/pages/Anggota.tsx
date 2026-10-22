import { useMemo, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Circle,
  ChevronDown,
  ChevronUp,
  ListChecks,
  ShieldCheck,
  Flame,
  Phone,
  NotebookPen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore, canSeeAll, canVerify } from '../lib/store';
import { defsForRole } from '../lib/seed';
import { cx, todayStr } from '../lib/utils';
import { Avatar, Card, ProgressBar, StatusBadge, ROLE_TONE, RoleChip, EmptyState } from '../components/ui';
import { ROLE_META, type Role, type User } from '../lib/types';

export default function Anggota() {
  const store = useStore();
  const user = store.currentUser!;
  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState<'semua' | Role>('semua');
  const [expanded, setExpanded] = useState<string | null>(null);
  const today = todayStr();

  const members = useMemo(() => {
    let list = store.users.filter((u) => u.role !== 'komandan');
    if (roleF !== 'semua') list = list.filter((u) => u.role === roleF);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((u) => [u.name, u.jabatan, u.username].join(' ').toLowerCase().includes(q));
    return list.sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
  }, [store.users, query, roleF]);

  const todayReport = (uid: string) => store.reports.find((r) => r.userId === uid && r.date === today) ?? null;

  return (
    <div className="space-y-4">
      {/* Kepala */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20120c] text-[#f5bd4f] shadow-md"><Users size={23} /></span>
          <div>
            <h1 className="font-display text-[22px] font-black leading-none text-[#20120c]">Anggota Dapur</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20120c]/55">Tugas &amp; status penyelesaian — {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(new Date())}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-[#20120c]/60"><ShieldCheck size={13} className="text-emerald-600" /> {store.users.filter((u) => u.active).length} anggota aktif</div>
      </div>

      {/* Cari & filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#20120c]/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, jabatan, username…" aria-label="Cari anggota" className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-[12px] font-medium outline-none focus:border-[#152a46]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1">
          {(['semua', 'wakil', 'koki', 'goreng'] as const).map((r) => (
            <button key={r} onClick={() => setRoleF(r as 'semua' | Role)} className={cx('h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-wide transition-all', roleF === r ? 'bg-[#152a46] text-white' : 'text-[#20120c]/60 hover:bg-black/5')}>{r === 'semua' ? 'Semua' : ROLE_META[r as Role].short}</button>
          ))}
        </div>
      </div>

      {members.length === 0 && <EmptyState icon={<Users size={42} />} title="Tidak ada anggota ditemukan" sub="Ubah kata pencarian atau filter peran." />}

      {/* ===== GRID ANGGOTA ===== */}
      <div className="grid gap-3 md:grid-cols-2">
        {members.map((m) => <MemberCard key={m.id} member={m} expanded={expanded === m.id} onToggleExpand={() => setExpanded(expanded === m.id ? null : m.id)} today={today} todayReport={todayReport(m.id)} />)}
      </div>
    </div>
  );
}

function MemberCard({ member: m, expanded, onToggleExpand, today, todayReport }: { member: User; expanded: boolean; onToggleExpand: () => void; today: string; todayReport: ReturnType<typeof useStore>['reports'][number] | null }) {
  const store = useStore();
  const viewer = store.currentUser!;
  const defs = useMemo(() => defsForRole(m.role), [m.role]);
  const editor = canSeeAll(viewer); // wakil & koki & komandan bisa pantau rinci

  const { items, done, ok, periksa, masalah, pct } = useMemo(() => {
    const its = defs.map((d) => ({ def: d, st: store.getItemState(m.id, d.id, today) })).filter((x) => x.st) as { def: (typeof defs)[number]; st: NonNullable<ReturnType<typeof store.getItemState>> }[];
    const done = its.length;
    const ok = its.filter((x) => x.st.status === 'ok').length;
    const periksa = its.filter((x) => x.st.status === 'periksa').length;
    const masalah = its.filter((x) => x.st.status === 'masalah').length;
    return { items: its, done, ok, periksa, masalah, pct: defs.length ? Math.round((done / defs.length) * 100) : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defs, m.id, today, store, expanded]);

  const stateTone = pct === 100 ? { label: 'Selesai & Tuntas', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800' } : pct >= 60 ? { label: 'Sedang Berjalan', cls: 'border-sky-300 bg-sky-50 text-sky-800' } : pct > 0 ? { label: 'Baru Mulai', cls: 'border-amber-300 bg-amber-50 text-amber-800' } : { label: 'Belum Ada Aktivitas', cls: 'border-red-300 bg-red-50 text-red-800' };

  return (
    <Card className={cx('flex flex-col p-3.5', !m.active && 'opacity-60 saturate-50')}>
      {/* Kepala kartu */}
      <div className="flex items-start gap-3">
        <Avatar name={m.name} color={m.color} size={52} className="ring-2 ring-[#f5bd4f]/50" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[13px] font-extrabold leading-tight text-[#20120c]">{m.name}</p>
            <RoleChip label={ROLE_META[m.role].short} tone={ROLE_TONE[m.role]} />
          </div>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#20120c]/55">{m.jabatan}</p>
          <p className="mt-0.5 flex items-center gap-1 font-mono text-[8.5px] text-[#20120c]/45"><Phone size={9} />{m.phone || '—'} · Shift {m.shift}{!m.active && ' · NONAKTIF'}</p>
        </div>
        <span className={cx('shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wide', stateTone.cls)}>{stateTone.label}</span>
      </div>

      {/* Progress */}
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar pct={pct} thin className="flex-1" />
        <span className="font-mono text-[10px] font-bold text-[#20120c]/70">{done}/{defs.length}</span>
        <span className={cx('font-mono text-[10px] font-black', pct === 100 ? 'text-emerald-600' : 'text-[#20120c]/55')}>{pct}%</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[8.5px] font-bold">
        <span className="text-emerald-700">{ok} OK</span>
        <span className="text-amber-700">{periksa} Periksa</span>
        <span className="text-red-700">{masalah} Masalah</span>
        {todayReport ? (
          todayReport.verified
            ? <span className="flex items-center gap-0.5 text-emerald-700"><ShieldCheck size={9} />Laporan terverifikasi</span>
            : <span className="flex items-center gap-0.5 text-amber-700"><NotebookPen size={9} />Laporan terkirim — menunggu verifikasi</span>
        ) : <span className="text-black/40">Belum kirim laporan</span>}
      </div>

      {/* Tombol rincian */}
      <button onClick={onToggleExpand} aria-expanded={expanded} className="mt-2.5 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#152a46]/25 text-[9.5px] font-black uppercase tracking-[0.14em] text-[#152a46] transition-all hover:bg-[#152a46] hover:text-white">
        <ListChecks size={14} /> Rincian Tugas Hari Ini {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* ===== RINCIAN ITEM ===== */}
      {expanded && (
        <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-black/8 bg-[#fdfcf9] p-1.5">
          <p className="flex items-center justify-between px-1.5 pb-1 pt-1 text-[8.5px] font-black uppercase tracking-[0.18em] text-[#20120c]/45"><span><Flame size={9} className="mr-1 inline" />{defs.length} tugas {ROLE_META[m.role].short}</span>{editor && <span className="text-amber-800">Mode pantau</span>}</p>
          <ul className="divide-y divide-black/[0.05]">
            {defs.map((d) => {
              const st = store.getItemState(m.id, d.id, today);
              const doneItem = !!st;
              return (
                <li key={d.id} className="flex items-start gap-2 px-1.5 py-1.5">
                  {doneItem ? (st!.status === 'masalah' ? <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-600" /> : st!.status === 'periksa' ? <Circle size={15} className="mt-0.5 shrink-0 fill-amber-300 text-amber-500" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />) : <Circle size={15} className="mt-0.5 shrink-0 text-black/20" />}
                  <div className="min-w-0 flex-1">
                    <p className={cx('text-[10px] font-semibold leading-snug', doneItem ? 'text-[#20120c]/85' : 'text-[#20120c]/45')}>{d.title}</p>
                    {st?.note && <p className="mt-0.5 truncate font-mono text-[8.5px] italic text-amber-800" title={st.note}>“{st.note}”</p>}
                  </div>
                  {st && <StatusBadge status={st.status} size="sm" />}
                  {editor && st && (
                    <button onClick={() => { store.clearItemFor(m.id, d.id, today); toast.info('Centang dibatalkan oleh atasan.'); }} title="Batalkan centang (atasan)" aria-label="Batalkan centang" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[8px] font-black text-black/30 hover:bg-red-50 hover:text-red-600">✕</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
