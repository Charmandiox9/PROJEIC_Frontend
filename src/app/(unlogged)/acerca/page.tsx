import { Eye, History, Users, Code2, Code, Database, Server, Container } from 'lucide-react';

const PAGE_TEXTS = {
  heroTitle: 'Acerca de PROJEIC',
  heroSubtitle: 'Transparencia y trazabilidad para los proyectos académicos.',
  aboutTitle: '¿Qué es PROJEIC?',
  aboutDescription: 'PROJEIC es una plataforma de gestión de proyectos académicos desarrollada para la Escuela de Ingeniería Coquimbo de la Universidad Católica del Norte. Su objetivo principal es centralizar el seguimiento, proporcionar visibilidad pública y asegurar la trazabilidad completa del ciclo de vida de los proyectos estudiantiles, conectando a estudiantes, docentes supervisores y la comunidad universitaria en un solo entorno colaborativo.',
  proposalTitle: 'Nuestra propuesta',
  technologyTitle: 'Tecnología'
};

const PROPOSALS = [
  {
    id: 1,
    title: 'Transparencia',
    description: 'Generación de un portafolio público o semipúblico donde la comunidad pueda visualizar las iniciativas creadas en la Escuela.',
    icon: Eye,
  },
  {
    id: 2,
    title: 'Trazabilidad',
    description: 'Historial completo de la actividad, tareas y decisiones tomadas durante el semestre por los miembros del proyecto.',
    icon: History,
  },
  {
    id: 3,
    title: 'Colaboración',
    description: 'Roles diferenciados y herramientas unificadas que permiten a equipos multidisciplinarios operar con mayor sinergia.',
    icon: Users,
  }
];

const TECHNOLOGIES = [
  { id: 1, name: 'Next.js', role: 'Frontend React Framework', icon: Code2 },
  { id: 2, name: 'NestJS', role: 'Backend Node Framework', icon: Code },
  { id: 3, name: 'GraphQL', role: 'Data Query Language', icon: Server },
  { id: 4, name: 'PostgreSQL', role: 'Base de datos relacional', icon: Database },
  { id: 5, name: 'Docker', role: 'Contenedorización', icon: Container },
];

export default function AcercaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="bg-[#1e3a5f] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{PAGE_TEXTS.heroTitle}</h1>
          <p className="text-blue-200 text-lg md:text-xl">{PAGE_TEXTS.heroSubtitle}</p>
        </div>
      </section>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 space-y-20">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{PAGE_TEXTS.aboutTitle}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {PAGE_TEXTS.aboutDescription}
          </p>
        </section>

        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">{PAGE_TEXTS.proposalTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PROPOSALS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-gray-100 pt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">{PAGE_TEXTS.technologyTitle}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TECHNOLOGIES.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.id} className="border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center text-center bg-white hover:border-blue-300 transition-colors">
                  <Icon className="w-8 h-8 text-gray-700 mb-3" />
                  <span className="font-semibold text-gray-900 text-sm mb-1">{tech.name}</span>
                  <span className="text-xs text-gray-500">{tech.role}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="bg-[#1e3a5f] text-white/80 py-6 text-center text-sm mt-auto">
        <p>PROJEIC &middot; Escuela de Ingeniería Coquimbo</p>
      </footer>
    </div>
  );
}
