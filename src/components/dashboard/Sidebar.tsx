'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, Globe, Bell, Settings, ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: 'Dashboard', href: '/misc/profile', icon: LayoutDashboard },
    { name: 'Mis proyectos', href: '/misc/proyectos', icon: FolderKanban },
    { name: 'Proyectos públicos', href: '/misc/proyectos-publicos', icon: Globe },
    { name: 'Notificaciones', href: '/misc/profile/notificaciones', icon: Bell },
    { name: 'Configuración', href: '/misc/configuracion', icon: Settings },
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
    <aside className={`sticky top-0 h-screen bg-brand-dark text-white flex flex-col py-6 shrink-0 transition-all duration-200 overflow-hidden ${collapsed ? 'w-16' : 'w-[220px]'}`}>
      <div className={`flex items-center mb-6 ${collapsed ? 'flex-col gap-4 px-0' : 'px-6 justify-between'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shrink-0"></div>
          {!collapsed && <span className="text-xl font-bold tracking-wider truncate">PROJEIC</span>}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white transition-colors shrink-0"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <Link 
        href="/" 
        className={`flex items-center text-white/50 hover:text-white transition-colors text-sm font-medium ${collapsed ? 'justify-center mx-auto mb-6' : 'gap-2 w-fit px-6 mb-6'}`}
        title={collapsed ? "Volver al inicio" : undefined}
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        {!collapsed && <span>Volver al inicio</span>}
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${collapsed ? 'justify-center' : 'gap-3'} ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-auto flex flex-col gap-6 ${collapsed ? 'px-3' : 'px-6'}`}>
        <button 
          onClick={logout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium overflow-hidden shrink-0">
            {mounted && user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>{mounted ? getInitials(user?.name) : 'U'}</span>
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate max-w-[120px]">{mounted ? (user?.name ?? '...') : '...'}</span>
              <span className="text-xs text-white/50 truncate">Estudiante</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}