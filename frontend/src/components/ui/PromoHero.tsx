import { Trophy } from 'lucide-react';

export function PromoHero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/assets/football-pattern.svg')] bg-right-bottom bg-no-repeat" />

        <div className="relative p-4 sm:p-8 md:p-10 lg:p-12 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center md:justify-between gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4 md:gap-6 min-w-0">
              <div className="flex-shrink-0 bg-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
              </div>

              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight break-words">Ganá el torneo</h3>
                <p className="mt-1 text-xs sm:text-sm text-white/90 break-words">Participá en el Prode del club y competí por el premio mayor.</p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
              <div className="text-xs sm:text-sm text-white/80">Inscripción</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black leading-none">$10.000</div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-white/80 max-w-2xl">
            <ul className="list-disc list-inside space-y-1">
              <li>Premio: <strong>60% de lo recaudado</strong>.</li>
              <li>En caso de empate, el premio se repartirá entre los ganadores.</li>
              <li>Inscribite y empezá a pronosticar — es divertido y solidario.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromoHero;
