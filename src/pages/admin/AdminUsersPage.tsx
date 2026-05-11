import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Power, X, Check } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { PaymentStatusBadge, ActiveBadge } from '../../components/ui/StatusBadge';
import { usersService } from '../../services/usersService';
import type { User, PaymentStatus } from '../../types';

// ─── User Form Modal ──────────────────────────────────────────────────────────

interface UserFormData {
  fullName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  paymentStatus: PaymentStatus;
}



interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState<UserFormData>({
    fullName: user?.fullName ?? '',
    username: user?.username ?? '',
    password: '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    paymentStatus: user?.paymentStatus ?? 'PENDING',
  });

  const field = (key: keyof UserFormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.username) {
      toast.error('Completá nombre y usuario.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{user ? 'Editar usuario' : 'Crear usuario'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo *</label>
              <input
                {...field('fullName')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Usuario *</label>
              <input
                {...field('username')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="juan.perez"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contraseña {!user && '*'}
              </label>
              <input
                {...field('password')}
                type="password"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={user ? 'Dejar vacío para no cambiar' : '••••••••'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
              <input
                {...field('phone')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="11xxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                {...field('email')}
                type="email"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="juan@email.com"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estado de pago</label>
              <select
                {...field('paymentStatus')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagó</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {user ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(() => usersService.getParticipants());
  const [modal, setModal] = useState<{ open: boolean; user?: User }>({ open: false });

  const refresh = () => setUsers(usersService.getParticipants());

  const handleSave = (data: UserFormData) => {
    if (modal.user) {
      usersService.update(modal.user.id, {
        fullName: data.fullName,
        username: data.username,
        email: data.email || undefined,
        phone: data.phone || undefined,
        paymentStatus: data.paymentStatus,
      });
      toast.success('Usuario actualizado correctamente');
    } else {
      usersService.create({
        fullName: data.fullName,
        username: data.username,
        email: data.email || undefined,
        phone: data.phone || undefined,
        paymentStatus: data.paymentStatus,
        role: 'USER',
        isActive: true,
      });
      toast.success('Usuario creado correctamente');
    }
    refresh();
    setModal({ open: false });
  };

  const handleToggle = (user: User) => {
    usersService.toggleActive(user.id);
    refresh();
    toast.success(user.isActive ? 'Usuario desactivado' : 'Usuario activado');
  };

  return (
    <AppLayout variant="admin">
      <PageHeader
        title="Usuarios"
        subtitle={`${users.length} participantes registrados`}
        action={
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No hay participantes"
            description="Creá el primer usuario para comenzar."
            action={
              <button
                onClick={() => setModal({ open: true })}
                className="bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-800 transition-colors"
              >
                Crear usuario
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Contacto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Pago</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-400 sm:hidden">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-slate-600 font-mono">@{user.username}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-slate-500">{user.phone || '—'}</p>
                      <p className="text-xs text-slate-400">{user.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <PaymentStatusBadge status={user.paymentStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ActiveBadge isActive={user.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ open: true, user })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggle(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.isActive
                              ? 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                              : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                          }`}
                          title={user.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <UserModal
          user={modal.user}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </AppLayout>
  );
}
