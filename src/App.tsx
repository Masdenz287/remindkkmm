import { useEffect, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { StoreProvider, useStore } from './lib/store';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import HariIni from './pages/HariIni';
import Riwayat from './pages/Riwayat';
import Kunjungan from './pages/Kunjungan';
import Lainnya from './pages/Lainnya';
import Anggota from './pages/Anggota';
import Akun from './pages/Akun';
import KepalaKoki from './pages/KepalaKoki';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Hanya boleh diakses bila sudah login */
function RequireAuth() {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Hanya boleh diakses bila BELUM login (login/daftar) */
function RequireGuest() {
  const { currentUser } = useStore();
  if (currentUser) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Khusus peran tertentu */
function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Publik — hanya untuk tamu */}
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<><Login /><Toaster position="top-center" richColors /></>} />
            <Route path="/daftar" element={<><Register /><Toaster position="top-center" richColors /></>} />
          </Route>

          {/* Terproteksi — layout dengan header & bottom nav */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HariIni />} />
              <Route path="/riwayat" element={<Riwayat />} />
              <Route path="/kunjungan" element={<Kunjungan />} />
              <Route path="/lainnya" element={<Lainnya />} />
              <Route path="/anggota" element={<RequireRole roles={['komandan', 'wakil', 'koki']}><Anggota /></RequireRole>} />
              <Route path="/kepala-koki" element={<RequireRole roles={['komandan', 'wakil', 'koki']}><KepalaKoki /></RequireRole>} />
              <Route path="/akun" element={<RequireRole roles={['komandan']}><Akun /></RequireRole>} />
              {/* Halaman manajemen akun disisipkan di Lainnya lewat tautan untuk komandan */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
