import type { DayLog, StatusMark } from './types';

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const pad = (n: number) => String(n).padStart(2, '0');

export const todayStr = (d: Date = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const offsetDateStr = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayStr(d);
};

export const fmtLongID = (dateStr: string) =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));

export const fmtShortID = (dateStr: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));

export const fmtFullID = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'kemarin';
  return `${day} hari lalu`;
};

export const nowHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const uid = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36);

export const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export interface Progress {
  done: number;
  total: number;
  pct: number;
  ok: number;
  periksa: number;
  masalah: number;
}

export const computeProgress = (
  day: DayLog | undefined,
  totalDefs: number,
): Progress => {
  const items = day ? Object.values(day.items) : [];
  const done = items.length;
  const ok = items.filter((i) => i.status === 'ok').length;
  const periksa = items.filter((i) => i.status === 'periksa').length;
  const masalah = items.filter((i) => i.status === 'masalah').length;
  return {
    done,
    total: totalDefs,
    pct: totalDefs === 0 ? 0 : Math.round((done / totalDefs) * 100),
    ok,
    periksa,
    masalah,
  };
};

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const STATUS_CYCLE: StatusMark[] = ['ok', 'periksa', 'masalah'];
export const nextStatus = (s: StatusMark): StatusMark =>
  STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
