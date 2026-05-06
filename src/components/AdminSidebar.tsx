'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, BookOpen, ShieldAlert, Settings, LogOut, PanelLeftClose, PanelLeftOpen, Menu, Shield, ArrowLeftRight, User, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useT } from '@/hooks/useT';
import logoTexto from '../../public/Logo__Texto.png';
import logoIcon from '../../public/logo.png';
import { ThemeToggle } from './dashboard/settings/ThemeToggle';
import { LanguageSelector } from './dashboard/settings/LanguageSelector';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const { t } = useT();
  
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminChoiceModal, setShowAdminChoiceModal] = useState(false);

  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const collapseBtnRef = useRef<HTMLButtonElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // 🔥 NUEVOS ITEMS EXCLUSIVOS DE ADMINISTRADOR
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Gestión de Usuarios', href: '/admin/usuarios', icon: Users },
    { name: 'Asignaturas UCN', href: '/admin/asignaturas', icon: BookOpen },
    { name: 'Auditoría de Proyectos', href: '/admin/auditoria', icon: ShieldAlert },
    { name: 'Sistema', href: '/admin/sistema', icon: Info },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name.substring(0, 2).toUpperCase();
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

  // Las funciones de animación de Anime.js se mantienen idénticas para la fluidez
  const handleItemEnter = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.nav-icon');
    const text = target.querySelector('.nav-text');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (text) anime({ targets: text, translateX: 4, duration: 300, easing: 'easeOutQuad' });
      if (icon) anime({ targets: icon, scale: 1.15, rotate: [0, 8, -8, 0], duration: 400, easing: 'easeOutElastic(1, .6)' });
    });
  };

  const handleItemLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    const icon = target.querySelector('.nav-icon');
    const text = target.querySelector('.nav-text');

    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      if (text) anime({ targets: text, translateX: 0, duration: 300, easing: 'easeOutQuad' });
      if (icon) anime({ targets: icon, scale: 1, rotate: 0, duration: 400, easing: 'easeOutExpo' });
    });
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
    if (collapseBtnRef.current) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({ targets: collapseBtnRef.current, scale: [0.8, 1], duration: 400, easing: 'easeOutBack' });
      });
    }
  };

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-gray-900 text-white p-4 border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-bold tracking-wider">ADMIN</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-white/80 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <aside ref={desktopNavRef} className={`hidden md:flex sticky top-0 h-screen bg-gray-950 text-white flex-col py-6 shrink-0 transition-all duration-300 ease-in-out border-r border-red-500/20 ${collapsed ? 'w-16' : 'w-[240px]'}`}>
        
        {/* LOGO Y MODO ADMIN */}
        <div data-sidebar-item style={{ opacity: 0 }} className={`flex items-center mb-6 pl-5 ${collapsed ? 'flex-col gap-4' : 'justify-between pr-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center w-full pr-5' : ''}`}>
            {collapsed ? (
              <Shield className="w-7 h-7 text-red-500" />
            ) : (
              <div className="flex flex-col">
                <Image src={logoTexto} alt="PROJEIC" width={100} height={28} style={{ width: 'auto', height: 'auto' }} priority />
                <span className="text-[10px] text-red-400 font-black tracking-widest mt-1 uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Root Access
                </span>
              </div>
            )}
          </div>
          <button
            ref={collapseBtnRef}
            onClick={handleCollapseToggle}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5 ml-[-20px]" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto nice-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Para rutas de admin, basta con chequear si empieza con el href
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                data-sidebar-item
                style={{ opacity: 0 }}
                href={item.href}
                onMouseEnter={handleItemEnter}
                onMouseLeave={handleItemLeave}
                title={collapsed ? item.name : undefined}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                  <div className="relative nav-icon origin-center flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0" />
                  </div>
                  {!collapsed && <span className="nav-text truncate">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER Y USUARIO */}
        <div className={`mt-auto flex flex-col gap-4 pt-6 border-t border-white/10 ${collapsed ? 'px-3' : 'px-6'}`}>
          <button
            data-sidebar-item
            style={{ opacity: 0 }}
            onClick={logout}
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleItemLeave}
            title={collapsed ? 'Cerrar Sesión' : undefined}
            className={`flex items-center text-white/60 hover:text-red-400 transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="nav-icon origin-center flex items-center justify-center">
              <LogOut className="w-5 h-5 shrink-0" />
            </div>
            {!collapsed && <span className="nav-text">Cerrar Sesión</span>}
          </button>

          <button
            data-sidebar-item
            style={{ opacity: 0 }}
            onClick={() => setShowAdminChoiceModal(true)}
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleItemLeave}
            title={collapsed ? 'Cambiar Vista' : undefined}
            className={`flex items-center text-white/60 hover:text-blue-400 transition-colors text-sm font-medium w-full ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="nav-icon origin-center flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 shrink-0" />
            </div>
            {!collapsed && <span className="nav-text">Cambiar Vista</span>}
          </button>
          
          <ThemeToggle 
            variant="icon" 
            showLabel={!collapsed} 
            className="px-0" 
            data-sidebar-item={true} 
            style={{ opacity: 0 }} />

          <LanguageSelector 
            variant="cycle" 
            showLabel={true} 
            className="px-0"
                        />

          <div data-sidebar-item style={{ opacity: 0 }} className={`flex items-center mt-2 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 font-bold overflow-hidden shrink-0 shadow-sm">
              {mounted && user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{mounted ? getInitials(user?.name) : 'A'}</span>
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white/90 truncate max-w-[120px]">{mounted ? (user?.name ?? 'Admin') : '...'}</span>
                <span className="text-[10px] uppercase text-red-400 font-black tracking-wider">Superadmin</span>
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