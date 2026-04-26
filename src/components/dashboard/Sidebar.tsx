'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, FolderKanban, Globe, Bell, Settings, ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { useTheme } from '@/hooks/useTheme';
import { GET_MY_NOTIFICATIONS } from '@/graphql/misc/operations';
import logoTexto from '../../../public/Logo__Texto.png';
import logoIcon from '../../../public/logo.png';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const collapseBtnRef = useRef<HTMLButtonElement>(null);
  const animatedRef = useRef(false);

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

  /* ── Animación de entrada inicial (Desktop) ── */
  useEffect(() => {
    if (mounted && desktopNavRef.current && !animatedRef.current) {
      animatedRef.current = true;
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: desktopNavRef.current.querySelectorAll('[data-sidebar-item]'),
          opacity: [0, 1],
          translateX: [-15, 0],
          duration: 500,
          delay: anime.stagger(60),
          easing: 'easeOutExpo',
        });
      });
    }
  }, [mounted]);

  /* ── Animación de entrada (Mobile) ── */
  useEffect(() => {
    if (mobileMenuOpen && mobileNavRef.current) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: mobileNavRef.current.querySelectorAll('[data-mobile-item]'),
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 450,
          delay: anime.stagger(50),
          easing: 'easeOutExpo',
        });
      });
    }
  }, [mobileMenuOpen]);

  /* ── Interacciones Hover (Icono y Texto) ── */
  const handleItemEnter = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.nav-icon');
    const text = target.querySelector('.nav-text');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (text) {
        anime({
          targets: text,
          translateX: 4,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
      if (icon) {
        anime({
          targets: icon,
          scale: 1.15,
          rotate: [0, 8, -8, 0],
          duration: 400,
          easing: 'easeOutElastic(1, .6)',
        });
      }
    });
  };

  const handleItemLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.nav-icon');
    const text = target.querySelector('.nav-text');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (text) {
        anime({
          targets: text,
          translateX: 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
      if (icon) {
        anime({
          targets: icon,
          scale: 1,
          rotate: 0,
          duration: 400,
          easing: 'easeOutExpo',
        });
      }
    });
  };

  /* ── Animación Botón de Tema y Colapso ── */
  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle();
    const icon = e.currentTarget.querySelector('.nav-icon');
    if (icon) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: icon,
          rotate: '+=180',
          scale: [0.8, 1],
          duration: 600,
          easing: 'easeOutBack',
        });
      });
    }
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
    if (collapseBtnRef.current) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: collapseBtnRef.current,
          scale: [0.8, 1],
          duration: 400,
          easing: 'easeOutBack',
        });
      });
    }
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-surface-nav text-white p-4 border-b border-white/10 dark:border-white/5 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src={logoTexto} alt="PROJEIC" width={100} height={28} style={{ width: 'auto', height: '1.5rem' }} priority />
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-white/80 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 transition-opacity duration-300" onClick={() => setMobileMenuOpen(false)}></div>
          <aside ref={mobileNavRef} className="relative flex flex-col w-[260px] max-w-sm h-full bg-surface-nav text-white py-6 overflow-y-auto animate-in slide-in-from-left duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-6 px-6">
              <Image src={logoTexto} alt="PROJEIC" width={100} height={28} style={{ width: 'auto', height: '1.5rem' }} priority />
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <Link href="/" className="flex items-center gap-2 w-fit px-6 mb-6 text-white/50 hover:text-white text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Volver al inicio</span>
            </Link>

            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    data-mobile-item
                    style={{ opacity: 0 }}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-surface-nav-active text-white' : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Icon className="w-5 h-5 shrink-0" />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-brand-dark animate-pulse"></span>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 flex flex-col gap-4 px-6">
              <button
                data-mobile-item
                style={{ opacity: 0 }}
                onClick={logout}
                className="flex items-center gap-3 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Cerrar sesión</span>
              </button>
              <button
                data-mobile-item
                style={{ opacity: 0 }}
                onClick={toggle}
                className="flex items-center gap-3 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>
              <div data-mobile-item style={{ opacity: 0 }} className="flex items-center gap-3 pt-4 border-t border-white/10 mt-2">
                <div className="w-9 h-9 rounded-full bg-surface-primary/20 flex items-center justify-center text-sm overflow-hidden shrink-0">
                  {mounted && user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{mounted ? getInitials(user?.name) : 'U'}</span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user?.name}</span>
                  <span className="text-xs text-white/50 truncate">{mounted ? getUserRoleLabel(user?.email) : '...'}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside ref={desktopNavRef} className={`hidden md:flex sticky top-0 h-screen bg-surface-nav text-white flex-col py-6 shrink-0 transition-all duration-300 ease-in-out border-r border-white/10 dark:border-white/5 ${collapsed ? 'w-16' : 'w-[240px]'}`}>
        
        <div data-sidebar-item style={{ opacity: 0 }} className={`flex items-center mb-6 pl-5 ${collapsed ? 'flex-col gap-4' : 'justify-between pr-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center w-full pr-5' : ''}`}>
            {collapsed ? (
              <Image src={logoIcon} alt="PROJEIC" width={28} height={28} style={{ width: 'auto', height: 'auto' }} priority />
            ) : (
              <Image src={logoTexto} alt="PROJEIC" width={100} height={28} style={{ width: 'auto', height: 'auto' }} priority />
            )}
          </div>
          <button
            ref={collapseBtnRef}
            onClick={handleCollapseToggle}
            className="text-white/50 hover:text-white transition-colors shrink-0"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5 ml-[-20px]" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <Link
          data-sidebar-item
          style={{ opacity: 0 }}
          href="/"
          onMouseEnter={handleItemEnter}
          onMouseLeave={handleItemLeave}
          className={`flex items-center text-white/50 hover:text-white transition-colors text-sm font-medium ${collapsed ? 'justify-center mx-auto mb-6' : 'gap-2 w-fit px-6 mb-6'}`}
          title={collapsed ? "Volver al inicio" : undefined}
        >
          <div className="nav-icon origin-center flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </div>
          {!collapsed && <span className="nav-text">Volver al inicio</span>}
        </Link>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto nice-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                data-sidebar-item
                style={{ opacity: 0 }}
                href={item.href}
                onMouseEnter={handleItemEnter}
                onMouseLeave={handleItemLeave}
                title={collapsed ? item.name : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-surface-nav-active text-white'
                  : 'text-white/70 hover:bg-surface-nav-hover hover:text-white'
                  }`}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                  <div className="relative nav-icon origin-center flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0" />
                    {item.badge !== undefined && item.badge > 0 && collapsed && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-brand-dark animate-pulse"></span>
                    )}
                  </div>
                  {!collapsed && <span className="nav-text truncate">{item.name}</span>}
                </div>

                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0 shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto flex flex-col gap-4 pt-6 border-t border-white/10 ${collapsed ? 'px-3' : 'px-6'}`}>
          <button
            data-sidebar-item
            style={{ opacity: 0 }}
            onClick={logout}
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleItemLeave}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={`flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="nav-icon origin-center flex items-center justify-center">
              <LogOut className="w-5 h-5 shrink-0" />
            </div>
            {!collapsed && <span className="nav-text">Cerrar sesión</span>}
          </button>

          <button
            data-sidebar-item
            style={{ opacity: 0 }}
            onClick={handleThemeToggle}
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleItemLeave}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={collapsed ? (isDark ? 'Modo claro' : 'Modo oscuro') : undefined}
            className={`flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="nav-icon origin-center flex items-center justify-center">
              {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            </div>
            {!collapsed && <span className="nav-text">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>}
          </button>

          <div data-sidebar-item style={{ opacity: 0 }} className={`flex items-center mt-2 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-surface-primary/20 border border-white/10 flex items-center justify-center text-sm font-medium overflow-hidden shrink-0 shadow-sm">
              {mounted && user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{mounted ? getInitials(user?.name) : 'U'}</span>
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white/90 truncate max-w-[120px]">{mounted ? (user?.name ?? '...') : '...'}</span>
                <span className="text-xs text-white/50 truncate">{mounted ? getUserRoleLabel(user?.email) : '...'}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}