import type { CSSProperties, ReactNode } from 'react';
import type { StatusMark } from '../lib/types';
import { initials } from '../lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { cx } from '../lib/utils';

/* ===== Logo Restoran ===== */
export function RestaurantLogo({ size = 46, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-label="Logo Kampung Kecil Metropolitan Bekasi">
      <rect width="64" height="64" rx="15" fill="#20120c" />
      <path d="M13 41h38" stroke="#f5bd4f" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M16.5 38c0-10.2 7.4-17.9 15.5-17.9s15.5 7.7 15.5 17.9" fill="none" stroke="#f5bd4f" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="32" cy="15.5" r="2.7" fill="#f5bd4f" />
      <path d="M24.5 30c1.5-1.3 3.6-2 5.8-2.1" stroke="#ffd87e" strokeWidth="2.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ===== Avatar inisial ===== */
export function Avatar({ name, color, size = 40, className = '' }: { name: string; color: string; size?: number; className?: string }) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: `linear-gradient(145deg, ${color} 0%, ${shade(color, -30)} 100%)`,
    fontSize: size * 0.38,
  };
  return (
    <div
      className={cx('relative flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white ring-2 ring-white/20 shadow-md', className)}
      style={style}
    >
      {initials(name)}
    </div>
  );
}

function shade(hex: string, amt: number) {
  const n = hex.replace('#', '');
  const num = parseInt(n.length === 3 ? n.split('').map((c) => c + c).join('') : n, 16);
  let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/* ===== Badge status ===== */
export function StatusBadge({ status, size = 'md' }: { status: StatusMark; size?: 'sm' | 'md' }) {
  const map: Record<StatusMark, { label: string; cls: string; dot: string }> = {
    ok: { label: 'OK', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
    periksa: { label: 'Perlu Diperiksa', cls: 'bg-amber-50 text-amber-900 border-amber-300', dot: 'bg-amber-400' },
    masalah: { label: 'Masalah', cls: 'bg-red-50 text-red-800 border-red-300', dot: 'bg-red-500' },
  };
  const m = map[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wide whitespace-nowrap', m.cls, size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]')}>
      <span className={cx('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

export function RoleChip({ label, tone }: { label: string; tone: 'red' | 'indigo' | 'amber' | 'emerald' | 'navy' | 'gold' }) {
  const map = {
    red: 'bg-red-50 text-red-800 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-300',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    navy: 'bg-[#152a46] text-[#ffd87e] border-[#152a46]',
    gold: 'bg-[#f5bd4f] text-[#3d271c] border-[#e9a83a]',
  } as const;
  return <span className={cx('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', map[tone])}>{label}</span>;
}

/* ===== Progress bar hijau ===== */
export function ProgressBar({ pct, className = '', thin = false }: { pct: number; className?: string; thin?: boolean }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-black/10 ring-1 ring-inset ring-black/5', thin ? 'h-2' : 'h-3.5', className)} role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 transition-[width] duration-700 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

/* ===== Kartu putih sudut membulat ===== */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(23,13,8,.06),0_10px_30px_-14px_rgba(23,13,8,.3)]', className)}>
      {children}
    </div>
  );
}

/* ===== Tombol ===== */
export function Button({
  children,
  onClick,
  variant = 'navy',
  className = '',
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'navy' | 'gold' | 'ghost' | 'outline' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const map = {
    navy: 'bg-[#152a46] text-white hover:bg-[#1d3a5f] active:bg-[#0f1f36] shadow-[0_2px_0_#0a1626] hover:shadow-[0_2px_0_#0a1626,0_10px_24px_-10px_rgba(21,42,70,.7)]',
    gold: 'bg-[#f5bd4f] text-[#3d271c] hover:bg-[#ffd87e] active:bg-[#e9a83a] shadow-[0_2px_0_#cd8522]',
    ghost: 'bg-transparent text-[#20120c] hover:bg-black/5',
    outline: 'bg-white text-[#152a46] border-2 border-[#152a46] hover:bg-[#152a46] hover:text-white',
    danger: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 shadow-[0_2px_0_#7f1d1d]',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-[0_2px_0_#14532d]',
  } as const;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold tracking-tight transition-all duration-150 select-none disabled:cursor-not-allowed disabled:opacity-45 disabled:saturate-50',
        'active:translate-y-[2px] active:shadow-none',
        map[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={cx('animate-spin', className)} />;
}

export function BigCheckbox({ checked, onToggle, size = 40 }: { checked: boolean; onToggle: () => void; size?: number }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cx(
        'group flex shrink-0 items-center justify-center rounded-2xl border-[3px] transition-all duration-200 select-none',
        checked
          ? 'border-emerald-600 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[inset_0_-3px_0_rgba(0,0,0,.18),0_4px_14px_-4px_rgba(22,163,74,.7)]'
          : 'border-black/15 bg-[#f4f4f6] text-transparent hover:border-emerald-500 hover:bg-emerald-50',
      )}
      style={{ width: size, height: size }}
    >
      <Check strokeWidth={4} size={size * 0.62} className={cx('transition-transform duration-200', checked ? 'scale-100' : 'scale-75 group-hover:scale-90')} />
    </button>
  );
}

export function EmptyState({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white/60 px-6 py-12 text-center">
      <div className="text-[#20120c]/30">{icon}</div>
      <div>
        <p className="font-display text-lg font-bold text-[#20120c]">{title}</p>
        {sub && <p className="mt-1 text-sm text-[#20120c]/60">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const ROLE_TONE: Record<string, 'red' | 'indigo' | 'amber' | 'emerald'> = {
  komandan: 'red',
  wakil: 'indigo',
  koki: 'amber',
  goreng: 'emerald',
};
