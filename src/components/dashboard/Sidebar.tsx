'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, Globe, Bell, Settings, ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_MY_NOTIFICATIONS } from '@/graphql/misc/operations';
import logoTexto from '../../../public/Logo__Texto.png';
import logoIcon from '../../../public/logo.png';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await fetchGraphQL({
          query: GET_MY_NOTIFICATIONS,
          variables: { unreadOnly: true },
        });
        setUnreadCount(data?.myNotifications?.length ?? 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    window.addEventListener('notifications:refresh', fetchUnread);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:refresh', fetchUnread);
    };
  }, []);

  useEffect(() => setMounted(true), []);

  interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/misc/profile', icon: LayoutDashboard },
    { name: 'Mis proyectos', href: '/misc/proyectos', icon: FolderKanban },
    { name: 'Proyectos públicos', href: '/misc/proyectos-publicos', icon: Globe },
    { name: 'Notificaciones', href: '/misc/notificaciones', icon: Bell, badge: unreadCount },
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

  const getUserRoleLabel = (email?: string) => {
    if (!email) return 'Cargando...';
    if (email.endsWith('@alumnos.ucn.cl')) return 'Estudiante';
    if (email.endsWith('@ucn.cl') || email.endsWith('@ce.ucn.cl')) return 'Personal UCN';
    return 'Externo';
  };

  return (
    <aside className={`sticky top-0 h-screen bg-brand-dark text-white flex flex-col py-6 shrink-0 transition-all duration-200 overflow-hidden ${collapsed ? 'w-16' : 'w-[220px]'}`}>
      <div className={`flex items-center mb-6 pl-5 ${collapsed ? 'flex-col gap-4' : 'justify-between pr-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center w-full pr-5' : ''}`}>
          {collapsed ? (
            <Image src={logoIcon} alt="PROJEIC" width={28} height={28} style={{ width: 'auto', height: 'auto' }} priority />
          ) : (
            <Image src={logoTexto} alt="PROJEIC" width={100} height={28} style={{ width: 'auto', height: 'auto' }} priority />
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white transition-colors shrink-0"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5 ml-[-20px]" /> : <PanelLeftClose className="w-5 h-5" />}
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                <div className="relative">
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.badge !== undefined && item.badge > 0 && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-brand-dark animate-pulse"></span>
                  )}
                </div>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>
              
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
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
              <span className="text-xs text-white/50 truncate">{mounted ? getUserRoleLabel(user?.email) : '...'}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}