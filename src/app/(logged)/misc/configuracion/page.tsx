'use client';

import { useAuth } from '@/context/AuthProvider';
import { Mail, BellRing, Settings, LogOut, User, AlertTriangle } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function ConfiguracionPage() {
  const { user, logout } = useAuth();
  const { t } = useT();

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen bg-surface-page">
      <div className="bg-surface-primary border-b border-border-primary px-6 py-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand" />
          {t('settingsPage.heading')}
        </h1>
      </div>

      <main className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <User className="w-4 h-4" /> {t('settingsPage.profile')}
          </h2>
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0 text-xl ring-4 ring-gray-50">
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

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <BellRing className="w-4 h-4" /> {t('settingsPage.notificationsTitle')}
          </h2>
          <div className="space-y-4">
            {[
              { id: 'notif-email', label: t('settingsPage.notifEmail'), icon: Mail },
              { id: 'notif-alerts', label: t('settingsPage.notifAlerts'), icon: AlertTriangle },
              { id: 'notif-summary', label: t('settingsPage.notifSummary'), icon: BellRing },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-primary after:border-border-secondary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-primary rounded-xl border border-border-primary p-6">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> {t('settingsPage.sessionTitle')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-text-muted">{t('settingsPage.sessionDesc')}</p>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-brand hover:text-white bg-brand/5 hover:bg-brand rounded-lg transition-colors border border-brand/20 hover:border-brand shrink-0 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {t('settingsPage.logoutBtn')}
            </button>
          </div>
        </section>

        <section className="bg-red-50 rounded-xl border border-red-100 p-6">
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {t('settingsPage.dangerZone')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-700">{t('settingsPage.deleteAccount')}</p>
              <p className="text-xs text-red-600 mt-1">{t('settingsPage.deleteDesc')}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                disabled
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg opacity-50 cursor-not-allowed shrink-0"
              >
                {t('settingsPage.deleteBtn')}
              </button>
              <span className="text-[10px] text-red-500">{t('settingsPage.comingSoon')}</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
