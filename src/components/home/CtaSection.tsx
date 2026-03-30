import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="bg-brand-dark py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Tienes un proyecto en la EIC?</h2>
          <p className="text-blue-200">Crea tu espacio en menos de 2 minutos, sin instalaciones.</p>
        </div>
        <Link 
          href="/auth/login?tab=register" 
          className="flex items-center px-6 py-3 text-sm font-semibold text-[#1e3a5f] bg-white rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Crear proyecto
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </section>
  );
}