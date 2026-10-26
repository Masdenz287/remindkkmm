import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  ShieldCheck,
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
import { ROLE_META } from '../lib/types';
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

  const forgot = () =>
    toast.info('Lupa password?', { description: 'Hubungi Komandan Mispin (0812-1100-0001) untuk reset password. Password baru akan diberikan secara langsung.' });

  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden bg-[#170d08]">
      <div className="relative hidden w-[46%] shrink-0 flex-col justify-between overflow-hidden lg:flex xl:w-1/2">
        <img src="/images/login-hero.jpg" alt="Nasi liwet 4 orang, ayam kampung kecil, sambal cobek mertua" className="absolute inset-0 h-full w-full object-cover" />
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
          <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="font-display text-[44px] font-black leading-[1.04] text-[#f8f3ea] xl:text-[54px]">
            Rasanya<br /><span className="italic text-[#f5bd4f]">ngeraja,</span><br />harganya<br /><span className="italic text-[#f5bd4f]">ngerakyat.</span>
          </motion.h1>
        </div>
      </div>
      <div className="relative flex min-h-dvh flex-1 flex-col overflow-y-auto">
        <img src="/images/login-hero.jpg" alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14] lg:hidden" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#170d08]/70 via-[#170d08]/88 to-[#170d08] lg:hidden" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <RestaurantLogo size={52} />
            <div className="leading-tight">
              <p className="font-display text-base font-black text-[#f5bd4f]">Kampung Kecil Metropolitan Bekasi</p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className={cx('w-full max-w-[430px]', shake && 'animate-shake')}>
            <div className="rounded-3xl border border-[#f5bd4f]/25 bg-[#261511]/92 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,.75)] backdrop-blur-xl sm:p-7">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5bd4f] text-[#3d271c] shadow-[0_2px_0_#cd8522]"><ChefHat size={20} strokeWidth={2.2} /></span>
                <div>
                  <h2 className="font-display text-[22px] font-black leading-none text-[#f8f3ea]">Masuk Aplikasi</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f8f3ea]/45">Portal Kru Dapur &amp; Manajemen</p>
                </div>
              </div>
              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <div>
                  <label htmlFor="identifier" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd87e]">Email / Username</label>
                  <div className="group relative">
                    <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35 transition-colors group-focus-within:text-[#f5bd4f]" />
                    <input id="identifier" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(null); }} placeholder="mispin@kampungkecil.id" className="h-12 w-full rounded-xl border border-white/12 bg-black/35 pl-10 pr-3 text-[13.5px] font-medium text-[#f8f3ea] placeholder-[#f8f3ea]/25 outline-none transition-all focus:border-[#f5bd4f]/60" />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd87e]">Password</label>
                  <div className="group relative">
                    <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f8f3ea]/35 transition-colors group-focus-within:text-[#f5bd4f]" />
                    <input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} placeholder="••••••••" className="h-12 w-full rounded-xl border border-white/12 bg-black/35 pl-10 pr-12 text-[13.5px] font-medium text-[#f8f3ea] outline-none focus:border-[#f5bd4f]/60" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#f8f3ea]/45"><Eye size={17} /></button>
                  </div>
                </div>
                <AnimatePresence>
                  {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2 rounded-xl border border-red-500/35 bg-red-950/50 px-3 py-2.5 text-[11.5px] text-red-200"><AlertCircle size={15} /> {error}</motion.div>}
                </AnimatePresence>
                <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f5bd4f] font-display text-[15px] font-black uppercase text-[#3d271c]">{loading ? 'Memverifikasi…' : <><LogIn size={18} /> Masuk ke Aplikasi</>}</button>
              </form>
              <Link to="/daftar" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#f5bd4f]/55 text-[13px] font-black uppercase text-[#ffd87e]">Daftar Akun Baru</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}