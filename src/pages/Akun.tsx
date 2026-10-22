import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersRound,
  Search,
  Plus,
  X,
  PencilLine,
  Trash2,
  KeyRound,
  ShieldCheck,
  ShieldOff,
  Crown,
  Save,
  Phone,
  Mail,
  AtSign,
  Copy,
  Sunrise,
  Sun,
  MoonStar,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { cx, initials, todayStr } from '../lib/utils';
import { Avatar, Button, Card, ROLE_TONE, RoleChip } from '../components/ui';
import { ALL_ROLES, ROLE_META, type Role, type Shift, type User } from '../lib/types';
// User diimpor sebagai tipe saja di atas; digunakan pada useState<User | null>

export default function Akun() {
  const store = useStore();
  const user = store.currentUser!;
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'komandan') navigate('/', { replace: true });
  }, [user.role, navigate]);

  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState<'semua' | Role>('semua');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [tempPw, setTempPw] = useState<{ name: string; pw: string } | null>(null);

  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', password: '',
    role: 'goreng' as Role, shift: 'Pagi' as Shift, jabatan: '',
  });

  const filtered = useMemo(() => {
    let list = [...store.users];
    if (roleF !== 'semua') list = list.filter((u) => u.role === roleF);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((u) => [u.name, u.username, u.email, u.jabatan, u.phone].join(' ').toLowerCase().includes(q));
    const order: Role[] = ['komandan', 'wakil', 'koki', 'goreng'];
    return list.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || a.name.localeCompare(b.name));
  }, [store.users, query, roleF]);

  const counts = useMemo(() => ({
    total: store.users.length,
    aktif: store.users.filter((u) => u.active).length,
    nonaktif: store.users.filter((u) => !u.active).length,
  }), [store.users]);

  const openNew = () => {
    setEditUser(null);
    setForm({ name: '', username: '', email: '', phone: '', password: '', role: 'goreng', shift: 'Pagi', jabatan: '' });
    setShowForm(true);
  };
  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, username: u.username, email: u.email, phone: u.phone, password: '', role: u.role, shift: u.shift, jabatan: u.jabatan });
    setShowForm(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return toast.error('Nama minimal 3 karakter.');
    if (!/^[a-z0-9_.]{3,}$/i.test(form.username.trim())) return toast.error('Username minimal 3 karakter (huruf/angka/titik/underscore).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error('Format email tidak valid.');
    const dupUser = store.users.find((u) => u.username.toLowerCase() === form.username.trim().toLowerCase() && u.id !== editUser?.id);
    if (dupUser) return toast.error('Username sudah dipakai anggota lain.');
    const dupEmail = store.users.find((u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editUser?.id);
    if (dupEmail) return toast.error('Email sudah terdaftar.');

    if (editUser) {
      store.updateAccount(editUser.id, {
        name: form.name.trim(), username: form.username.trim().toLowerCase(), email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(), role: form.role, shift: form.shift, jabatan: form.jabatan.trim() || ROLE_META[form.role].label,
      });
      toast.success('Data akun diperbarui.');
    } else {
      if (form.password.length < 6) return toast.error('Password minimal 6 karakter.');
      store.addAccount({
        name: form.name.trim(), username: form.username.trim().toLowerCase(), email: form.email.trim().toLowerCase(),
        password: form.password, role: form.role, shift: form.shift, phone: form.phone.trim(),
        jabatan: form.jabatan.trim() || (form.role === 'goreng' ? `Goreng — Shift ${form.shift}` : ROLE_META[form.role].label),
      });
      toast.success('Akun baru dibuat.', { description: `${form.name.split(' ')[0]} sekarang bisa login dengan username “${form.username.trim().toLowerCase()}”.` });
    }
    setShowForm(false);
  };

  const doReset = (u: User) => {
    const pw = store.resetPassword(u.id);
    setTempPw({ name: u.name, pw });
    toast.info('Password di-reset. Berikan password sementara ke anggota.');
  };

  const fieldCls = 'h-10 w-full rounded-xl border border-black/10 bg-[#f7f6f8] px-3 text-[12px] font-medium outline-none focus:border-[#152a46] focus:ring-2 focus:ring-[#152a46]/15';

  return (
    <div className="space-y-4">
      {/* Kepala */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#20120c] text-[#f5bd4f] shadow-md"><UsersRound size={23} /></span>
          <div>
            <h1 className="font-display text-[22px] font-black leading-none text-[#20120c]">Kelola Akun Anggota</h1>
            <p className="mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-800"><Crown size={11} /> Khusus Komandan Mispin</p>
          </div>
        </div>
        <Button variant="gold" onClick={openNew} className="h-11 text-[11px] uppercase tracking-wide"><Plus size={16} strokeWidth={2.7} /> Anggota Baru</Button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: counts.total, l: 'Total Akun', tone: 'text-[#20120c]' },
          { v: counts.aktif, l: 'Aktif', tone: 'text-emerald-700' },
          { v: counts.nonaktif, l: 'Nonaktif', tone: 'text-red-700' },
        ].map((s) => (
          <Card key={s.l} className="p-3 text-center"><p className={cx('font-mono text-[22px] font-bold leading-none', s.tone)}>{s.v}</p><p className="mt-1 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#20120c]/50">{s.l}</p></Card>
        ))}
      </div>

      {/* ===== FORM TAMBAH/EDIT ===== */}
      <AnimatePresence>
        {showForm && (
          <motion.form key="af" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={submit} className="overflow-hidden">
            <Card className="border-amber-400/60 p-4 ring-1 ring-amber-300/50">
              <p className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-[#7a4a12]">{editUser ? `Edit Akun — ${editUser.name}` : 'Buat Akun Anggota Baru'}<button type="button" onClick={() => setShowForm(false)} className="text-black/40 hover:text-black"><X size={17} /></button></p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap *" aria-label="Nama" className={cx(fieldCls, 'sm:col-span-2')} autoFocus />
                <div className="relative"><AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" /><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username *" aria-label="Username" className={cx(fieldCls, 'pl-9')} autoCapitalize="none" /></div>
                <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="No. HP" aria-label="No HP" className={cx(fieldCls, 'pl-9')} inputMode="tel" /></div>
                <div className="relative sm:col-span-2"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *" aria-label="Email" className={cx(fieldCls, 'pl-9')} autoCapitalize="none" /></div>
                <input value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} placeholder="Jabatan (contoh: Goreng 2 — Pagi)" aria-label="Jabatan" className={cx(fieldCls, 'sm:col-span-2')} />
                {!editUser && <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password awal (min. 6 karakter) *" aria-label="Password awal" className={cx(fieldCls, 'sm:col-span-2')} autoComplete="new-password" />}
                {/* Peran */}
                <div className="sm:col-span-2">
                  <span className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[#20120c]/55">Peran</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ALL_ROLES.map((r) => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} className={cx('rounded-xl border px-1.5 py-2 text-[9px] font-black uppercase leading-tight tracking-wide transition-all', form.role === r ? 'border-[#152a46] bg-[#152a46] text-[#ffd87e] shadow-md' : 'border-black/12 bg-white text-[#20120c]/60 hover:border-[#152a46]/50')}>{ROLE_META[r].short}</button>
                    ))}
                  </div>
                </div>
                {/* Shift */}
                <div className="sm:col-span-2">
                  <span className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[#20120c]/55">Shift</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([['Pagi', Sunrise], ['Siang', Sun], ['Malam', MoonStar]] as [Shift, typeof Sun][]).map(([s, Icon]) => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, shift: s })} className={cx('flex items-center justify-center gap-1.5 rounded-xl border py-2 text-[10px] font-black uppercase tracking-wide transition-all', form.shift === s ? 'border-amber-500 bg-amber-400 text-amber-950 shadow-md' : 'border-black/12 bg-white text-[#20120c]/60 hover:border-amber-400')}><Icon size={13} />{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="h-10 border border-black/12 bg-white text-[10px]"><X size={13} /> Batal</Button>
                <Button variant="navy" type="submit" className="h-10 flex-1 text-[10.5px] uppercase tracking-wide"><Save size={14} /> {editUser ? 'Simpan Perubahan' : 'Buat Akun'}</Button>
              </div>
            </Card>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Modal password sementara */}
      <AnimatePresence>
        {tempPw && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <button className="absolute inset-0 bg-black/60" aria-label="Tutup" onClick={() => setTempPw(null)} />
            <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-sm rounded-3xl border border-amber-400/50 bg-[#261511] p-6 text-center shadow-2xl">
              <KeyRound size={38} className="mx-auto text-[#f5bd4f]" />
              <p className="mt-2 font-display text-lg font-black text-[#f8f3ea]">Password Di-reset</p>
              <p className="mt-1 text-[11px] font-semibold text-[#f8f3ea]/65">Berikan password sementara ini ke <b>{tempPw.name}</b> secara langsung:</p>
              <button onClick={() => { navigator.clipboard?.writeText(tempPw.pw); toast.success('Password disalin.'); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#f5bd4f]/60 bg-black/40 px-4 py-3 font-mono text-lg font-bold tracking-widest text-[#ffd87e] transition-all hover:bg-black/60">{tempPw.pw}<Copy size={16} /></button>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-[#f8f3ea]/40">Minta anggota mengganti password setelah login.</p>
              <Button variant="gold" onClick={() => setTempPw(null)} className="mt-3 h-11 w-full text-[11px] uppercase tracking-wide"><Check size={16} /> Selesai</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PENCARIAN & FILTER ===== */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#20120c]/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, username, email, jabatan…" aria-label="Cari anggota" className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-[12px] font-medium outline-none focus:border-[#152a46]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1">
          {(['semua', ...ALL_ROLES] as const).map((r) => (
            <button key={r} onClick={() => setRoleF(r as 'semua' | Role)} className={cx('h-8 rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-wide transition-all', roleF === r ? 'bg-[#152a46] text-white' : 'text-[#20120c]/60 hover:bg-black/5')}>{r === 'semua' ? 'Semua' : ROLE_META[r as Role].short}</button>
          ))}
        </div>
      </div>

      {/* ===== DAFTAR AKUN ===== */}
      <ul className="space-y-2">
        {filtered.map((u) => (
          <li key={u.id}>
            <Card className={cx('flex flex-wrap items-center gap-2.5 p-3 transition-all', !u.active && 'opacity-60 saturate-50')}>
              <Avatar name={u.name} color={u.color} size={46} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[12.5px] font-extrabold text-[#20120c]">{u.name}</p>
                  <RoleChip label={ROLE_META[u.role].short} tone={ROLE_TONE[u.role]} />
                  {u.id === 'u-mispin' && <Crown size={12} className="text-amber-600" />}
                  {!u.active && <span className="rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-red-700">Nonaktif</span>}
                </div>
                <p className="mt-0.5 truncate text-[9px] font-semibold text-[#20120c]/55">{u.jabatan} · Shift {u.shift}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[8.5px] text-[#20120c]/45"><span>@{u.username}</span><span className="truncate">{u.email}</span>{u.phone && <span>{u.phone}</span>}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1">
                <button onClick={() => openEdit(u)} title="Edit data" aria-label="Edit" className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-[#152a46] transition-all hover:bg-[#152a46] hover:text-white"><PencilLine size={15} /></button>
                <button onClick={() => doReset(u)} title="Reset password" aria-label="Reset password" className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-amber-800 transition-all hover:bg-amber-500 hover:text-white"><KeyRound size={15} /></button>
                <button onClick={() => { store.toggleAccount(u.id); toast.info(u.active ? `${u.name.split(' ')[0]} dinonaktifkan.` : `${u.name.split(' ')[0]} diaktifkan kembali.`); }} title={u.active ? 'Nonaktifkan' : 'Aktifkan'} aria-label="Toggle aktif" disabled={u.id === 'u-mispin'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-emerald-800 transition-all hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">{u.active ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}</button>
                <button onClick={() => { if (confirm(`Hapus akun ${u.name}? Tindakan permanen.`)) { const ok = store.deleteAccount(u.id); ok ? toast.success('Akun dihapus.') : toast.error('Akun utama tidak bisa dihapus.'); } }} title="Hapus akun" aria-label="Hapus" disabled={u.id === 'u-mispin'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-red-800 transition-all hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={15} /></button>
              </div>
            </Card>
          </li>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-[12px] font-semibold text-[#20120c]/45">Tidak ada akun cocok dengan pencarian.</p>}
      </ul>
    </div>
  );
}
