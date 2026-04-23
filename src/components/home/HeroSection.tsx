'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatsSection from './StatsSection';
import { useAuth } from '@/context/AuthProvider';

export default function HeroSection() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="bg-surface-primary py-12 md:py-24 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        <div className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-wider text-ui-dark dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600">
          Plataforma de proyectos para la EIC
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-text-primary">
          Gestión de proyectos académicos, en un solo lugar
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-text-muted mb-8 max-w-2xl mx-auto">
          PROJEIC centraliza el seguimiento, la trazabilidad y la visibilidad de los proyectos de la Escuela de Ingeniería Coquimbo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={!mounted ? "/auth/login?tab=register" : (user ? "/misc/profile" : "/auth/login?tab=register")}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-hover border border-transparent rounded-lg shadow-sm transition-colors"
          >
            {!mounted ? "Comenzar ahora" : (user ? "Ir al panel" : "Comenzar ahora")}
          </Link>
          <Link
            href="/proyectos"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-sm font-semibold text-ui-dark dark:text-white bg-white dark:bg-white/10 border border-gray-300 dark:border-white/30 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
          >
            Ver proyectos públicos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
      <div className="mt-12 md:mt-16 px-4 sm:px-6">
        <StatsSection />
      </div>
    </section>
  );
}

