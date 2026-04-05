'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="space-y-6 max-w-lg">
        <h1 className="text-8xl font-extrabold text-brand-dark tracking-tight">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Página no encontrada
        </h2>
        <p className="text-gray-600">
          Lo sentimos, la página que buscas no existe o ha sido movida.
          Comprueba si hay algún error en la dirección ingresada.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-brand-dark rounded-lg hover:bg-brand-dark-hover transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <button
            onClick={() => {
              if (document.referrer) {
                window.location.href = document.referrer;
              } else {
                window.location.href = '/projeic';
              }
            }}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm font-semibold text-brand-dark border border-brand-dark rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ir atrás
          </button>
        </div>
      </div>
    </div>
  );
}
