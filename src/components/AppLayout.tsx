import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  History,
  ClipboardCheck,
  Menu,
  Bell,
  X,
  ChevronRight,
  LogOut,
  Users,
  Gauge,
  ChevronDown,
  CheckCheck,
  Trash2,
  Clock3,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useStore } from '../lib/store';
import { defsForRole } from '../lib/seed';
import { computeProgress, cx, fmtLongID, timeAgo, todayStr } from '../lib/utils';
import { Avatar, RestaurantLogo } from './ui';
import { ROLE_META, SHIFT_META, type Role } from '../lib/types';

const NAV = [
  { to: '/', icon: Home, label: 'Hari Ini', end: true },
  { to: '/riwayat', icon: History, label: 'Riwayat', end: false },
  { to: '/kunjungan', icon: ClipboardCheck, label: 'Kunjungan', end: false },
  { to: '/lainnya', icon: Menu, label: 'Lainnya', end: false },
];

export default function AppLayout() {
  const { currentUser, logout, notifications, markAllNotifRead, markNotifRead, deleteNotification, clearNotifications, getItemState } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const today = todayStr();
  const myProgress = useMemo(() => {
    if (!currentUser) return { done: 0, total: 0, pct: 0, ok: 0, periksa: 0, masalah: 0 };
    const defs = defsForRole(currentUser.role);
    const items: Record<string, { status: 'ok' | 'periksa' | 'masalah'; note: string; checkedAt: string }> = {};
    for (const d of defs) {
      const st = getItemState(currentUser.id, d.id, today);
      if (st) items[d.id] = st;
    }
    return computeProgress({ items, sentAt: null, verifiedAt: null, verifiedBy: null }, defs.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, today, getItemState, location.pathname]);

  const myNotifs = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(
      (n) =>
        (n.roles === 'all' || (n.roles as Role[]).includes(currentUser.role)) &&
        (!n.userId || n.userId === currentUser.id),
    );
  }, [notifications, currentUser]);

  const unread = myNotifs.filter((n) => !n.read).length;

  if (!currentUser) return <Outlet />;

  const roleMeta = ROLE_META[currentUser.role];
  const shiftMeta = SHIFT_META[currentUser.shift];

  return (
    <div className="min-h-dvh bg-[#e9e9ed] pb-[76px] lg:pb-0">
      {/* ============ HEADER HITAM COKLAT GELAP ============ */}
      <header className="sticky top-0 z-40 border-b border-black/60 bg-[#20120c] text-[#f8f3ea] shadow-[0_6px_24px_-8px_rgba(0,0,0,.55)]">
        {/* aksen garis emas tipis */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#cd8522] via-[#f5bd4f] to-[#cd8522]" />
        <div className="mx-auto max-w-6xl px-3 sm:px-5">
          <div className="flex h-[62px] items-center gap-2.5 sm:gap-4">
            {/* Logo + Nama restoran */}
            <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <RestaurantLogo size={42} className="shrink-0 drop-shadow-[0_2px_6px_rgba(245,189,79,.35)]" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-display text-[13px] font-black tracking-tight text-[#f5bd4f] sm:text-[16px]">
                  Kampung Kecil <span className="hidden sm:inline">Metropolitan</span> Bekasi
                </span>
                <span className="hidden text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#f8f3ea]/55 md:block">
                  Rasanya ngeraja · Harganya ngerakyat
                </span>
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {/* Persentase checklist — desktop */}
              <Link to="/" title="Progress checklist saya hari ini" className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-3 py-1.5 transition-colors hover:bg-white/10 md:flex">
                <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="4.5" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round"
                    strokeDasharray={`${(myProgress.pct / 100) * 97.4} 97.4`} className="transition-all duration-700" />
                </svg>
                <span className="leading-none">
                  <span className="block font-mono text-[15px] font-bold text-emerald-400">{myProgress.pct}%</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[#f8f3ea]/55">Checklist</span>
                </span>
              </Link>

              {/* Lonceng notifikasi */}
              <button
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifikasi"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] text-[#ffd87e] transition-all hover:bg-white/10 active:scale-95"
              >
                <Bell size={21} strokeWidth={2.2} />
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 font-mono text-[9px] font-bold text-white ring-2 ring-[#20120c]">
                    <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-red-600/70" />
                    <span className="relative">{unread > 9 ? '9+' : unread}</span>
                  </span>
                )}
              </button>

              {/* User chip */}
              <Link to="/lainnya" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.06] py-1 pl-1 pr-1.5 transition-all hover:bg-white/10 sm:gap-2 sm:pr-2">
                <Avatar name={currentUser.name} color={currentUser.color} size={36} />
                <span className="hidden leading-tight min-[420px]:block">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#f8f3ea]">{currentUser.name.split(' ')[0]} {currentUser.name.split(' ').slice(-1)} <ChevronDown size={11} className="opacity-60" /></span>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#f5bd4f]">{roleMeta.short} · {shiftMeta.label.replace('Shift ', '')}</span>
                </span>
              </Link>

              <button onClick={logout} title="Keluar" aria-label="Keluar" className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] text-[#f8f3ea]/70 transition-all hover:bg-red-900/50 hover:text-red-300 sm:flex">
                <LogOut size={19} />
              </button>
            </div>
          </div>

          {/* Baris info tanggal operasional + peran (mobile ringkas) */}
          <div className="flex h-8 items-center justify-between gap-2 border-t border-white/[.07] text-[10px] text-[#f8f3ea]/65">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span className="truncate font-medium">{fmtLongID(today)}</span>
            </span>
            <span className="hidden shrink-0 font-mono text-[9px] tracking-wide text-[#f8f3ea]/45 xs:block sm:block">
              {currentUser.jabatan} · {shiftMeta.jam} WIB
            </span>
          </div>
        </div>

        {/* ===== PANEL NOTIFIKASI ===== */}
        {notifOpen && (
          <>
            <button aria-hidden className="fixed inset-0 z-40 cursor-default bg-black/45 backdrop-blur-[2px]" onClick={() => setNotifOpen(false)} />
            <div className="absolute inset-x-0 top-full z-50 border-b border-black/60 bg-[#261511] text-[#f8f3ea] shadow-2xl">
              <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#f5bd4f]">
                    <Bell size={13} /> Notifikasi {unread > 0 && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] text-white">{unread} BARU</span>}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={markAllNotifRead} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-emerald-300 transition-colors hover:bg-white/5"><CheckCheck size={12} /> Tandai semua dibaca</button>
                    <button onClick={() => { if (window.confirm('Hapus semua notifikasi?')) clearNotifications(); }} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-red-300 transition-colors hover:bg-white/5"><Trash2 size={12} /> Hapus semua</button>
                    <button onClick={() => setNotifOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#f8f3ea]/70 hover:bg-white/5"><X size={16} /></button>
                  </div>
                </div>
                <div className="max-h-[62vh] overflow-y-auto pr-0.5">
                  {myNotifs.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[#f8f3ea]/45">Belum ada notifikasi. Keren — dapur kondusif.</p>
                  ) : (
                    <ul className="divide-y divide-white/[.06]">
                      {myNotifs.slice(0, 12).map((n) => (
                        <li key={n.id} className={cx('group flex items-start gap-2.5 py-2.5 transition-colors', !n.read && 'bg-white/[.03]')}>
                          <span className={cx('mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black',
                            n.type === 'masalah' && 'bg-red-500/20 text-red-300',
                            n.type === 'terlambat' && 'bg-amber-500/20 text-amber-300',
                            n.type === 'reminder' && 'bg-sky-500/20 text-sky-300',
                            n.type === 'laporan' && 'bg-emerald-500/20 text-emerald-300',
                            n.type === 'info' && 'bg-violet-500/20 text-violet-300')}>
                            {n.type === 'masalah' ? '!' : n.type === 'terlambat' ? '⏰' : n.type === 'reminder' ? '🔔' : n.type === 'laporan' ? '✓' : 'i'}
                          </span>
                          <button className="min-w-0 flex-1 text-left" onClick={() => markNotifRead(n.id)}>
                            <span className={cx('block text-[11.5px] font-bold leading-snug', n.read ? 'text-[#f8f3ea]/65' : 'text-[#f8f3ea]')}>{n.title}</span>
                            <span className="mt-0.5 block text-[10px] leading-snug text-[#f8f3ea]/50">{n.body}</span>
                            <span className="mt-1 flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-[#f8f3ea]/35"><Clock3 size={9} />{timeAgo(n.time)}{!n.read && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />}</span>
                          </button>
                          <button onClick={() => deleteNotification(n.id)} aria-label="Hapus" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#f8f3ea]/30 opacity-100 transition-all hover:bg-red-500/15 hover:text-red-300 lg:opacity-0 lg:group-hover:opacity-100">
                            <Trash2 size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link to="/lainnya" onClick={() => setNotifOpen(false)} className="mt-1 flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[.04] py-2 text-[10px] font-bold uppercase tracking-wider text-[#ffd87e] hover:bg-white/[.08]">Kelola notifikasi & reminder <ChevronRight size={12} /></Link>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ============ KONTEN ============ */}
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-5 lg:pl-56">
        <Outlet />
      </main>

      {/* ============ BOTTOM NAV (mobile) ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/50 bg-[#20120c]/97 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx(
                'flex h-[62px] flex-col items-center justify-center gap-0.5 transition-colors',
                isActive ? 'text-[#f5bd4f]' : 'text-[#f8f3ea]/55',
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />
                  <span className={cx('text-[9px] font-bold uppercase tracking-wide', isActive && 'text-[#f5bd4f]')}>{item.label}</span>
                  <span className={cx('h-1 w-8 rounded-full transition-all', isActive ? 'bg-[#f5bd4f]' : 'bg-transparent')} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ============ SIDE NAV (desktop) ============ */}
      <DesktopNav />

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#20120c', color: '#ffd87e', border: '1px solid rgba(245,189,79,.3)', fontFamily: 'Inter, sans-serif', fontWeight: 600, borderRadius: '14px' },
        }}
      />
    </div>
  );
}

function DesktopNav() {
  const { currentUser } = useStore();
  const location = useLocation();
  if (!currentUser) return null;
  const items = [
    { to: '/', icon: Home, label: 'Hari Ini' },
    { to: '/riwayat', icon: History, label: 'Riwayat' },
    { to: '/kunjungan', icon: ClipboardCheck, label: 'Kunjungan' },
    { to: '/lainnya', icon: Menu, label: 'Lainnya' },
    ...(currentUser.role !== 'goreng' ? [{ to: '/anggota', icon: Users, label: 'Anggota Dapur' }] : []),
    ...((['komandan', 'wakil', 'koki'] as Role[]).includes(currentUser.role) ? [{ to: '/kepala-koki', icon: Gauge, label: 'Dashboard Kepala Koki' }] : []),
  ];
  return (
    <aside className="fixed left-[max(1rem,calc(50%-36rem))] top-[124px] z-30 hidden w-52 flex-col gap-1 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_10px_36px_-14px_rgba(23,13,8,.4)] lg:flex">
      <p className="px-3 pb-1.5 pt-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#20120c]/40">Navigasi</p>
      {items.map((item) => {
        const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cx(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-bold transition-all',
              active ? 'bg-[#152a46] text-white shadow-[0_2px_0_#0a1626]' : 'text-[#20120c]/75 hover:bg-[#f4f1ea] hover:text-[#20120c]',
            )}
          >
            <item.icon size={17} strokeWidth={2.1} />
            {item.label}
          </NavLink>
        );
      })}
      <div className="mt-1 rounded-xl border border-[#f5bd4f]/50 bg-[#fdf6e3] p-3">
        <p className="font-display text-[11px] font-black italic leading-snug text-[#7a4a12]">“Rasanya ngeraja,<br />harganya ngerakyat.”</p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#a97b2f]">— Slogan KKMB sejak 2023</p>
      </div>
    </aside>
  );
}
