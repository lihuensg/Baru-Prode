import { Trophy, Target, CheckCircle, Calendar, Clock, TrendingUp } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { useAuth } from '../../hooks/useAuth';
import { predictionsService } from '../../services/predictionsService';
import { rankingService } from '../../services/rankingService';
import { matchesService } from '../../services/matchesService';
import { useProdeStatus } from '../../hooks/useProdeStatus';
import { LockBanner } from '../../components/ui/LockBanner';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
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
}

export function UserDashboardPage() {
  const { user } = useAuth();
  const { isOpen, countdown } = useProdeStatus();
  const stats = predictionsService.getUserStats(user!.id);
  const ranking = rankingService.getAll();
  const myRank = ranking.find(r => r.userId === user!.id);
  const totalMatches = matchesService.getAll().length;

  return (
    <AppLayout variant="user">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 font-display">
          Hola, {user?.fullName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Prode Mundial 2026 · Club Deportivo Barú</p>
      </div>

      {/* Lock banner */}
      {!isOpen && <LockBanner />}

      {/* Countdown if open */}
      {isOpen && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">El prode está abierto</p>
            <p className="text-xs text-blue-600">
              Cierra en: <strong>{countdown.days}d {countdown.hours}h {countdown.minutes}m</strong> · Aprovechá para completar tus pronósticos.
            </p>
          </div>
          <Link
            to="/app/pronosticos"
            className="ml-auto bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors flex-shrink-0"
          >
            Ir ahora →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Puntos totales"
          value={stats.totalPoints}
          icon={<Trophy className="w-4 h-4 text-amber-600" />}
          color="bg-amber-50"
          sub="3 pts por acierto"
        />
        <StatCard
          label="Posición"
          value={myRank?.position ? `#${myRank.position}` : '-'}
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          color="bg-blue-50"
          sub={`de ${ranking.length} participantes`}
        />
        <StatCard
          label="Aciertos"
          value={stats.totalCorrect}
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          color="bg-emerald-50"
          sub={`de ${stats.totalPredicted} pronosticados`}
        />
        <StatCard
          label="Pronósticos"
          value={`${stats.totalPredicted}/${totalMatches}`}
          icon={<Target className="w-4 h-4 text-indigo-600" />}
          color="bg-indigo-50"
          sub={isOpen ? `${totalMatches - stats.totalPredicted} pendientes` : 'Cerrado'}
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/app/pronosticos"
          className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-2xl p-6 text-white card-hover group"
        >
          <Calendar className="w-8 h-8 text-blue-200 mb-3" />
          <h3 className="font-bold text-lg mb-1">Mis pronósticos</h3>
          <p className="text-blue-200 text-sm">
            {isOpen ? 'Completá o editá tus pronósticos de la fase de grupos.' : 'Ver tus pronósticos y resultados.'}
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-blue-200 group-hover:text-white transition-colors">
            Ir a pronósticos →
          </span>
        </Link>

        <Link
          to="/app/ranking"
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover group"
        >
          <Trophy className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-bold text-lg text-slate-800 mb-1">Ranking general</h3>
          <p className="text-slate-500 text-sm">
            {myRank ? `Estás en la posición #${myRank.position} con ${myRank.totalPoints} puntos.` : 'Ver la tabla de posiciones del club.'}
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
            Ver ranking →
          </span>
        </Link>
      </div>
    </AppLayout>
  );
}
