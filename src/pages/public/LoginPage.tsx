import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogIn, Shield, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PublicLayout } from '../../layouts/PublicLayout';

export function LoginPage() {
  const { login, loginAsAdmin, loginAsUser, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/app', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500)); // simulate latency
    const ok = login(username, password);
    if (!ok) {
      setError('Usuario o contraseña incorrectos.');
    }
    setLoading(false);
  };

  const handleQuickAdmin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    loginAsAdmin();
    navigate('/admin');
  };

  const handleQuickUser = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    loginAsUser();
    navigate('/app');
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-8 text-center">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <span className="text-blue-700 font-black text-lg">CB</span>
              </div>
              <h1 className="text-white text-2xl font-black font-display">Iniciar sesión</h1>
              <p className="text-blue-200 text-sm mt-1">Club Deportivo Barú · Prode 2026</p>
            </div>

            <div className="px-8 py-7">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="login-username">
                    Usuario
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="tu.usuario"
                    autoComplete="username"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="login-password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  Ingresar
                </button>
              </form>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400 font-medium">Acceso rápido (demo)</span>
                </div>
              </div>

              {/* Quick access buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleQuickAdmin}
                  disabled={loading}
                  id="quick-login-admin"
                  className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold py-2.5 px-3 rounded-xl text-sm transition-colors"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  Administrador
                </button>
                <button
                  onClick={handleQuickUser}
                  disabled={loading}
                  id="quick-login-user"
                  className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2.5 px-3 rounded-xl text-sm transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Participante
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-5">
                ¿No tenés usuario? Acercate al club y consultá con la administración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
