'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex flex-1 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-brand rounded-full"></div>
          <span className="text-xl font-bold tracking-tight text-gray-900">PROJEIC</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center space-x-6">
        <Link href="/proyectos" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith('/proyectos') ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-brand'}`}>
          Proyectos
        </Link>
        <Link href="/acerca" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith('/acerca') ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-brand'}`}>
          Acerca de
        </Link>
        <Link href="/eic" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith('/eic') ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-brand'}`}>
          EIC
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          {!mounted ? (
            <div className="w-64 h-10 animate-pulse bg-gray-100 rounded-lg"></div>
          ) : isAuthenticated ? (
            <>
              <Link 
                href="/misc/profile" 
                className="text-sm font-medium text-gray-700 hover:text-brand transition-colors"
              >
                Hola, {user?.name?.split(' ')[0] || 'Usuario'}
              </Link>
              <Link
                href="/misc/profile"
                className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors"
              >
                Mi dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand-light transition-colors"
              >
                Iniciar sesión
              </Link>
          )}
        </div>
        <button className="md:hidden p-2 text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}