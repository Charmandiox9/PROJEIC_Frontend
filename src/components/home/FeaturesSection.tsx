import { KanbanSquare, Activity, Globe, Users } from 'lucide-react';

const FEATURES = [
  {
    id: 1,
    title: 'Tablero Kanban',
    description: 'Organiza tareas en columnas configurables con registro automático de actividad.',
    icon: KanbanSquare,
  },
  {
    id: 2,
    title: 'Indicadores de salud',
    description: 'Semáforo verde/amarillo/rojo calculado a partir de actividad y tareas vencidas.',
    icon: Activity,
  },
  {
    id: 3,
    title: 'Página pública',
    description: 'URL compartible por proyecto, visible sin login para la comunidad universitaria.',
    icon: Globe,
  },
  {
    id: 4,
    title: 'Roles flexibles',
    description: 'Administrador, Supervisor, Estudiante y Externo con permisos diferenciados.',
    icon: Users,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 bg-surface-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">Que ofrece PROJEIC?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-sm sm:text-base">
            Herramientas diseñadas para los ritmos y necesidades de la comunidad EIC
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="bg-surface-primary p-5 sm:p-6 rounded-xl shadow-sm border border-border-primary">
                <div className="w-12 h-12 bg-brand-light dark:bg-brand/20 text-brand dark:text-brand-light rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}