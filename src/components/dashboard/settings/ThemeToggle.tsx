'use client';

import { useTheme } from '../../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { useT } from '../../../hooks/useT';

interface ThemeToggleProps {
  variant?: 'switch' | 'icon';
  showLabel?: boolean;
  className?: string;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  'data-sidebar-item'?: boolean;
  style?: React.CSSProperties;
}

export function ThemeToggle({ 
  variant = 'switch', 
  showLabel = false, 
  className = '', 
  onMouseEnter, 
  onMouseLeave,
  'data-sidebar-item': dataSidebarItem,
  style
}: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();
  const { t } = useT();

  const handleToggle = (e: React.MouseEvent) => {
    toggle();
    const icon = e.currentTarget.querySelector('.nav-icon');
    if (icon) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: icon,
          rotate: isDark ? [0, -90] : [0, 90],
          scale: [0.8, 1],
          duration: 400,
          easing: 'easeOutBack'
        });
      });
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-sidebar-item={dataSidebarItem}
        style={style}
        className={`flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium w-full gap-3 ${className}`}
        aria-label={isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
      >
        <div className="nav-icon origin-center flex items-center justify-center">
          {isDark ? (
            <Moon className="w-5 h-5 shrink-0 text-brand" />
          ) : (
            <Sun className="w-5 h-5 shrink-0 text-text-warning" />
          )}
        </div>
        {showLabel && (
          <span className="nav-text">
            {isDark ? t('sidebar.darkMode') : t('sidebar.lightMode')}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-surface-secondary rounded-xl border border-border-secondary ${className}`}>
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="w-5 h-5 text-brand" />
        ) : (
          <Sun className="w-5 h-5 text-text-warning" />
        )}
        <span className="text-sm font-medium text-text-primary">
          {isDark ? t('sidebar.darkMode') : t('sidebar.lightMode')}
        </span>
      </div>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-brand ${
          isDark ? 'bg-brand' : 'bg-surface-tertiary border border-border-secondary'
        }`}
      >
        <span
          className={`${
            isDark ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
        />
      </button>
    </div>
  );
}
