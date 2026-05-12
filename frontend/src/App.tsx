import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { ParticiparPage } from './pages/public/ParticiparPage';
import { RankingPublicPage } from './pages/public/RankingPublicPage';

// User pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { UserPronosticosPage } from './pages/user/UserPronosticosPage';
import { UserRankingPage } from './pages/user/UserRankingPage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminMatchesPage } from './pages/admin/AdminMatchesPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { AdminRankingPage } from './pages/admin/AdminRankingPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
            success: {
              iconTheme: { primary: '#059669', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* ── Public ─────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/participar" element={<ParticiparPage />} />
          <Route path="/ranking" element={<RankingPublicPage />} />

          {/* ── User (authenticated) ────────────────────── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/pronosticos"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserPronosticosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/ranking"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserRankingPage />
              </ProtectedRoute>
            }
          />

          {/* ── Admin ──────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/partidos"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminMatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resultados"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ranking"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminRankingPage />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ───────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
