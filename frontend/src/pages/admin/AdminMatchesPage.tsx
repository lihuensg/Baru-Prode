import { useEffect, useState } from 'react';
import { Plus, Pencil, X, Check, Calendar, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FlagIcon } from '../../components/ui/FlagIcon';
import { matchesService } from '../../services/matchesService';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandler';
import { formatTournamentDateLabel } from '../../utils/timezone';
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
  onSave: (data: MatchFormData) => void | Promise<void>;
}

interface DeleteModalProps {
  match: Match;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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

  const [errors, setErrors] = useState<Partial<Record<keyof MatchFormData, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof MatchFormData, string>> = {};
    if (!form.homeTeam) nextErrors.homeTeam = 'Completá el equipo local.';
    if (!form.awayTeam) nextErrors.awayTeam = 'Completá el equipo visitante.';
    if (!form.date) nextErrors.date = 'Completá la fecha del partido.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    void onSave(form);
  };

  const field = (key: keyof MatchFormData) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const nextValue = e.target.value;
      setForm(prev => ({
        ...prev,
        [key]: nextValue,
      }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    },
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
                {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => <option key={g}>{g}</option>)}
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Equipo local *</label>
              <div className="flex gap-2">
                <div className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-sm text-center bg-slate-50 flex items-center justify-center">
                  <FlagIcon teamName={form.homeTeam} fallback={form.homeFlag} size="sm" />
                </div>
                <input {...field('homeTeam')} placeholder="Argentina" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">La bandera se carga automáticamente según el equipo.</p>
              {errors.homeTeam && <p className="mt-1 text-xs text-red-500">{errors.homeTeam}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Equipo visitante *</label>
              <div className="flex gap-2">
                <div className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-sm text-center bg-slate-50 flex items-center justify-center">
                  <FlagIcon teamName={form.awayTeam} fallback={form.awayFlag} size="sm" />
                </div>
                <input {...field('awayTeam')} placeholder="Brasil" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">La bandera se carga automáticamente según el equipo.</p>
              {errors.awayTeam && <p className="mt-1 text-xs text-red-500">{errors.awayTeam}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha *</label>
              <input {...field('date')} type="date" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
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

function DeleteMatchModal({ match, loading = false, onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-3 px-6 pt-6">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Eliminar partido</h2>
            <p className="text-sm text-slate-500">Acción irreversible</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-slate-700 leading-6">
            ¿Estás seguro de eliminar este partido? <br />
            <span className="font-semibold text-slate-900">
              Esta acción no se puede deshacer.
            </span>
          </p>
          <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">{match.homeTeam} vs {match.awayTeam}</p>
            <p className="text-xs text-slate-500 mt-1">Grupo {match.group} · {formatTournamentDateLabel(`${match.date}T12:00:00-03:00`)} {match.time}</p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [modal, setModal] = useState<{ open: boolean; match?: Match }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; match?: Match }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const groups = [...new Set(matches.map(match => match.group))].sort();
  const filtered = filterGroup === 'all' ? matches : matches.filter(m => m.group === filterGroup);

  const refresh = async () => setMatches(await matchesService.getAll());

  useEffect(() => {
    void refresh();
  }, []);

  const handleSave = async (data: MatchFormData) => {
    try {
      if (modal.match) {
        await matchesService.update(modal.match.id, data);
        showSuccessToast('Partido actualizado correctamente.');
      } else {
        await matchesService.create(data);
        showSuccessToast('Partido creado correctamente.');
      }
      void refresh();
      setModal({ open: false });
    } catch (err) {
      showErrorToast(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.match) return;

    setDeleting(true);
    try {
      await matchesService.delete(deleteModal.match.id);
      showSuccessToast('Partido eliminado correctamente.');
      setDeleteModal({ open: false });
      void refresh();
    } catch (err) {
      showErrorToast(err);
    } finally {
      setDeleting(false);
    }
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
        <div className="hidden md:block overflow-x-auto">
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
                      <FlagIcon teamName={match.homeTeam} fallback={match.homeFlag} size="sm" />
                      <span className="font-semibold text-slate-800">{match.homeTeam}</span>
                      <span className="text-slate-400 text-xs font-bold">vs</span>
                      <span className="font-semibold text-slate-800">{match.awayTeam}</span>
                      <FlagIcon teamName={match.awayTeam} fallback={match.awayFlag} size="sm" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{match.group}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatTournamentDateLabel(`${match.date}T12:00:00-03:00`)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge type="match" value={match.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModal({ open: true, match })}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                        aria-label="Editar partido"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, match })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                        aria-label="Eliminar partido"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filtered.map(match => (
            <div key={match.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 min-w-0">
                    <span className="shrink-0"><FlagIcon teamName={match.homeTeam} fallback={match.homeFlag} size="sm" /></span>
                    <span className="truncate">{match.homeTeam}</span>
                    <span className="text-slate-400 text-xs font-bold shrink-0">vs</span>
                    <span className="truncate">{match.awayTeam}</span>
                    <span className="shrink-0"><FlagIcon teamName={match.awayTeam} fallback={match.awayFlag} size="sm" /></span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{match.group}</span>
                    <StatusBadge type="match" value={match.status} />
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatTournamentDateLabel(`${match.date}T12:00:00-03:00`)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setModal({ open: true, match })}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                    aria-label="Editar partido"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, match })}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                    aria-label="Eliminar partido"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal.open && (
        <MatchModal
          match={modal.match}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}

      {deleteModal.open && deleteModal.match && (
        <DeleteMatchModal
          match={deleteModal.match}
          loading={deleting}
          onClose={() => !deleting && setDeleteModal({ open: false })}
          onConfirm={handleDelete}
        />
      )}
    </AppLayout>
  );
}
