'use client';

import { useAuth } from '@/context/AuthProvider';
import { Mail, BellRing, Settings, LogOut, User, AlertTriangle, Languages, Moon, Sun, Trash2, ShieldAlert, Download } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/dashboard/settings/ThemeToggle';
import { LanguageSelector } from '@/components/dashboard/settings/LanguageSelector';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ConfiguracionPage() {
  const { user, logout } = useAuth();
  const { t, locale } = useT();
  const { isDark, toggle: toggleTheme } = useTheme();
  
  const [notifSettings, setNotifSettings] = useState({
    'notif-email': true,
    'notif-alerts': true,
    'notif-summary': false,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('projeic_notif_settings');
    if (saved) {
      try {
        setNotifSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }
  }, []);

  const handleToggleNotif = (id: string) => {
    const next = { ...notifSettings, [id as keyof typeof notifSettings]: !notifSettings[id as keyof typeof notifSettings] };
    setNotifSettings(next);
    localStorage.setItem('projeic_notif_settings', JSON.stringify(next));
    toast.success(t('modal.save'));
  };

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen bg-surface-page transition-colors duration-300">
      <div className="bg-surface-primary border-b border-border-primary px-6 py-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand" />
          {t('settingsPage.heading')}
        </h1>
      </div>

      <main className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8 pb-20">

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <User className="w-4 h-4" /> {t('settingsPage.profile')}
          </h2>
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-brand/10 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0 text-xl ring-4 ring-brand/10">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="space-y-1 flex-1">
              <p className="text-lg font-bold text-text-primary">{user?.name}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
              <p className="text-xs text-brand bg-brand/5 px-2 py-1 rounded-md w-fit font-medium mt-2">
                {t('settingsPage.profileSyncInfo')}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-surface-primary rounded-xl border border-border-primary p-6 shadow-sm">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sun className="w-4 h-4" /> {t('sidebar.lightMode')} / {t('sidebar.darkMode')}
            </h2>
            <ThemeToggle variant="switch" />
          </section>

          <section className="bg-surface-primary rounded-xl border border-border-primary p-6 shadow-sm">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Languages className="w-4 h-4" /> {t('nav.about')} (Idioma)
            </h2>
            <LanguageSelector variant="grid" />
          </section>
        </div>

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6 shadow-sm">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <BellRing className="w-4 h-4" /> {t('settingsPage.notificationsTitle')}
          </h2>
          <div className="space-y-4">
            {[
              { id: 'notif-email', label: t('settingsPage.notifEmail'), icon: Mail },
              { id: 'notif-alerts', label: t('settingsPage.notifAlerts'), icon: AlertTriangle },
              { id: 'notif-summary', label: t('settingsPage.notifSummary'), icon: BellRing },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-border-secondary last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                </div>
                <button
                  onClick={() => handleToggleNotif(item.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none hover:scale-105 active:scale-95 ${notifSettings[item.id as keyof typeof notifSettings] ? 'bg-brand shadow-sm shadow-brand/20' : 'bg-surface-tertiary border border-border-secondary'}`}
                >
                  <span
                    className={`${notifSettings[item.id as keyof typeof notifSettings] ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6 shadow-sm">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> {t('settingsPage.sessionTitle')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-text-muted">{t('settingsPage.sessionDesc')}</p>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-brand hover:text-white bg-brand/5 hover:bg-brand rounded-lg transition-colors border border-border-secondary hover:border-brand shrink-0 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> {t('settingsPage.logoutBtn')}
              </button>
          </div>
        </section>

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6 shadow-sm">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> {t('settingsPage.dataManagement')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-text-muted">{t('settingsPage.dataManagementDesc')}</p>
            <button
              onClick={() => {
                const data = {
                  user,
                  settings: notifSettings,
                  theme: isDark ? 'dark' : 'light',
                  locale,
                  exportedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `projeic-data-${user?.name?.replace(/\s+/g, '-').toLowerCase()}.json`;
                a.click();
                toast.success(t('settingsPage.exportSuccess'));
              }}
              className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary border border-border-secondary rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> {t('settingsPage.exportData')}
            </button>
          </div>
        </section>

        <section className="bg-surface-danger-subtle rounded-xl border border-border-danger-subtle p-6">
          <h2 className="text-xs font-bold text-text-danger uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {t('settingsPage.dangerZone')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-danger">{t('settingsPage.deleteAccount')}</p>
              <p className="text-xs text-text-danger/80 mt-1">{t('settingsPage.deleteDesc')}</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-bold text-white bg-surface-danger hover:bg-surface-danger-hover rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> {t('settingsPage.deleteBtn')}
            </button>
          </div>
        </section>

      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-primary rounded-2xl max-w-md w-full p-8 shadow-2xl border border-border-primary animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-surface-danger-subtle flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-text-danger" />
            </div>
            <h3 className="text-xl font-bold text-text-primary text-center mb-2">{t('settingsPage.deleteAccount')}</h3>
            <p className="text-text-muted text-center text-sm mb-8 leading-relaxed">
              {t('settingsPage.deleteInfo')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-surface-secondary text-text-primary font-bold rounded-xl hover:bg-surface-tertiary transition-colors"
              >
                {t('modal.cancel')}
              </button>
              <button
                onClick={() => {
                  toast.error(t('settingsPage.comingSoon'));
                  setShowDeleteModal(false);
                }}
                className="flex-1 px-4 py-3 bg-surface-danger text-white font-bold rounded-xl hover:bg-surface-danger-hover shadow-lg shadow-surface-danger/20 transition-all"
              >
                {t('settingsPage.deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
