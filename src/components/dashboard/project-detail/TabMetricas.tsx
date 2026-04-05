'use client';

import { Project } from './types';

export default function TabMetricas({ project }: { project: Project }) {
  const metricCards = [
    { label: 'Tareas totales', value: 0 },
    { label: 'Tareas vencidas', value: 0 },
    { label: 'En revisión', value: 0 },
    { label: 'Actividad (7 días)', value: '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="3.5"
              strokeDasharray="0 100"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">0%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Salud del proyecto</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Sin tareas vencidas</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">0% de avance completado</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Avance por columna</h3>
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No hay columnas configuradas en el tablero.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tareas vencidas</h3>
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No hay tareas vencidas.</p>
        </div>
      </div>
    </div>
  );
}
