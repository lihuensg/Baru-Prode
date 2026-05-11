import { Link } from 'react-router-dom';
import { MessageCircle, LogIn, MapPin } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';

export function ParticiparPage() {
  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-8 text-center">
              <div className="text-5xl mb-3">⚽</div>
              <h1 className="text-white text-2xl font-black font-display">¿Cómo participar?</h1>
              <p className="text-blue-200 text-sm mt-1">Prode Mundial 2026 · Club Deportivo Barú</p>
            </div>

            <div className="px-8 py-8">
              {/* Steps */}
              <div className="space-y-5 mb-8">
                {[
                  {
                    step: '01',
                    icon: <MapPin className="w-5 h-5 text-blue-600" />,
                    title: 'Acercate al club',
                    description: 'Visitanos en nuestra sede y hablá con el administrador del prode.',
                  },
                  {
                    step: '02',
                    icon: <span className="text-blue-600 font-bold text-base">$</span>,
                    title: 'Realizá el pago',
                    description: 'Abonás la inscripción en persona en el club. El monto lo indica la administración.',
                  },
                  {
                    step: '03',
                    icon: <LogIn className="w-5 h-5 text-blue-600" />,
                    title: 'Recibís tu acceso',
                    description: 'El administrador te crea un usuario y contraseña para ingresar a la app.',
                  },
                  {
                    step: '04',
                    icon: <span className="text-2xl">🏆</span>,
                    title: '¡A pronosticar!',
                    description: 'Ingresás con tu usuario y empezás a cargar tus pronósticos para la fase de grupos.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-400 mb-0.5">PASO {item.step}</p>
                      <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-slate-500 text-sm mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm mb-1">No existe registro libre</p>
                    <p className="text-blue-700 text-sm">
                      Los usuarios son creados exclusivamente por el administrador del club después de verificar el pago.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Ya tengo usuario — Iniciar sesión
                </Link>
                <Link
                  to="/"
                  className="w-full flex items-center justify-center text-slate-500 hover:text-slate-700 text-sm font-medium py-2 rounded-xl transition-colors"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
