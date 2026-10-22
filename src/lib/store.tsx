import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppNotification,
  Issue,
  IssueSeverity,
  IssueStatus,
  ItemState,
  NotifType,
  Report,
  Role,
  Shift,
  StatusMark,
  StoreState,
  User,
  Visit,
} from './types';
import { ALL_ROLES, LEADERSHIP } from './types';
import { buildSeedState, defsForRole } from './seed';
import { nowHHMM, todayStr, uid } from './utils';

const STORAGE_KEY = 'kkmb-store-v1';
const SESSION_KEY = 'kkmb-session';

const loadState = (): StoreState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreState;
  } catch {
    /* corrupt → reseed */
  }
  const fresh = buildSeedState();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { /* quota */ }
  return fresh;
};

export const canManageAccounts = (u: User | null) => !!u && u.role === 'komandan';
export const canVerify = (u: User | null) => !!u && (u.role === 'koki' || u.role === 'komandan');
export const canSeeAll = (u: User | null) => !!u && LEADERSHIP.includes(u.role);

export interface RegisterInput {
  name: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  shift: Shift;
  phone: string;
  jabatan: string;
}

export type AuthResult = { ok: true; user: User } | { ok: false; error: string };

interface StoreContextValue {
  users: User[];
  currentUser: User | null;
  sessionLoading: boolean;
  login: (identifier: string, password: string) => AuthResult;
  register: (data: RegisterInput) => AuthResult;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phone' | 'jabatan'>>) => void;
  changePassword: (oldPw: string, newPw: string) => { ok: boolean; error?: string };

  // Checklist
  getItemState: (userId: string, defId: string, date?: string) => ItemState | undefined;
  toggleItem: (defId: string, note?: string) => void;
  setItemStatus: (defId: string, status: StatusMark) => void;
  setItemNote: (defId: string, note: string) => void;
  setItemNoteFor: (userId: string, defId: string, note: string, date?: string) => void;
  clearItemFor: (userId: string, defId: string, date?: string) => void;
  submitReport: (catatan: string) => Report | null;
  verifyReport: (reportId: string) => void;
  unverifyReport: (reportId: string) => void;

  reports: Report[];
  issues: Issue[];
  notifications: AppNotification[];
  reminders: StoreState['reminders'];
  visits: Visit[];

  addIssue: (title: string, detail: string, severity: IssueSeverity) => void;
  setIssueStatus: (id: string, status: IssueStatus) => void;
  deleteIssue: (id: string) => void;

  markNotifRead: (id: string) => void;
  markAllNotifRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;

  saveReminder: (r: Omit<StoreState['reminders'][number], 'id'> & { id?: string }) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  addAccount: (data: Omit<User, 'id' | 'active' | 'joinDate' | 'color'>) => void;
  updateAccount: (id: string, patch: Partial<User>) => void;
  toggleAccount: (id: string) => void;
  deleteAccount: (id: string) => boolean; // false bila tidak boleh (mispin utama)
  resetPassword: (id: string) => string;

  addVisit: (v: Omit<Visit, 'id'>) => void;
  deleteVisit: (id: string) => void;

  resetDemoData: () => void;
  periodProgress: (date: string, userId: string) => { done: number; total: number; pct: number };
}

const StoreContext = createContext<StoreContextValue | null>(null);

