'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';

export default function CtaSection() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="bg-surface-nav py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
        <div className="text-white">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">¿Tienes un proyecto en la EIC?</h2>
          <p className="text-blue-200 text-sm sm:text-base">Crea tu espacio en menos de 2 minutos, sin instalaciones.</p>
        </div>
        <Link
          href={!mounted ? "/auth/login?tab=register" : (user ? "/misc/proyectos" : "/auth/login?tab=register")}
          className="w-full sm:w-auto flex justify-center items-center px-6 py-3 text-sm font-semibold text-text-btn bg-surface-btn rounded-lg hover:bg-surface-btn-hover transition-colors whitespace-nowrap"
        >
          {!mounted ? "Crear proyecto" : (user ? "Ir a mis proyectos" : "Crear proyecto")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </section>
  );
}