import { Users, Calendar, BarChart3, CheckCircle, Trophy, Activity } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { usersService } from '../../services/usersService';
import { matchesService } from '../../services/matchesService';
import { predictionsService } from '../../services/predictionsService';
import { settingsService } from '../../services/settingsService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  href?: string;
}

function AdminStatCard({ label, value, icon, color, sub, href }: StatCardProps) {
  const inner = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 font-display">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );

  if (href) return <Link to={href} className="block h-full">{inner}</Link>;
  return inner;
}

export function AdminDashboardPage() {
  const userStats = usersService.getStats();
  const matchStats = matchesService.getStats();
  const isOpen = settingsService.isProdeOpen();
  const countdown = settingsService.getCountdown();

  // Count total predictions across all users
  const allPredictions = predictionsService.getAll();

  return (
    <AppLayout variant="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 font-display">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Panel de administración · Prode Mundial 2026</p>
      </div>

      {/* Prode status banner */}
      <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 ${
        isOpen ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
      }`}>
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${isOpen ? 'text-emerald-600' : 'text-red-500'}`} />
          <div>
            <p className={`font-semibold text-sm ${isOpen ? 'text-emerald-800' : 'text-red-800'}`}>
              Estado del prode: <StatusBadge type="prode" value={isOpen ? 'OPEN' : 'CLOSED'} className="ml-1" />
            </p>
            <p className={`text-xs mt-0.5 ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
              {isOpen
                ? `Cierra en: ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
                : 'Los usuarios ya no pueden modificar sus pronósticos.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AdminStatCard
          label="Participantes"
          value={userStats.total}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          color="bg-blue-50"
          sub={`${userStats.active} activos · ${userStats.pending} pago pendiente`}
          href="/admin/usuarios"
        />
        <AdminStatCard
          label="Activos"
          value={userStats.active}
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          color="bg-emerald-50"
          sub={`${userStats.paid} pagaron`}
        />
        <AdminStatCard
          label="Partidos"
          value={matchStats.total}
          icon={<Calendar className="w-4 h-4 text-indigo-600" />}
          color="bg-indigo-50"
          sub={`${matchStats.finished} finalizados · ${matchStats.scheduled} programados`}
          href="/admin/partidos"
        />
        <AdminStatCard
          label="Finalizados"
          value={matchStats.finished}
          icon={<Trophy className="w-4 h-4 text-amber-600" />}
          color="bg-amber-50"
          sub="Con resultado cargado"
          href="/admin/resultados"
        />
        <AdminStatCard
          label="Pronósticos"
          value={allPredictions.length}
          icon={<BarChart3 className="w-4 h-4 text-purple-600" />}
          color="bg-purple-50"
          sub={`De ${userStats.active} participantes activos`}
        />
        <AdminStatCard
          label="Pago pendiente"
          value={userStats.pending}
          icon={<Users className="w-4 h-4 text-orange-600" />}
          color="bg-orange-50"
          sub="Usuarios sin confirmar pago"
          href="/admin/usuarios"
        />
      </div>

      {/* Quick actions */}
      <h2 className="text-base font-bold text-slate-700 mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/admin/usuarios', label: 'Gestionar usuarios', icon: '👥' },
          { to: '/admin/partidos', label: 'Gestionar partidos', icon: '📋' },
          { to: '/admin/resultados', label: 'Cargar resultados', icon: '✅' },
          { to: '/admin/ranking', label: 'Ver ranking', icon: '🏆' },
        ].map(action => (
          <Link
            key={action.to}
            to={action.to}
            className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
