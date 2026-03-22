'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <nav className="h-[73px] border-b bg-white animate-pulse" />;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:bg-zinc-950/90 dark:border-zinc-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[73px]">
          
          {/* Lado Izquierdo: Logo y Links Públicos */}
          <div className="flex items-center gap-10">
            <Link href="/" className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white hover:opacity-80">
              PROJEIC
            </Link>

            {/* Links públicos: Solo se muestran si NO estás logueado */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Link href="/proyectos" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                  Proyectos
                </Link>
                <Link href="/contacto" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                  Contacto
                </Link>
              </div>
            )}
          </div>

          {/* Lado Derecho: Menú de Usuario o Botón Login */}
          <div className="flex items-center relative" ref={dropdownRef}>
            {isAuthenticated && user ? (
              <>
                {/* Botón que abre el Dropdown */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user.nombre}</p>
                  </div>
                  
                  {user.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt="Avatar" 
                      width={36} height={36} 
                      className="rounded-full border border-zinc-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Icono de flecha que gira */}
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* El Menú Desplegable (Dropdown) */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1 sm:hidden">
                      <p className="text-sm font-bold truncate">{user.nombre}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>

                    <Link 
                      href="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Mi perfil
                    </Link>
                    
                    {/* Botón de Cambiar Perfil */}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        console.log("Cambiar perfil clickeado");
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cambiar perfil
                    </button>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => window.location.href = 'http://localhost:4000/projeic/api/auth/google'}
                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}