'use client';

import { useLocale } from '../../../hooks/useLocale';
import { useT } from '../../../hooks/useT';

interface LanguageSelectorProps {
  variant?: 'grid' | 'cycle';
  showLabel?: boolean;
  className?: string;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  'data-sidebar-item'?: boolean;
  style?: React.CSSProperties;
}

const LANGUAGES = [
  { code: 'es', label: 'ESP', fullLabel: 'Español' },
  { code: 'en', label: 'ENG', fullLabel: 'English' },
  { code: 'pt', label: 'POR', fullLabel: 'Português' },
];

export function LanguageSelector({ 
  variant = 'grid', 
  showLabel = false, 
  className = '', 
  onMouseEnter, 
  onMouseLeave,
  'data-sidebar-item': dataSidebarItem,
  style
}: LanguageSelectorProps) {
  const { locale, toggle: cycleLocale } = useLocale();
  const { t } = useT();

  const handleCycleLocale = (e: React.MouseEvent) => {
    cycleLocale();
    const icon = e.currentTarget.querySelector('.nav-icon');
    if (icon) {
      import('animejs').then((mod) => {
        const anime = mod.default ?? mod;
        anime({
          targets: icon,
          scale: [0.7, 1.1, 1],
          rotate: [0, 10, -10, 0],
          duration: 500,
          easing: 'easeOutElastic(1, .6)'
        });
      });
    }
  };

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  if (variant === 'cycle') {
    const currentIndex = LANGUAGES.findIndex(l => l.code === locale);
    const currentLang = LANGUAGES[currentIndex];
    const nextLang = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    
    return (
      <button
        onClick={handleCycleLocale}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-sidebar-item={dataSidebarItem}
        style={style}
        className={`flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium w-full group gap-4 ${className}`}
        aria-label={t('nav.about')}
      >
        <div className="nav-icon origin-center flex items-center justify-center text-[10px] font-black w-6 h-6 shrink-0 border border-white/20 rounded-md group-hover:scale-110 transition-transform">
          {currentLang.code.toUpperCase()}
        </div>
        {showLabel && (
          <div className="nav-text flex items-center gap-3 overflow-hidden">
            <span className="opacity-60 tracking-tight">{currentLang.label}</span>
            <span className="text-[10px] opacity-40 mx-0.5">➔</span>
            <span className="font-bold text-white tracking-wide">{nextLang.label}</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => handleLocaleChange(l.code)}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            locale === l.code
              ? 'bg-brand/10 border-brand text-brand font-bold'
              : 'bg-surface-secondary border-border-secondary text-text-muted hover:border-brand/50'
          }`}
        >
          <span className="text-xs font-black mb-1 opacity-60">{l.code.toUpperCase()}</span>
          <span className="text-[10px] tracking-tighter">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
