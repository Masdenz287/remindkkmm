import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  ShieldCheck,
  Users,
  Flame,
  AlertCircle,
  UserPlus,
  ChefHat,
  UtensilsCrossed,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { RestaurantLogo } from '../components/ui';
import { ROLE_META, type Role } from '../lib/types';
import { cx } from '../lib/utils';

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const fail = (msg: string) => {
    setError(msg);
    setShake(true);
    window.setTimeout(() => setShake(false), 550);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) return fail('Isi email atau username Anda.');
    if (!password) return fail('Isi password Anda.');
    setLoading(true);
    window.setTimeout(() => {
      const res = login(identifier, password);
      setLoading(false);
      if (res.ok) {
        toast.success(`Selamat bekerja, ${res.user.name.split(' ')[0]}!`, { description: `${ROLE_META[res.user.role].label} · ${res.user.shift} — selamat bertugas.` });
        navigate('/');
      } else {
        fail(res.error);
      }
    }, 450);
  };

  const quickLogin = (email: string, pw: string) => {
    setIdentifier(email);
    setPassword(pw);
    setError(null);
    setLoading(true);
    window.setTimeout(() => {
      const res = login(email, pw);
      setLoading(false);
      if (res.ok) {
        toast.success(`Selamat bekerja, ${res.user.name.split(' ')[0]}!`);
        navigate('/');
      }
    }, 350);
  };

  const forgot = () =>
    toast.info('Lupa password?', { description: 'Hubungi Komandan Mispin (KALIAN TAU KAN NOMERNYA) untuk reset password. Password baru akan diberikan secara langsung.' });

  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden bg-[#170d08]">
      {/* ===== SISI KIRI — Visual ===== */}
      <div className="relative hidden w-[46%] shrink-0 flex-col justify-between overflow-hidden lg:flex xl:w-1/2">
        <img src="/images/login-hero.jpg" alt="Nasi liwet, ayam kampung kecil, sambal cobek mertua" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#170d08]/85 via-[#170d08]/45 to-[#170d08]/92" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#170d08] via-transparent to-[#170d08]/70" />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-3">
            <RestaurantLogo size={54} />
            <div className="leading-tight">
              <p className="font-display text-lg font-black text-[#f5bd4f]">Kampung Kecil</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f8f3ea]/80">Metropolitan Bekasi</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-8 pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-[44px] font-black leading-[1.04] text-[#f8f3ea] xl:text-[54px]"
          >
            Rasanya<br />
            <span className="italic text-[#f5bd4f]">ngeraja,</span><br />
            harganya<br />
            <span className="italic text-[#f5bd4f]">ngerakyat.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }} className="mt-4 max-w-sm text-[13px] font-medium leading-relaxed text-[#f8f3ea]/75">
            Sistem checklist operasional dapur — satu aplikasi untuk absensi, kualitas, kebersihan &amp; kepatuhan seluruh kru. Sejak 2023.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#ffd87e]">
            <span className="flex items-center gap-1.5 rounded-full border border-[#f5bd4f]/35 bg-black/45 px-3 py-1.5 backdrop-blur-sm"><Flame size={11} /> Ayam Goreng Kalasan</span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#f5bd4f]/35 bg-black/45 px-3 py-1.5 backdrop-blur-sm"><UtensilsCrossed size={11} /> Nasi Uduk Komplit</span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#f5bd4f]/35 bg-black/45 px-3 py-1.5 backdrop-blur-sm"><BadgeCheck size={11} /> Halal &amp; Higienis</span>
          </motion.div>
        </div>
      </div>

      {/* ===== SISI KANAN — Form ===== */}
      <div className="relative flex min-h-dvh flex-1 flex-col overflow-y-auto">
        {/* dekorasi mobile */}
        <img src="/images/login-hero.jpg" alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14] lg:hidden" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#170d08]/70 via-[#170d08]/88 to-[#170d08] lg:hidden" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
          {/* Logo mobile */}
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <RestaurantLogo size={52} />
            <div className="leading-tight">
              <p className="font-display text-base font-black text-[#f5bd4f]">Kampung Kecil Metropolitan Bekasi</p>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#f8f3ea]/70">Rasanya ngeraja · Harganya ngerakyat</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={cx('w-full max-w-[430px]', shake && 'animate-shake')}
          >
            <div className="rounded-3xl border border-[#f5bd4f]/25 bg-[#261511]/92 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,.75)] backdrop-blur-xl sm:p-7">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5bd4f] text-[#3d271c] shadow-[0_2px_0_#cd8522]"><ChefHat size={20} strokeWidth={2.2} /></span>
                <div>
                  <h2 className="font-display text-[22px] font-black leading-none text-[#f8f3ea]">Masuk Aplikasi</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f8f3ea]/45">Portal Kru Dapur &amp; Manajemen</p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                {/* Identifier */}
                <div>
                  <label htmlFor="identifier" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd87e]">Email / Username</label>
                  <div className="group relative">
                    <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35 transition-colors group-focus-within:text-[#f5bd4f]" />
                    <input
                      id="identifier"
                      name="identifier"
                      autoComplete="username"
                      autoCapitalize="none"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                      placeholder="mispin@kampungkecil.id"
                      className="h-12 w-full rounded-xl border border-white/12 bg-black/35 pl-10 pr-3 text-[13.5px] font-medium text-[#f8f3ea] placeholder-[#f8f3ea]/25 outline-none transition-all focus:border-[#f5bd4f]/60 focus:bg-black/50 focus:ring-2 focus:ring-[#f5bd4f]/25"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd87e]">Password</label>
                  <div className="group relative">
                    <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35 transition-colors group-focus-within:text-[#f5bd4f]" />
                    <input
                      id="password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-xl border border-white/12 bg-black/35 pl-10 pr-12 text-[13.5px] font-medium text-[#f8f3ea] placeholder-[#f8f3ea]/25 outline-none transition-all focus:border-[#f5bd4f]/60 focus:bg-black/50 focus:ring-2 focus:ring-[#f5bd4f]/25"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#f8f3ea]/45 transition-colors hover:bg-white/5 hover:text-[#f8f3ea]">
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2 overflow-hidden rounded-xl border border-red-500/35 bg-red-950/50 px-3 py-2.5 text-[11.5px] font-semibold leading-snug text-red-200">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#f8f3ea]/45"><ShieldCheck size={12} className="text-emerald-400" /> Autentikasi terenkripsi &amp; aman</span>
                  <button type="button" onClick={forgot} className="text-[11px] font-bold text-[#f5bd4f] underline decoration-[#f5bd4f]/40 underline-offset-2 transition-colors hover:text-[#ffd87e]">Lupa password?</button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f5bd4f] font-display text-[15px] font-black uppercase tracking-wide text-[#3d271c] shadow-[0_3px_0_#cd8522,0_14px_34px_-10px_rgba(245,189,79,.45)] transition-all hover:bg-[#ffd87e] active:translate-y-[3px] active:shadow-none disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#3d271c]/30 border-t-[#3d271c]" /> Memverifikasi…</span>
                  ) : (
                    <><LogIn size={18} strokeWidth={2.5} /> Masuk ke Aplikasi</>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.22em] text-[#f8f3ea]/35">
                <span className="h-px flex-1 bg-white/10" /> atau <span className="h-px flex-1 bg-white/10" />
              </div>

              {/* Daftar */}
              <Link to="/daftar" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#f5bd4f]/55 font-display text-[13px] font-black uppercase tracking-wide text-[#ffd87e] transition-all hover:border-[#f5bd4f] hover:bg-[#f5bd4f]/10">
                <UserPlus size={17} strokeWidth={2.4} /> Daftar Akun Baru
              </Link>
            </div>

            
                  <button
                    key={a.email}
                    onClick={() => quickLogin(a.email, a.password)}
                    disabled={loading}
                    className={cx('rounded-xl border bg-gradient-to-br px-2 py-2 text-left transition-all hover:scale-[1.02] active:scale-[.98] disabled:opacity-50', a.tone)}
                  >
                    <span className="block text-[10.5px] font-extrabold leading-tight">{a.label}</span>
                    <span className="mt-0.5 block font-mono text-[8.5px] opacity-70">{a.email.split('@')[0]} · {a.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <p className="relative z-10 pb-4 text-center text-[8.5px] font-semibold uppercase tracking-[0.2em] text-[#f8f3ea]/30">© 2026 Kampung Kecil Metropolitan Bekasi · Versi 2.4.0 · Node.js + PostgreSQL/Supabase</p>
      </div>
    </div>
  );
}
