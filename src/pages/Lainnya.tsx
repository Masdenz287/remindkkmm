import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  UserRound,
  Phone,
  Mail,
  Briefcase,
  KeyRound,
  Bell,
  BellRing,
  Plus,
  Trash2,
  PencilLine,
  Clock3,
  CalendarClock,
  Users,
  Gauge,
  ShieldCheck,
  LogOut,
  X,
  Save,
  CheckCheck,
  RotateCcw,
  Info,
  ChevronRight,
  Store,
  Trash,
  UsersRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore, canManageAccounts, canSeeAll } from '../lib/store';
import { cx, fmtFullID, nowHHMM, timeAgo } from '../lib/utils';
import { Avatar, Button, Card } from '../components/ui';
import { ALL_ROLES, ROLE_META, type Role } from '../lib/types';

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function Lainnya() {
  const store = useStore();
  const user = store.currentUser!;
  const isAdmin = canManageAccounts(user);
  const leader = canSeeAll(user);

  // ===== Profil =====
  const [editing, setEditing] = useState(false);
  const [pName, setPName] = useState(user.name);
  const [pPhone, setPPhone] = useState(user.phone);
  const [pJabatan, setPJabatan] = useState(user.jabatan);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwOpen, setPwOpen] = useState(false);

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (pName.trim().length < 3) return toast.error('Nama minimal 3 karakter.');
    store.updateProfile({ name: pName.trim(), phone: pPhone.trim(), jabatan: pJabatan.trim() });
    setEditing(false);
    toast.success('Profil berhasil diperbarui.');
  };

  const savePw = (e: FormEvent) => {
    e.preventDefault();
    const res = store.changePassword(curPw, newPw);
    if (!res.ok) return toast.error(res.error ?? 'Gagal mengganti password.');
    setCurPw(''); setNewPw(''); setPwOpen(false);
    toast.success('Password berhasil diganti.');
  };

  // ===== Reminder =====
  const [rOpen, setROpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [rTitle, setRTitle] = useState('');
  const [rTime, setRTime] = useState('09:00');
  const [rDays, setRDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [rRoles, setRRoles] = useState<Role[]>([...ALL_ROLES]);

  const openNewReminder = () => { setEditId(null); setRTitle(''); setRTime(nowHHMM()); setRDays([1, 2, 3, 4, 5, 6]); setRRoles([...ALL_ROLES]); setROpen(true); };
  const openEditReminder = (r: (typeof store.reminders)[number]) => { setEditId(r.id); setRTitle(r.title); setRTime(r.time); setRDays([...r.days]); setRRoles([...r.roles]); setROpen(true); };

  const saveReminder = (e: FormEvent) => {
    e.preventDefault();
    if (!rTitle.trim() || rTitle.trim().length < 5) return toast.error('Judul reminder minimal 5 karakter.');
    if (rDays.length === 0) return toast.error('Pilih minimal 1 hari aktif.');
    if (rRoles.length === 0) return toast.error('Pilih minimal 1 peran penerima.');
    store.saveReminder({ id: editId ?? undefined, title: rTitle.trim(), time: rTime, days: [...rDays].sort(), roles: rRoles, active: true });
    setROpen(false);
    toast.success(editId ? 'Reminder diperbarui.' : 'Reminder baru tersimpan.', { description: `Berbunyi ${rTime} WIB setiap ${rDays.length === 7 ? 'hari' : 'hari terpilih'} — notifikasi otomatis di aplikasi.` });
  };

  const myReminders = useMemo(() => [...store.reminders].sort((a, b) => a.time.localeCompare(b.time)), [store.reminders]);

  // ===== Notifikasi =====
  const myNotifs = useMemo(
    () => store.notifications.filter((n) => (n.roles === 'all' || (n.roles as Role[]).includes(user.role)) && (!n.userId || n.userId === user.id)),
    [store.notifications, user],
  );
  const unread = myNotifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Kepala */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20120c] text-[#f5bd4f] shadow-md"><Menu size={23} /></span>
        <div>
          <h1 className="font-display text-[22px] font-black leading-none text-[#20120c]">Lainnya</h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20120c]/55">Profil · Reminder · Notifikasi · Pengaturan</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ============ PROFIL ============ */}
        <Card className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><UserRound size={13} /> Profil Saya</p>
            {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg border border-[#152a46]/25 px-2 py-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#152a46] hover:bg-[#152a46] hover:text-white"><PencilLine size={12} /> Edit</button>}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={user.name} color={user.color} size={64} className="ring-4 ring-[#f5bd4f]/40" />
            <div className="min-w-0">
              <p className="font-display text-[17px] font-black leading-tight text-[#20120c]">{user.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">{user.jabatan}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-[#20120c] px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#f5bd4f]">{ROLE_META[user.role].label}</span>
                <span className="rounded-md border border-black/12 bg-white px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-[#20120c]/65">Shift {user.shift}</span>
              </div>
            </div>
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-3 space-y-2">
              <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Nama lengkap" aria-label="Nama" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] font-medium outline-none focus:border-[#152a46]" />
              <input value={pJabatan} onChange={(e) => setPJabatan(e.target.value)} placeholder="Jabatan" aria-label="Jabatan" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] font-medium outline-none focus:border-[#152a46]" />
              <input value={pPhone} onChange={(e) => setPPhone(e.target.value)} placeholder="No. HP" aria-label="No HP" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] font-medium outline-none focus:border-[#152a46]" inputMode="tel" />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setEditing(false); setPName(user.name); setPJabatan(user.jabatan); setPPhone(user.phone); }} className="h-9 border border-black/12 bg-white text-[10px]"><X size={13} /> Batal</Button>
                <Button variant="navy" type="submit" className="h-9 flex-1 text-[10px] uppercase tracking-wide"><Save size={13} /> Simpan</Button>
              </div>
            </form>
          ) : (
            <ul className="mt-3 space-y-1.5 text-[11px] font-semibold text-[#20120c]/70">
              <li className="flex items-center gap-2"><Mail size={13} className="text-[#152a46]" />{user.email}</li>
              <li className="flex items-center gap-2"><Phone size={13} className="text-[#152a46]" />{user.phone || '—'} <span className="font-mono text-[9px] text-black/40">(username: {user.username})</span></li>
              <li className="flex items-center gap-2"><Briefcase size={13} className="text-[#152a46]" />Bergabung sejak {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(user.joinDate + 'T00:00:00'))}</li>
            </ul>
          )}

          {/* Ganti password */}
          <div className="mt-3 border-t border-black/8 pt-3">
            <button onClick={() => setPwOpen((v) => !v)} className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#152a46] hover:underline"><KeyRound size={13} /> Ganti Password {pwOpen ? '▴' : '▾'}</button>
            <AnimatePresence>
              {pwOpen && (
                <motion.form key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={savePw} className="overflow-hidden">
                  <div className="mt-2 flex gap-2">
                    <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="Password lama" aria-label="Password lama" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] outline-none focus:border-[#152a46]" />
                    <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Password baru (min. 6)" aria-label="Password baru" className="h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] outline-none focus:border-[#152a46]" />
                    <Button variant="navy" type="submit" className="h-10 shrink-0 px-4 text-[10px] uppercase"><Save size={13} /></Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* ============ LINK CEPAT ============ */}
        <Card className="p-4">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><Menu size={13} /> Menu Cepat</p>
          <div className="mt-2 divide-y divide-black/[0.06]">
            {isAdmin && (
              <Link to="/akun" className="flex items-center gap-3 py-2.5 transition-colors hover:bg-black/[.03]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-700"><UsersRound size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold text-[#20120c]">Kelola Akun Anggota</span><span className="text-[9.5px] font-semibold text-[#20120c]/55">Tambah, edit, nonaktifkan &amp; reset password — khusus Komandan</span></span><ChevronRight size={16} className="text-black/30" /></Link>
            )}
            {leader && (
              <>
                <Link to="/anggota" className="flex items-center gap-3 py-2.5 transition-colors hover:bg-black/[.03]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Users size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold text-[#20120c]">Anggota Dapur</span><span className="text-[9.5px] font-semibold text-[#20120c]/55">Tugas &amp; status penyelesaian seluruh kru</span></span><ChevronRight size={16} className="text-black/30" /></Link>
                <Link to="/kepala-koki" className="flex items-center gap-3 py-2.5 transition-colors hover:bg-black/[.03]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Gauge size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold text-[#20120c]">Dashboard Kepala Koki</span><span className="text-[9.5px] font-semibold text-[#20120c]/55">Pantau anggota, checklist &amp; masalah real-time</span></span><ChevronRight size={16} className="text-black/30" /></Link>
              </>
            )}
            <Link to="/riwayat" className="flex items-center gap-3 py-2.5 transition-colors hover:bg-black/[.03]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCheck size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold text-[#20120c]">Riwayat Laporan</span><span className="text-[9.5px] font-semibold text-[#20120c]/55">Filter &amp; ekspor PDF / Excel</span></span><ChevronRight size={16} className="text-black/30" /></Link>
            <Link to="/kunjungan" className="flex items-center gap-3 py-2.5 transition-colors hover:bg-black/[.03]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-700"><ShieldCheck size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold text-[#20120c]">Kunjungan Audit</span><span className="text-[9.5px] font-semibold text-[#20120c]/55">Inspeksi dinkes, pengawas &amp; tamu</span></span><ChevronRight size={16} className="text-black/30" /></Link>
          </div>
          {/* Info restoran */}
          <div className="mt-2 rounded-2xl bg-[#20120c] p-3 text-[#f8f3ea]">
            <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#f5bd4f]"><Store size={11} /> Restoran</p>
            <p className="mt-1 font-display text-[14px] font-black leading-tight">Kampung Kecil Metropolitan Bekasi</p>
            <p className="mt-0.5 text-[9.5px] font-medium leading-snug text-[#f8f3ea]/65">Jl. Raya Metropolitan No. 88, Bekasi Barat · (021) 889-02288<br />Buka setiap hari 06.00 – 22.00 WIB · Halal MUI · PIRT-P-206-25-05-2278</p>
            <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[#ffd87e]/70">“Rasanya ngeraja, harganya ngerakyat.”</p>
          </div>
        </Card>
      </div>

      {/* ============ REMINDER ============ */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><BellRing size={13} /> Reminder Berjadwal {isAdmin ? '(dikelola Admin)' : '(atur dengan Komandan)'}</p>
            <p className="mt-0.5 text-[9px] font-semibold text-[#20120c]/45">Notifikasi otomatis muncul di aplikasi tepat pada waktunya — setiap hari atau hari tertentu.</p>
          </div>
          {isAdmin && <Button variant="gold" onClick={openNewReminder} className="h-9 text-[10px] uppercase tracking-wide"><Plus size={14} strokeWidth={2.7} /> Reminder Baru</Button>}
        </div>

        {/* Form reminder */}
        <AnimatePresence>
          {rOpen && (
            <motion.form key="rf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={saveReminder} className="overflow-hidden">
              <div className="mt-3 rounded-2xl border border-[#f5bd4f]/60 bg-[#fdf6e3] p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#7a4a12]"><CalendarClock size={12} /> {editId ? 'Ubah Reminder' : 'Reminder Baru'}</p>
                <input autoFocus value={rTitle} onChange={(e) => setRTitle(e.target.value)} placeholder="Contoh: Cek minyak goreng — jam sibuk mendekat…" aria-label="Judul reminder" className="h-10 w-full rounded-xl border border-amber-300/70 bg-white px-3 text-[12px] font-medium outline-none focus:border-amber-500" />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wide text-[#7a4a12]"><Clock3 size={12} /> Pukul <input type="time" value={rTime} onChange={(e) => setRTime(e.target.value)} className="h-9 rounded-lg border border-amber-300/70 bg-white px-2 font-mono text-[12px] font-bold outline-none" /></label>
                  <div className="flex items-center gap-1">{DAY_LABELS.map((d, i) => (<button key={d} type="button" onClick={() => setRDays((arr) => arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i])} className={cx('h-8 w-8 rounded-lg border text-[9px] font-black uppercase transition-all', rDays.includes(i) ? 'border-amber-600 bg-amber-500 text-white shadow-sm' : 'border-amber-300/70 bg-white text-amber-900/60 hover:border-amber-500')}>{d}</button>))}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wide text-[#7a4a12]">Untuk:</span>
                  {ALL_ROLES.map((r) => (<button key={r} type="button" onClick={() => setRRoles((arr) => arr.includes(r) ? arr.filter((x) => x !== r) : [...arr, r])} className={cx('rounded-full border px-2 py-1 text-[8.5px] font-black uppercase tracking-wide transition-all', rRoles.includes(r) ? 'border-[#152a46] bg-[#152a46] text-[#ffd87e]' : 'border-black/15 bg-white text-[#20120c]/55')}>{ROLE_META[r].short}</button>))}
                </div>
                <div className="mt-2.5 flex gap-2">
                  <Button variant="ghost" onClick={() => setROpen(false)} className="h-9 border border-black/12 bg-white text-[10px]"><X size={13} /> Batal</Button>
                  <Button variant="gold" type="submit" className="h-9 flex-1 text-[10.5px] uppercase tracking-wide"><Save size={13} /> {editId ? 'Simpan Perubahan' : 'Terbitkan Reminder'}</Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Daftar reminder */}
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {myReminders.map((r) => (
            <li key={r.id} className={cx('flex items-start gap-2.5 rounded-2xl border p-2.5 transition-all', r.active ? 'border-black/10 bg-[#fdfcf9]' : 'border-black/8 bg-black/[.03] opacity-55')}>
              <button onClick={() => store.toggleReminder(r.id)} role="switch" aria-checked={r.active} aria-label={r.active ? 'Nonaktifkan' : 'Aktifkan'} className={cx('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', r.active ? 'bg-emerald-600' : 'bg-black/20')}>
                <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', r.active ? 'left-[22px]' : 'left-0.5')} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold leading-snug text-[#20120c]">{r.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[8px] font-semibold uppercase tracking-wide text-[#20120c]/50"><span className="flex items-center gap-0.5"><Clock3 size={9} />{r.time} WIB</span><span>{r.days.length === 7 ? 'Setiap hari' : r.days.map((d) => DAY_LABELS[d]).join(' ')}</span><span>{r.roles.length === 4 ? 'Semua' : r.roles.map((x) => ROLE_META[x].short).join('·')}</span></p>
              </div>
              {isAdmin && (
                <div className="flex shrink-0 flex-col gap-1">
                  <button onClick={() => openEditReminder(r)} aria-label="Ubah" className="flex h-7 w-7 items-center justify-center rounded-lg text-black/35 hover:bg-black/5 hover:text-[#152a46]"><PencilLine size={14} /></button>
                  <button onClick={() => { store.deleteReminder(r.id); toast.info('Reminder dihapus.'); }} aria-label="Hapus" className="flex h-7 w-7 items-center justify-center rounded-lg text-black/35 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* ============ NOTIFIKASI ============ */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#20120c]/50"><Bell size={13} /> Notifikasi Saya {unread > 0 && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[8.5px] text-white">{unread} belum dibaca</span>}</p>
          <div className="flex items-center gap-1.5">
            <button onClick={store.markAllNotifRead} className="flex h-8 items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 text-[9px] font-bold uppercase tracking-wide text-emerald-800 hover:bg-emerald-100"><CheckCheck size={12} /> Tandai semua</button>
            <button onClick={store.clearNotifications} className="flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 text-[9px] font-bold uppercase tracking-wide text-red-800 hover:bg-red-100"><Trash size={12} /> Bersihkan</button>
          </div>
        </div>
        {myNotifs.length === 0 ? (
          <p className="py-6 text-center text-[11px] font-semibold text-[#20120c]/45">Bersih! Tidak ada notifikasi.</p>
        ) : (
          <ul className="mt-2 max-h-80 divide-y divide-black/[0.06] overflow-y-auto">
            {myNotifs.map((n) => (
              <li key={n.id} className="flex items-start gap-2.5 py-2">
                <span className={cx('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-black', n.type === 'masalah' && 'bg-red-100 text-red-700', n.type === 'terlambat' && 'bg-amber-100 text-amber-800', n.type === 'reminder' && 'bg-sky-100 text-sky-800', n.type === 'laporan' && 'bg-emerald-100 text-emerald-800', n.type === 'info' && 'bg-violet-100 text-violet-800')}>{n.type === 'masalah' ? '!' : n.type === 'terlambat' ? '⏰' : n.type === 'reminder' ? '🔔' : n.type === 'laporan' ? '✓' : 'i'}</span>
                <div className="min-w-0 flex-1">
                  <p className={cx('text-[10.5px] font-bold leading-snug', n.read ? 'text-[#20120c]/55' : 'text-[#20120c]')}>{n.title}</p>
                  <p className="text-[9px] leading-snug text-[#20120c]/50">{n.body}</p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase text-black/35">{timeAgo(n.time)}</p>
                </div>
                <button onClick={() => store.deleteNotification(n.id)} aria-label="Hapus notifikasi" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-black/25 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ============ ZONA DEMO & KELUAR ============ */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Card className="flex flex-1 items-center gap-3 border-dashed p-3">
          <Info size={18} className="shrink-0 text-[#152a46]" />
          <p className="min-w-0 flex-1 text-[10px] font-semibold leading-snug text-[#20120c]/60"><b>Mode Demo.</b> Data tersimpan di perangkat ini (localStorage) mengikuti arsitektur PostgreSQL/Supabase pada versi produksi.</p>
          <button onClick={() => { if (confirm('Kembalikan seluruh data ke kondisi awal demo?')) { store.resetDemoData(); toast.success('Data demo dipulihkan.'); } }} className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-black/15 px-2.5 text-[9px] font-black uppercase tracking-wide text-[#20120c]/65 hover:bg-black/5"><RotateCcw size={12} /> Reset</button>
        </Card>
        <button onClick={store.logout} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-800/25 bg-red-50 font-display text-[13px] font-black uppercase tracking-wide text-red-800 transition-all hover:border-red-800 hover:bg-red-100"><LogOut size={18} /> Keluar dari Aplikasi</button>
      </div>
    </div>
  );
}
