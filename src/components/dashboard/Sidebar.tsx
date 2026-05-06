'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, FolderKanban, Globe, Bell, Settings, ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen, Sun, Moon, Menu, BookOpen, Shield, User, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useT } from '@/hooks/useT';
import { GET_MY_NOTIFICATIONS } from '@/graphql/misc/operations';
import logoTexto from '../../../public/Logo__Texto.png';
import logoIcon from '../../../public/logo.png';
import { ThemeToggle } from './settings/ThemeToggle';
import { LanguageSelector } from './settings/LanguageSelector';

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
  const { locale, toggle: toggleLocale } = useLocale();
  const { t } = useT();
  
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminChoiceModal, setShowAdminChoiceModal] = useState(false);

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

  const isProfessor = 
    user?.email?.endsWith('@ucn.cl') || 
    user?.email?.endsWith('@ce.ucn.cl') ||
    user?.email === 'didurangarcia@gmail.com';

  const navItems: NavItem[] = [
    { name: t('sidebar.dashboard'), href: '/misc/profile', icon: LayoutDashboard },
    { name: t('sidebar.myProjects'), href: '/misc/proyectos', icon: FolderKanban },
    { name: t('sidebar.publicProjects'), href: '/misc/proyectos-publicos', icon: Globe },
    ...(isProfessor ? [{ name: t('sidebar.subjects') || 'Mis Asignaturas', href: '/misc/asignaturas', icon: BookOpen }] : []),
    { name: t('sidebar.notifications'), href: '/misc/notificaciones', icon: Bell, badge: unreadCount },
    { name: t('sidebar.settings'), href: '/misc/configuracion', icon: Settings },
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
    if (!email) return t('sidebar.loading');
    if (email.endsWith('@alumnos.ucn.cl')) return t('userRole.student');
    if (email.endsWith('@ucn.cl') || email.endsWith('@ce.ucn.cl')) return t('userRole.ucnStaff');
    return t('userRole.external');
  };

  useEffect(() => {
    const desktopNavEl = desktopNavRef.current;
    
    if (mounted && desktopNavEl && !animatedRef.current) {
      animatedRef.current = true;
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: desktopNavEl.querySelectorAll('[data-sidebar-item]'),
          opacity: [0, 1],
          translateX: [-15, 0],
          duration: 500,
          delay: anime.stagger(60),
          easing: 'easeOutExpo',
        });
      });
    }
  }, [mounted]);

  useEffect(() => {
    const mobileNavEl = mobileNavRef.current;

    if (mobileMenuOpen && mobileNavEl) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: mobileNavEl.querySelectorAll('[data-mobile-item]'),
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 450,
          delay: anime.stagger(50),
          easing: 'easeOutExpo',
        });
      });
    }
  }, [mobileMenuOpen]);

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
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-surface-nav text-white p-4 border-b border-white/10 dark:border-white/5 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src={logoTexto} alt="PROJEIC" width={100} height={28} style={{ width: 'auto', height: '1.5rem' }} priority />
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-white/80 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

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
              <span>{t('sidebar.backToHome')}</span>
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
                <span>{t('sidebar.logout')}</span>
              </button>
              {user?.isAdmin && (
                <button
                  data-mobile-item
                  style={{ opacity: 0 }}
                  onClick={() => setShowAdminChoiceModal(true)}
                  className="flex items-center gap-3 text-white/70 hover:text-blue-400 transition-colors text-sm font-medium"
                >
                  <ArrowLeftRight className="w-5 h-5 shrink-0" />
                  <span>Cambiar Vista</span>
                </button>
              )}
              <ThemeToggle 
                variant="icon" 
                showLabel={true} 
                className="px-0"
              />
              <LanguageSelector 
                variant="cycle" 
                showLabel={true} 
                className="px-0"
              />
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
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
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
          title={collapsed ? t('sidebar.backToHome') : undefined}
        >
          <div className="nav-icon origin-center flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </div>
          {!collapsed && <span className="nav-text">{t('sidebar.backToHome')}</span>}
        </Link>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto nice-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

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
            title={collapsed ? t('sidebar.logout') : undefined}
            className={`flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="nav-icon origin-center flex items-center justify-center">
              <LogOut className="w-5 h-5 shrink-0" />
            </div>
            {!collapsed && <span className="nav-text">{t('sidebar.logout')}</span>}
          </button>

          {user?.isAdmin && (
            <button
              data-sidebar-item
              style={{ opacity: 0 }}
              onClick={() => setShowAdminChoiceModal(true)}
              onMouseEnter={handleItemEnter}
              onMouseLeave={handleItemLeave}
              title={collapsed ? 'Cambiar Vista' : undefined}
              className={`flex items-center text-white/70 hover:text-blue-400 transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
            >
              <div className="nav-icon origin-center flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 shrink-0" />
              </div>
              {!collapsed && <span className="nav-text">Cambiar Vista</span>}
            </button>
          )}
          
          <ThemeToggle 
            variant="icon" 
            showLabel={!collapsed} 
            className="px-0"
            data-sidebar-item={true}
            style={{ opacity: 0 }}
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleItemLeave}
          />

          <LanguageSelector 
            variant="cycle" 
            showLabel={!collapsed} 
            className="px-0"
            data-sidebar-item={true}
            style={{ opacity: 0 }}
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleItemLeave}
          />

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

      {/* MODAL CAMBIAR VISTA */}
      {showAdminChoiceModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4">
          <div className="bg-surface-primary dark:bg-brand-dark p-8 rounded-3xl max-w-xl w-full border border-border-primary shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center gap-6 text-center">
            <div>
              <h2 className="text-2xl font-black text-text-primary mb-1">Cambiar de Vista</h2>
              <p className="text-sm text-text-muted">Selecciona el entorno de trabajo al que deseas cambiar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => { setShowAdminChoiceModal(false); window.location.href = '/projeic/admin'; }}
                className="group relative flex flex-col items-center p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-red-500/20"
              >
                <div className="p-3 bg-red-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
                  <Shield className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg text-text-primary">Panel de Control</span>
                <span className="text-xs text-text-muted mt-1">Gestión global de la UCN</span>
                <ArrowRight className="w-5 h-5 mt-4 text-red-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => { setShowAdminChoiceModal(false); window.location.href = '/projeic/misc/profile'; }}
                className="group relative flex flex-col items-center p-6 bg-brand/5 hover:bg-brand/10 border border-brand/20 hover:border-brand rounded-3xl transition-all duration-300 shadow-sm hover:shadow-brand/20"
              >
                <div className="p-3 bg-brand rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-brand/30">
                  <User className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg text-text-primary">Vista de Usuario</span>
                <span className="text-xs text-text-muted mt-1">Mis proyectos y perfil</span>
                <ArrowRight className="w-5 h-5 mt-4 text-brand opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
            
            <button 
              onClick={() => setShowAdminChoiceModal(false)}
              className="mt-4 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}