'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex flex-1 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-xl font-bold tracking-tight text-gray-900">PROJEIC</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center space-x-6">
        <Link href="/proyectos" className="text-sm font-medium text-gray-600 hover:text-blue-600">
          Proyectos
        </Link>
        <Link href="/acerca" className="text-sm font-medium text-gray-600 hover:text-blue-600">
          Acerca de
        </Link>
        <Link href="/eic" className="text-sm font-medium text-gray-600 hover:text-blue-600">
          EIC
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link 
                href="/profile" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Hola, {user?.name?.split(' ')[0] || 'Usuario'}
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/login?tab=register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2 text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}