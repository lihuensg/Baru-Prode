import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, X, Check, Calendar, Clock } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { matchesService } from '../../services/matchesService';
import type { Match, MatchStatus } from '../../types';

// ─── Match Form Modal ─────────────────────────────────────────────────────────

interface MatchFormData {
  group: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  status: MatchStatus;
  venue: string;
}



interface MatchModalProps {
  match?: Match;
  onClose: () => void;
  onSave: (data: MatchFormData) => void;
}

function MatchModal({ match, onClose, onSave }: MatchModalProps) {
  const [form, setForm] = useState<MatchFormData>({
    group: match?.group ?? 'A',
    homeTeam: match?.homeTeam ?? '',
    awayTeam: match?.awayTeam ?? '',
    homeFlag: match?.homeFlag ?? '🏳️',
    awayFlag: match?.awayFlag ?? '🏳️',
    date: match?.date ?? '',
    time: match?.time ?? '15:00',
    status: match?.status ?? 'SCHEDULED',
    venue: match?.venue ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.date) {
      toast.error('Completá todos los campos obligatorios.');
      return;
    }
    onSave(form);
  };

  const field = (key: keyof MatchFormData) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="font-bold text-slate-800">{match ? 'Editar partido' : 'Nuevo partido'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo *</label>
              <select {...field('group')} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {['A','B','C','D','E','F','G','H'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
              <select {...field('status')} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="SCHEDULED">Programado</option>
                <option value="LIVE">En juego</option>
                <option value="FINISHED">Finalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Equipo local * (flag emoji)</label>
              <div className="flex gap-2">
                <input {...field('homeFlag')} className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input {...field('homeTeam')} placeholder="Argentina" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Equipo visitante * (flag emoji)</label>
              <div className="flex gap-2">
                <input {...field('awayFlag')} className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input {...field('awayTeam')} placeholder="Brasil" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha *</label>
              <input {...field('date')} type="date" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hora</label>
              <input {...field('time')} type="time" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estadio</label>
              <input {...field('venue')} placeholder="MetLife Stadium" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              {match ? 'Guardar cambios' : 'Crear partido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminMatchesPage() {
  const [matches, setMatches] = useState(() => matchesService.getAll());
  const [modal, setModal] = useState<{ open: boolean; match?: Match }>({ open: false });
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const groups = matchesService.getGroups();
  const filtered = filterGroup === 'all' ? matches : matches.filter(m => m.group === filterGroup);

  const refresh = () => setMatches(matchesService.getAll());

  const handleSave = (data: MatchFormData) => {
    if (modal.match) {
      matchesService.update(modal.match.id, data);
      toast.success('Partido actualizado correctamente');
    } else {
      matchesService.create(data);
      toast.success('Partido creado correctamente');
    }
    refresh();
    setModal({ open: false });
  };

  return (
    <AppLayout variant="admin">
      <PageHeader
        title="Partidos"
        subtitle={`${matches.length} partidos cargados`}
        action={
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo partido
          </button>
        }
      />

      {/* Group filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterGroup('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterGroup === 'all' ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
        >
          Todos
        </button>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setFilterGroup(g)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterGroup === g ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Partido</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Grupo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Fecha y hora</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(match => (
                <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{match.homeFlag}</span>
                      <span className="font-semibold text-slate-800">{match.homeTeam}</span>
                      <span className="text-slate-400 text-xs font-bold">vs</span>
                      <span className="font-semibold text-slate-800">{match.awayTeam}</span>
                      <span>{match.awayFlag}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{match.group}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{match.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge type="match" value={match.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setModal({ open: true, match })}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <MatchModal
          match={modal.match}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </AppLayout>
  );
}
