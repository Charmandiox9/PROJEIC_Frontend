'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Sun, Moon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/hooks/useTheme';
import logoTexto from '../../public/Logo__Texto.png';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-surface-nav text-white border-b border-white/10 shadow-sm relative z-50 dark:border-white/5">
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
        <Link href="/proyectos" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/proyectos') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}>
          Proyectos
        </Link>
        <Link href="/acerca" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/acerca') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}>
          Acerca de
        </Link>
        <Link href="/eic" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/eic') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}>
          EIC
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <button
          onClick={toggle}
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-surface-primary/10 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="hidden md:flex items-center space-x-4">
          {!mounted ? (
            <div className="w-64 h-10 animate-pulse bg-surface-primary/10 rounded-lg"></div>
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
                className="px-4 py-2 text-sm font-medium bg-surface-btn text-text-btn hover:bg-surface-btn-hover rounded-lg transition-colors shadow-sm"
              >
                Mi dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-surface-primary/10 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-ui-dark bg-surface-primary border border-transparent rounded-lg hover:bg-surface-secondary transition-colors shadow-sm dark:text-brand dark:bg-transparent dark:border-brand dark:hover:bg-brand/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface-nav border-b border-white/10 dark:border-white/5 py-4 px-6 flex flex-col space-y-4 shadow-xl z-50">
          <Link
            href="/proyectos"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/proyectos') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
          >
            Proyectos
          </Link>
          <Link
            href="/acerca"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/acerca') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
          >
            Acerca de
          </Link>
          <Link
            href="/eic"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/eic') ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
          >
            EIC
          </Link>

          <div className="w-full h-px bg-surface-primary/10 my-2"></div>

          {!mounted ? null : isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <span className="text-sm font-medium text-white/90 px-3">
                Hola, {user?.name?.split(' ')[0] || 'Usuario'}
              </span>
              <Link
                href="/misc/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium bg-surface-btn text-text-btn hover:bg-surface-btn-hover rounded-lg transition-colors shadow-sm"
              >
                Mi dashboard
              </Link>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-surface-primary/10 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2 text-sm font-medium text-ui-dark bg-surface-primary rounded-lg hover:bg-surface-secondary transition-colors shadow-sm dark:text-brand dark:bg-transparent dark:border dark:border-brand dark:hover:bg-brand/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}