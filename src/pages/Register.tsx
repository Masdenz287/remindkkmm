import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  User,
  AtSign,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Sun,
  Sunrise,
  MoonStar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { RestaurantLogo } from '../components/ui';
import { ALL_ROLES, ROLE_META, SHIFT_META, type Role, type Shift } from '../lib/types';
import { cx } from '../lib/utils';

const ROLE_DESC: Record<Role, string> = {
  komandan: 'Akses penuh — kelola seluruh akun & operasional dapur',
  wakil: 'Pantau semua checklist anggota tanpa bisa mengubah',
  koki: 'Verifikasi hasil checklist seluruh anggota dapur',
  goreng: 'Isi checklist pertugas harian sesuai stasiun goreng',
};

export default function Register() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    role: 'goreng' as Role,
    shift: 'Pagi' as Shift,
    jabatan: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError(null);
  };

  const pwStrength = useMemo(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0-4
  }, [form.password]);

  const strengthLabel = ['Terlalu pendek', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][pwStrength];
  const strengthColor = ['bg-red-500', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-400'][pwStrength];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 3) return setError('Nama minimal 3 karakter.');
    if (!/^[a-z0-9_.]{3,}$/i.test(form.username.trim())) return setError('Username minimal 3 karakter (huruf, angka, titik/underscore).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Format email tidak valid.');
    if (form.phone.trim() && !/^08[0-9]{7,13}$/.test(form.phone.replace(/[\s-]/g, ''))) return setError('Nomor HP tidak valid (contoh: 0812-3456-7890).');
    if (form.password.length < 6) return setError('Password minimal 6 karakter.');
    if (form.password !== form.confirm) return setError('Konfirmasi password tidak cocok.');

    setLoading(true);
    window.setTimeout(() => {
      const res = register({
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        shift: form.shift,
        phone: form.phone,
        jabatan: form.jabatan.trim() || (form.role === 'goreng' ? `Goreng — Shift ${form.shift}` : ROLE_META[form.role].label),
      });
      setLoading(false);
      if (res.ok) {
        toast.success('Pendaftaran berhasil!', { description: `Selamat datang, ${res.user.name.split(' ')[0]}. Akun Anda langsung aktif.` });
        navigate('/');
      } else {
        setError(res.error);
      }
    }, 500);
  };

  const fieldCls =
    'h-11 w-full rounded-xl border border-white/12 bg-black/35 pl-10 pr-3 text-[13px] font-medium text-[#f8f3ea] placeholder-[#f8f3ea]/25 outline-none transition-all focus:border-[#f5bd4f]/60 focus:ring-2 focus:ring-[#f5bd4f]/25';
  const labelCls = 'mb-1 block text-[9.5px] font-black uppercase tracking-[0.16em] text-[#ffd87e]';

  return (
    <div className="relative min-h-dvh overflow-y-auto bg-[#170d08]">
      <img src="/images/dapur-team.jpg" alt="" aria-hidden className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.22]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#170d08]/60 via-[#170d08]/80 to-[#170d08]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-6 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2 rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-[11px] font-bold text-[#f8f3ea]/80 backdrop-blur transition-all hover:bg-black/60 hover:text-white">
            <ArrowLeft size={14} /> Kembali ke Login
          </Link>
          <div className="flex items-center gap-2">
            <RestaurantLogo size={36} />
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#f8f3ea]/60 sm:block">Kampung Kecil<br />Metropolitan Bekasi</span>
          </div>
        </div>

        <div className="mt-6 grid flex-1 items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* Panel info kiri (desktop) */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} className="order-2 lg:order-1 lg:sticky lg:top-6">
            <h1 className="font-display text-4xl font-black leading-[1.02] text-[#f8f3ea] xl:text-5xl">
              Gabung<br /><span className="italic text-[#f5bd4f]">Keluarga Besar.</span>
            </h1>
            <p className="mt-3 max-w-md text-[13px] font-medium leading-relaxed text-[#f8f3ea]/75">
              Daftarkan akun Anda untuk mengakses checklist harian, laporan pekerjaan, dan koordinasi seluruh kru dapur <span className="font-bold text-[#ffd87e]">Kampung Kecil Metropolitan Bekasi</span>.
            </p>
            <div className="mt-5 space-y-2">
              {[
                'Checklist harian sesuai posisi & shift Anda',
                'Progress pekerjaan tercatat & bisa diverifikasi',
                'Laporan otomatis terkirim ke Kepala Koki',
              ].map((t) => (
                <p key={t} className="flex items-start gap-2 text-[12px] font-semibold text-[#f8f3ea]/70">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" /> {t}
                </p>
              ))}
            </div>
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[#f5bd4f]/25 shadow-2xl lg:block">
              <img src="/images/dapur-team.jpg" alt="Tim dapur Kampung Kecil Metropolitan Bekasi" className="h-44 w-full object-cover object-center" />
              <div className="bg-[#261511]/95 px-4 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#ffd87e]">Kru Dapur KKMB — Capek itu biasa, lezat itu wajib.</p>
              </div>
            </div>
          </motion.div>

          {/* Form kanan */}
          <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} onSubmit={submit} noValidate className="order-1 lg:order-2">
            <div className="rounded-3xl border border-[#f5bd4f]/25 bg-[#261511]/92 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.75)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5bd4f] text-[#3d271c] shadow-[0_2px_0_#cd8522]"><UserPlus size={20} strokeWidth={2.3} /></span>
                <div>
                  <h2 className="font-display text-xl font-black leading-none text-[#f8f3ea]">Daftar Akun Baru</h2>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f8f3ea]/40">Lengkapi data di bawah ini</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="reg-name" className={labelCls}>Nama Lengkap *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35" />
                    <input id="reg-name" value={form.name} onChange={set('name')} placeholder="Contoh: Budi Santoso" className={fieldCls} autoComplete="name" />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-username" className={labelCls}>Username *</label>
                  <div className="relative">
                    <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35" />
                    <input id="reg-username" value={form.username} onChange={set('username')} placeholder="budisantoso" className={fieldCls} autoCapitalize="none" autoComplete="username" />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-phone" className={labelCls}>No. HP / WhatsApp</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35" />
                    <input id="reg-phone" value={form.phone} onChange={set('phone')} placeholder="0812-xxxx-xxxx" className={fieldCls} inputMode="tel" autoComplete="tel" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="reg-email" className={labelCls}>Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35" />
                    <input id="reg-email" type="email" value={form.email} onChange={set('email')} placeholder="nama@email.com" className={fieldCls} autoCapitalize="none" autoComplete="email" />
                  </div>
                </div>

                {/* Peran */}
                <div className="sm:col-span-2">
                  <span className={labelCls}>Peran / Jabatan di Dapur *</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: r }))}
                        className={cx(
                          'rounded-xl border px-2 py-2 text-left transition-all',
                          form.role === r ? 'border-[#f5bd4f] bg-[#f5bd4f]/15 ring-1 ring-[#f5bd4f]/50' : 'border-white/12 bg-black/30 hover:border-white/25',
                        )}
                      >
                        <span className="block text-[11px] font-extrabold text-[#ffd87e]">{ROLE_META[r].label}</span>
                        <span className="mt-0.5 hidden text-[8.5px] font-medium leading-tight text-[#f8f3ea]/50 min-[420px]:block">{ROLE_DESC[r]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jabatan khusus */}
                <div className="sm:col-span-2">
                  <label htmlFor="reg-jabatan" className={labelCls}><Briefcase size={10} className="mr-1 inline" />Keterangan Jabatan</label>
                  <input id="reg-jabatan" value={form.jabatan} onChange={set('jabatan')} placeholder="Contoh: Goreng 1 (Shift Pagi)" className={cx(fieldCls, 'pl-3.5')} />
                </div>

                {/* Shift */}
                <div className="sm:col-span-2">
                  <span className={labelCls}>Shift Kerja *</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Pagi', 'Siang', 'Malam'] as Shift[]).map((s) => {
                      const Icon = s === 'Pagi' ? Sunrise : s === 'Siang' ? Sun : MoonStar;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, shift: s }))}
                          className={cx(
                            'flex flex-col items-center gap-1 rounded-xl border px-2 py-2 transition-all',
                            form.shift === s ? 'border-[#f5bd4f] bg-[#f5bd4f]/15 ring-1 ring-[#f5bd4f]/50' : 'border-white/12 bg-black/30 hover:border-white/25',
                          )}
                        >
                          <Icon size={17} className={form.shift === s ? 'text-[#ffd87e]' : 'text-[#f8f3ea]/55'} />
                          <span className="text-[10.5px] font-extrabold text-[#f8f3ea]">{SHIFT_META[s].label.replace('Shift ', '')}</span>
                          <span className="font-mono text-[8px] text-[#f8f3ea]/45">{SHIFT_META[s].jam}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-pw" className={labelCls}>Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35" />
                    <input id="reg-pw" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 karakter" className={cx(fieldCls, 'pr-10')} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#f8f3ea]/45 hover:text-white" aria-label="Tampilkan password">{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                  {form.password && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex h-1.5 flex-1 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={cx('h-full flex-1 rounded-full transition-colors', i < pwStrength ? strengthColor : 'bg-white/12')} />)}</div>
                      <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#f8f3ea]/50">{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-confirm" className={labelCls}>Konfirmasi Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35" />
                    <input id="reg-confirm" type={showPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Ulangi password" className={fieldCls} autoComplete="new-password" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-start gap-2 overflow-hidden rounded-xl border border-red-500/35 bg-red-950/50 px-3 py-2.5 text-[11px] font-semibold leading-snug text-red-200">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#f8f3ea]/45"><ShieldCheck size={12} className="text-emerald-400" /> Data Anda aman — password disimpan terenkripsi dan hanya Komandan Mispin yang dapat mengelola akun.</p>

              <button type="submit" disabled={loading} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f5bd4f] font-display text-[15px] font-black uppercase tracking-wide text-[#3d271c] shadow-[0_3px_0_#cd8522,0_14px_34px_-10px_rgba(245,189,79,.45)] transition-all hover:bg-[#ffd87e] active:translate-y-[3px] active:shadow-none disabled:opacity-60">
                {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#3d271c]/30 border-t-[#3d271c]" /> Mendaftarkan…</span> : <><UserPlus size={18} strokeWidth={2.5} /> Buat Akun Sekarang</>}
              </button>

              <p className="mt-3 text-center text-[11px] font-semibold text-[#f8f3ea]/55">Sudah punya akun? <Link to="/login" className="font-bold text-[#f5bd4f] underline underline-offset-2 hover:text-[#ffd87e]">Masuk di sini</Link></p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
