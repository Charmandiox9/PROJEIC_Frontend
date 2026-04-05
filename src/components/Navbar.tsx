'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import logoTexto from '../../public/Logo__Texto.png';

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
    <nav className="flex items-center justify-between px-6 py-4 bg-ui-dark text-white border-b border-white/10 shadow-sm relative z-50">
      <div className="flex flex-1 items-center">
        <Link href="/" className="flex items-center">
          <Image
            src={logoTexto}
            alt="PROJEIC Logo"
            className="w-auto h-10 md:h-12 object-contain"
            style={{ width: 'auto', height: '100%', maxHeight: '48px' }}
            priority
          />
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center space-x-6">
        <Link href="/proyectos" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith('/proyectos') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
          Proyectos
        </Link>
        <Link href="/acerca" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith('/acerca') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
          Acerca de
        </Link>
        <Link href="/eic" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pathname.startsWith('/eic') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
          EIC
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          {!mounted ? (
            <div className="w-64 h-10 animate-pulse bg-white/10 rounded-lg"></div>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/misc/profile"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Hola, {user?.name?.split(' ')[0] || 'Usuario'}
              </Link>
              <Link
                href="/misc/profile"
                className="px-4 py-2 text-sm font-medium text-ui-dark bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
              >
                Mi dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-ui-dark bg-white border border-transparent rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
              >
                Iniciar sesión
              </Link>
          )}
        </div>
        <button className="md:hidden p-2 text-white/80 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}