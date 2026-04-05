'use client';

import { useAuth } from '@/context/AuthProvider';
import { Mail, BellRing, Settings, LogOut, User, AlertTriangle } from 'lucide-react';

export default function ConfiguracionPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand" />
          Configuración de cuenta
        </h1>
      </div>

      <main className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <User className="w-4 h-4" /> Perfil
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
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-brand bg-brand/5 px-2 py-1 rounded-md w-fit font-medium mt-2">
                Tu perfil se sincroniza automáticamente con tu cuenta UCN
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BellRing className="w-4 h-4" /> Preferencias de notificaciones
          </h2>
          <div className="space-y-4">
            {[
              { id: 'notif-email', label: 'Notificaciones por email', icon: Mail },
              { id: 'notif-alerts', label: 'Alertas de tareas vencidas', icon: AlertTriangle },
              { id: 'notif-summary', label: 'Resumen semanal de actividad', icon: BellRing },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sesión
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-gray-500">Cerrarás tu sesión en todos los dispositivos asociados.</p>
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-brand hover:text-white bg-brand/5 hover:bg-brand rounded-lg transition-colors border border-brand/20 hover:border-brand shrink-0 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </section>

        <section className="bg-red-50 rounded-xl border border-red-100 p-6">
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Zona de peligro
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-700">Eliminar cuenta permanentemente</p>
              <p className="text-xs text-red-600 mt-1">Esta acción borrará tus datos y no se puede deshacer.</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button 
                disabled
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg opacity-50 cursor-not-allowed shrink-0"
              >
                Eliminar cuenta
              </button>
              <span className="text-[10px] text-red-500">Esta función estará disponible próximamente</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
