export type Role = 'komandan' | 'wakil' | 'koki' | 'goreng';
export type StatusMark = 'ok' | 'periksa' | 'masalah';
export type Shift = 'Pagi' | 'Siang' | 'Malam';
export type Block = 'Persiapan Buka' | 'Operasional' | 'Tutup Toko';
export type NotifType = 'reminder' | 'terlambat' | 'masalah' | 'laporan' | 'info';
export type IssueSeverity = 'tinggi' | 'sedang' | 'rendah';
export type IssueStatus = 'open' | 'progress' | 'selesai';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  jabatan: string;
  shift: Shift;
  phone: string;
  color: string;
  active: boolean;
  joinDate: string;
}

export interface ItemDef {
  id: string;
  block: Block;
  title: string;
  detail: string;
  time: string;
  roles: Role[];
  critical?: boolean;
}

export interface ItemState {
  status: StatusMark;
  note: string;
  checkedAt: string;
}

export interface DayLog {
  items: Record<string, ItemState>;
  sentAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export interface ReportItem {
  id: string;
  title: string;
  time: string;
  status: StatusMark;
  note: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  jabatan: string;
  role: Role;
  shift: Shift;
  date: string;
  total: number;
  done: number;
  okCount: number;
  periksaCount: number;
  masalahCount: number;
  catatan: string;
  items: ReportItem[];
  sentAt: string;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
}

export interface Issue {
  id: string;
  title: string;
  detail: string;
  reporterId: string;
  reporterName: string;
  date: string;
  time: string;
  severity: IssueSeverity;
  status: IssueStatus;
}

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  roles: Role[] | 'all';
  userId?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  days: number[]; // 0 = Minggu … 6 = Sabtu
  roles: Role[];
  active: boolean;
}

export interface VisitArea {
  area: string;
  score: number;
}

export interface Visit {
  id: string;
  date: string;
  visitor: string;
  purpose: string;
  areas: VisitArea[];
  overall: number;
  notes: string;
}

export interface StoreState {
  users: User[];
  days: Record<string, DayLog>; // key `${userId}|${date}`
  reports: Report[];
  issues: Issue[];
  notifications: AppNotification[];
  reminders: Reminder[];
  visits: Visit[];
  fired: Record<string, string>; // reminderId -> last fired date
  lateNotified: Record<string, string>; // userId -> last notified date
}

export const ROLE_META: Record<Role, { label: string; short: string; desc: string; chip: string; dot: string }> = {
  komandan: {
    label: 'Komandan Mispin',
    short: 'Mispin',
    desc: 'Kelola seluruh akun & operasional dapur',
    chip: 'bg-red-50 text-red-800 border-red-200',
    dot: '#b91c1c',
  },
  wakil: {
    label: 'Wakil Rahmat',
    short: 'Rahmat',
    desc: 'Pantau & awasi checklist seluruh anggota',
    chip: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: '#4338ca',
  },
  koki: {
    label: 'Koki',
    short: 'Koki',
    desc: 'Verifikasi hasil checklist anggota',
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: '#d97706',
  },
  goreng: {
    label: 'Goreng',
    short: 'Goreng',
    desc: 'Anggota dapur — stasiun penggorengan',
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: '#059669',
  },
};

export const SHIFT_META: Record<Shift, { label: string; jam: string }> = {
  Pagi: { label: 'Shift Pagi', jam: '06.00 – 14.00' },
  Siang: { label: 'Shift Siang', jam: '13.00 – 21.00' },
  Malam: { label: 'Shift Malam', jam: '20.00 – 05.00' },
};

export const ALL_ROLES: Role[] = ['komandan', 'wakil', 'koki', 'goreng'];
export const LEADERSHIP: Role[] = ['komandan', 'wakil', 'koki'];