const dayKey = (userId: string, date: string) => `${userId}|${date}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadState());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_KEY),
  );

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === currentUserId) ?? null,
    [state.users, currentUserId],
  );

  const pushNotification = (
    s: StoreState,
    n: Omit<AppNotification, 'id' | 'time' | 'read'>,
  ): StoreState => ({
    ...s,
    notifications: [
      { id: uid(), time: new Date().toISOString(), read: false, ...n },
      ...s.notifications,
    ].slice(0, 80),
  });

  // ===== Engine reminder berbasis waktu (cek tiap 20 detik) =====
  useEffect(() => {
    if (!currentUser) return;
    const tick = () => {
      const now = new Date();
      const hhmm = nowHHMM();
      const day = now.getDay();
      const today = todayStr();
      setState((s) => {
        let changed = false;
        let next = { ...s, notifications: [...s.notifications] };
        for (const r of s.reminders) {
          if (!r.active) continue;
          if (r.time !== hhmm) continue;
          if (!r.days.includes(day)) continue;
          if (s.fired[r.id] === today) continue;
          changed = true;
          next.fired = { ...next.fired, [r.id]: today };
          // Notifikasi hanya muncul untuk peran penerima yang sedang login
          if (!r.roles.includes(currentUser.role)) continue;
          next = pushNotification(next, {
            type: 'reminder',
            title: `Pengingat: ${r.title}`,
            body: `Jadwal reminder ${r.time} WIB — ${r.title}. Pastikan pekerjaan ini diselesaikan dan dicentang.`,
            roles: [currentUser.role],
            userId: currentUser.id,
          });
        }
        // Deteksi checklist terlambat (setelah jam 15:00 untuk shift pagi/siang)
        const mins = now.getHours() * 60 + now.getMinutes();
        if (mins >= 15 * 60 && mins < 23 * 60) {
          for (const u of s.users) {
            if (!u.active || u.role === 'wakil') continue;
            if (s.lateNotified[u.id] === today) continue;
            const defs = defsForRole(u.role);
            const log = s.days[dayKey(u.id, today)];
            const done = log ? Object.keys(log.items).length : 0;
            if (done < defs.length) {
              changed = true;
              next.lateNotified = { ...next.lateNotified, [u.id]: today };
              next = pushNotification(next, {
                type: 'terlambat',
                title: `Checklist ${u.name.split(' ')[0]} belum lengkap`,
                body: `${u.jabatan} baru menyelesaikan ${done}/${defs.length} item checklist hari ini. Segera diselesaikan sebelum tutup toko.`,
                roles: LEADERSHIP,
              });
            }
          }
        }
        return changed ? next : s;
      });
    };
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // ===== AUTH =====
  const login: StoreContextValue['login'] = (identifier, password) => {
    const id = identifier.trim().toLowerCase();
    const u = state.users.find(
      (x) => x.email.toLowerCase() === id || x.username.toLowerCase() === id,
    );
    if (!u) return { ok: false, error: 'Email / username tidak terdaftar. Periksa kembali atau daftar akun baru.' };
    if (u.password !== password) return { ok: false, error: 'Password salah. Coba lagi atau gunakan "Lupa Password".' };
    if (!u.active) return { ok: false, error: 'Akun dinonaktifkan. Hubungi Komandan Mispin untuk aktivasi.' };
    sessionStorage.setItem(SESSION_KEY, u.id);
    setCurrentUserId(u.id);
    return { ok: true, user: u };
  };

  const register: StoreContextValue['register'] = (data) => {
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim().toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === email))
      return { ok: false, error: 'Email sudah terdaftar. Gunakan email lain atau langsung masuk.' };
    if (state.users.some((u) => u.username.toLowerCase() === username))
      return { ok: false, error: 'Username sudah dipakai. Pilih username lain.' };
    if (data.password.length < 6)
      return { ok: false, error: 'Password minimal 6 karakter.' };
    const palette = ['#b91c1c', '#4338ca', '#d97706', '#059669', '#0e7490', '#7c3aed', '#be185d', '#334155'];
    const newUser: User = {
      id: uid(),
      name: data.name.trim(),
      username,
      email,
      password: data.password,
      role: data.role,
      jabatan: data.jabatan.trim() || (data.role === 'goreng' ? 'Goreng' : data.role === 'koki' ? 'Koki' : 'Staff'),
      shift: data.shift,
      phone: data.phone.trim(),
      color: palette[state.users.length % palette.length],
      active: true,
      joinDate: todayStr(),
    };
    setState((s) =>
      pushNotification(
        { ...s, users: [...s.users, newUser] },
        { type: 'info', title: `Anggota baru: ${newUser.name}`, body: `${newUser.jabatan} (${newUser.shift}) baru saja mendaftar ke aplikasi.`, roles: LEADERSHIP },
      ),
    );
    sessionStorage.setItem(SESSION_KEY, newUser.id);
    setCurrentUserId(newUser.id);
    return { ok: true, user: newUser };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUserId(null);
  };

  const updateProfile: StoreContextValue['updateProfile'] = (patch) => {
    if (!currentUser) return;
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)),
    }));
  };

  const changePassword: StoreContextValue['changePassword'] = (oldPw, newPw) => {
    if (!currentUser) return { ok: false, error: 'Sesi berakhir.' };
    if (currentUser.password !== oldPw) return { ok: false, error: 'Password lama salah.' };
    if (newPw.length < 6) return { ok: false, error: 'Password baru minimal 6 karakter.' };
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === currentUser.id ? { ...u, password: newPw } : u)),
    }));
    return { ok: true };
  };

  // ===== CHECKLIST =====
  const getItemState: StoreContextValue['getItemState'] = (userId, defId, date = todayStr()) =>
    state.days[dayKey(userId, date)]?.items[defId];

  const mutateDay = (userId: string, date: string, fn: (items: Record<string, ItemState>) => Record<string, ItemState>) =>
    setState((s) => {
      const key = dayKey(userId, date);
      const existing = s.days[key];
      const items = fn({ ...(existing?.items ?? {}) });
      return {
        ...s,
        days: {
          ...s.days,
          [key]: {
            items,
            sentAt: existing?.sentAt ?? null,
            verifiedAt: existing?.verifiedAt ?? null,
            verifiedBy: existing?.verifiedBy ?? null,
          },
        },
      };
    });

  const toggleItem: StoreContextValue['toggleItem'] = (defId) => {
    if (!currentUser) return;
    const today = todayStr();
    mutateDay(currentUser.id, today, (items) => {
      const next = { ...items };
      if (next[defId]) delete next[defId]; // uncheck
      else next[defId] = { status: 'ok', note: '', checkedAt: new Date().toISOString() };
      return next;
    });
  };

  const setItemStatus: StoreContextValue['setItemStatus'] = (defId, status) => {
    if (!currentUser) return;
    mutateDay(currentUser.id, todayStr(), (items) => {
      const cur = items[defId];
      if (!cur) return { ...items, [defId]: { status, note: '', checkedAt: new Date().toISOString() } };
      return { ...items, [defId]: { ...cur, status } };
    });
  };

  const setItemNote: StoreContextValue['setItemNote'] = (defId, note) => {
    if (!currentUser) return;
    mutateDay(currentUser.id, todayStr(), (items) => {
      const cur = items[defId];
      if (!cur) return { ...items, [defId]: { status: 'ok', note, checkedAt: new Date().toISOString() } };
      return { ...items, [defId]: { ...cur, note } };
    });
  };

  // Untuk dashboard kepala koki: koreksi/hapus milik anggota
  const setItemNoteFor: StoreContextValue['setItemNoteFor'] = (userId, defId, note, date = todayStr()) =>
    mutateDay(userId, date, (items) => {
      const cur = items[defId];
      if (!cur) return items;
      return { ...items, [defId]: { ...cur, note } };
    });

  const clearItemFor: StoreContextValue['clearItemFor'] = (userId, defId, date = todayStr()) =>
    mutateDay(userId, date, (items) => {
      const next = { ...items };
      delete next[defId];
      return next;
    });

  const submitReport: StoreContextValue['submitReport'] = (catatan) => {
    if (!currentUser) return null;
    const today = todayStr();
    const defs = defsForRole(currentUser.role);
    const log = state.days[dayKey(currentUser.id, today)];
    const items = defs
      .filter((d) => log?.items[d.id])
      .map((d) => ({
        id: d.id,
        title: d.title,
        time: d.time,
        status: log!.items[d.id].status,
        note: log!.items[d.id].note,
      }));
    if (items.length === 0) return null;
    const report: Report = {
      id: uid(),
      userId: currentUser.id,
      userName: currentUser.name,
      jabatan: currentUser.jabatan,
      role: currentUser.role,
      shift: currentUser.shift,
      date: today,
      total: defs.length,
      done: items.length,
      okCount: items.filter((i) => i.status === 'ok').length,
      periksaCount: items.filter((i) => i.status === 'periksa').length,
      masalahCount: items.filter((i) => i.status === 'masalah').length,
      catatan: catatan.trim(),
      items,
      sentAt: new Date().toISOString(),
      verified: false,
      verifiedBy: null,
      verifiedAt: null,
    };
    setState((s) => {
      const key = dayKey(currentUser.id, today);
      const existing = s.days[key];
      // Hapus laporan lama hari ini milik user ini agar tidak duplikat
      const filteredReports = s.reports.filter((r) => !(r.userId === currentUser.id && r.date === today));
      let next: StoreState = {
        ...s,
        reports: [report, ...filteredReports],
        days: {
          ...s.days,
          [key]: {
            items: existing?.items ?? {},
            sentAt: report.sentAt,
            verifiedAt: existing?.verifiedAt ?? null,
            verifiedBy: existing?.verifiedBy ?? null,
          },
        },
      };
      next = pushNotification(next, {
        type: 'laporan',
        title: `Laporan masuk: ${currentUser.name.split(' ')[0]}`,
        body: `${currentUser.jabatan} mengirim laporan ${report.done}/${report.total} item (${report.okCount} OK · ${report.periksaCount} periksa · ${report.masalahCount} masalah). Menunggu verifikasi.`,
        roles: ['koki', 'komandan', 'wakil'],
      });
      return next;
    });
    return report;
  };

  const verifyReport: StoreContextValue['verifyReport'] = (reportId) => {
    if (!currentUser) return;
    setState((s) => {
      const rep = s.reports.find((r) => r.id === reportId);
      if (!rep) return s;
      let next: StoreState = {
        ...s,
        reports: s.reports.map((r) =>
          r.id === reportId ? { ...r, verified: true, verifiedBy: currentUser.name, verifiedAt: new Date().toISOString() } : r,
        ),
      };
      next = pushNotification(next, {
        type: 'laporan',
        title: `Laporan ${rep.userName.split(' ')[0]} terverifikasi`,
        body: `${currentUser.name} memverifikasi laporan ${fmtTgl(rep.date)} milik ${rep.userName}. ${rep.masalahCount > 0 ? `${rep.masalahCount} item masalah perlu ditindaklanjuti.` : 'Semua item OK.'}`,
        roles: ['komandan', 'wakil'],
        userId: rep.userId,
      });
      return next;
    });
  };

  const unverifyReport: StoreContextValue['unverifyReport'] = (reportId) =>
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) =>
        r.id === reportId ? { ...r, verified: false, verifiedBy: null, verifiedAt: null } : r,
      ),
    }));

  const fmtTgl = (d: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d + 'T00:00:00'));

  // ===== ISSUES =====
  const addIssue: StoreContextValue['addIssue'] = (title, detail, severity) => {
    if (!currentUser) return;
    const issue: Issue = {
      id: uid(),
      title: title.trim(),
      detail: detail.trim(),
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      date: todayStr(),
      time: nowHHMM(),
      severity,
      status: 'open',
    };
    setState((s) =>
      pushNotification(
        { ...s, issues: [issue, ...s.issues] },
        {
          type: 'masalah',
          title: `Masalah baru: ${issue.title}`,
          body: `${currentUser.name} melaporkan — ${detail.trim().slice(0, 120)}`,
          roles: LEADERSHIP,
        },
      ),
    );
  };

  const setIssueStatus: StoreContextValue['setIssueStatus'] = (id, status) =>
    setState((s) => ({ ...s, issues: s.issues.map((i) => (i.id === id ? { ...i, status } : i)) }));

  const deleteIssue: StoreContextValue['deleteIssue'] = (id) =>
    setState((s) => ({ ...s, issues: s.issues.filter((i) => i.id !== id) }));

  // ===== NOTIFICATIONS =====
  const markNotifRead: StoreContextValue['markNotifRead'] = (id) =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));

  const markAllNotifRead: StoreContextValue['markAllNotifRead'] = () =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));

  const clearNotifications: StoreContextValue['clearNotifications'] = () =>
    setState((s) => ({ ...s, notifications: [] }));

  const deleteNotification: StoreContextValue['deleteNotification'] = (id) =>
    setState((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) }));

  // ===== REMINDERS =====
  const saveReminder: StoreContextValue['saveReminder'] = (r) =>
    setState((s) => {
      if (r.id) {
        return { ...s, reminders: s.reminders.map((x) => (x.id === r.id ? { ...r, id: r.id! } : x)) };
      }
      return { ...s, reminders: [...s.reminders, { ...r, id: uid() }] };
    });

  const deleteReminder: StoreContextValue['deleteReminder'] = (id) =>
    setState((s) => ({
      ...s,
      reminders: s.reminders.filter((r) => r.id !== id),
      fired: Object.fromEntries(Object.entries(s.fired).filter(([k]) => k !== id)),
    }));

  const toggleReminder: StoreContextValue['toggleReminder'] = (id) =>
    setState((s) => ({ ...s, reminders: s.reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r)) }));

  // ===== AKUN (Komandan Mispin) =====
  const addAccount: StoreContextValue['addAccount'] = (data) =>
    setState((s) => ({
      ...s,
      users: [
        ...s.users,
        {
          ...data,
          id: uid(),
          active: true,
          joinDate: todayStr(),
          color: ['#b91c1c', '#4338ca', '#d97706', '#059669', '#0e7490', '#7c3aed', '#be185d', '#334155'][s.users.length % 8],
        },
      ],
    }));

  const updateAccount: StoreContextValue['updateAccount'] = (id, patch) =>
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));

  const toggleAccount: StoreContextValue['toggleAccount'] = (id) =>
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id && id !== 'u-mispin' ? { ...u, active: !u.active } : u)) }));

  const deleteAccount: StoreContextValue['deleteAccount'] = (id) => {
    if (id === 'u-mispin') return false;
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
    return true;
  };

  const resetPassword: StoreContextValue['resetPassword'] = (id) => {
    const temp = 'kk' + Math.random().toString(36).slice(2, 6) + Math.floor(10 + Math.random() * 89);
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, password: temp } : u)) }));
    return temp;
  };

  // ===== VISITS =====
  const addVisit: StoreContextValue['addVisit'] = (v) =>
    setState((s) => ({ ...s, visits: [{ ...v, id: uid() }, ...s.visits] }));

  const deleteVisit: StoreContextValue['deleteVisit'] = (id) =>
    setState((s) => ({ ...s, visits: s.visits.filter((v) => v.id !== id) }));

  const resetDemoData = () => {
    const fresh = buildSeedState();
    setState(fresh);
  };

  const periodProgress: StoreContextValue['periodProgress'] = (date, userId) => {
    const user = state.users.find((u) => u.id === userId);
    const total = user ? defsForRole(user.role).length : 0;
    const log = state.days[dayKey(userId, date)];
    const done = log ? Object.keys(log.items).length : 0;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  };

  const value: StoreContextValue = {
    users: state.users,
    currentUser,
    sessionLoading: false,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getItemState,
    toggleItem,
    setItemStatus,
    setItemNote,
    setItemNoteFor,
    clearItemFor,
    submitReport,
    verifyReport,
    unverifyReport,
    reports: state.reports,
    issues: state.issues,
    notifications: state.notifications,
    reminders: state.reminders,
    visits: state.visits,
    addIssue,
    setIssueStatus,
    deleteIssue,
    markNotifRead,
    markAllNotifRead,
    clearNotifications,
    deleteNotification,
    saveReminder,
    deleteReminder,
    toggleReminder,
    addAccount,
    updateAccount,
    toggleAccount,
    deleteAccount,
    resetPassword,
    addVisit,
    deleteVisit,
    resetDemoData,
    periodProgress,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore harus di dalam StoreProvider');
  return ctx;
}
