'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, Globe, Bell, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: 'Dashboard', href: '/misc/profile', icon: LayoutDashboard },
    { name: 'Mis proyectos', href: '/misc/profile/proyectos', icon: FolderKanban },
    { name: 'Proyectos públicos', href: '/proyectos', icon: Globe },
    { name: 'Notificaciones', href: '/misc/profile/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/misc/profile/configuracion', icon: Settings },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="w-[220px] sticky top-0 h-screen bg-[#1e3a5f] text-white flex flex-col py-6 shrink-0">
      <div className="px-6 mb-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
          <span className="text-xl font-bold tracking-wider">PROJEIC</span>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/misc/profile' && item.href !== '/proyectos');
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto flex flex-col gap-6">
        <button 
          onClick={logout}
          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm font-medium w-full"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium overflow-hidden shrink-0">
            {mounted && user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name ?? '...'}</span>
            <span className="text-xs text-white/50 truncate">Estudiante</span>
          </div>
        </div>
      </div>
    </aside>
  );
}