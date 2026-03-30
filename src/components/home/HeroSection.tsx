import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-brand-dark text-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-1 mb-6 text-xs font-semibold tracking-wider text-blue-200 bg-blue-900/50 rounded-full border border-blue-800">
          Plataforma de proyectos para la EIC
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Gestión de proyectos académicos, en un solo lugar
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          PROJEIC centraliza el seguimiento, la trazabilidad y la visibilidad de los proyectos de la Escuela de Ingeniería Coquimbo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/auth/login?tab=register" 
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-[#1e3a5f] bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            Comenzar ahora
          </Link>
          <Link 
            href="/proyectos" 
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-sm font-semibold text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
          >
            Ver proyectos públicos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}