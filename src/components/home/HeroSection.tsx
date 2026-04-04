import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StatsSection from './StatsSection';

export default function HeroSection() {
  return (
    <section className="bg-white text-ui-dark border-b border-gray-100 min-h-[calc(100vh-64px)] flex flex-col justify-center py-10">
      <div className="max-w-4xl mx-auto text-center px-6">
        <div className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-wider text-ui-dark bg-gray-100 rounded-full border border-gray-200">
          Plataforma de proyectos para la EIC
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          Gestión de proyectos académicos, en un solo lugar
        </h1>
        <p className="text-base md:text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          PROJEIC centraliza el seguimiento, la trazabilidad y la visibilidad de los proyectos de la Escuela de Ingeniería Coquimbo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login?tab=register"
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-ui-dark hover:bg-slate-800 border border-transparent rounded-lg shadow-sm transition-colors"
          >
            Comenzar ahora
          </Link>
          <Link
            href="/proyectos"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-sm font-semibold text-ui-dark bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Ver proyectos públicos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
      <div className="mt-auto px-6">
        <StatsSection />
      </div>
    </section>
  );
}

