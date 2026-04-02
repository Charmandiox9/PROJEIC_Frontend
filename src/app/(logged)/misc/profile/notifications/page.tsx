'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { RESPOND_INVITATION, GET_MY_NOTIFICATIONS, MARK_NOTIFICATION_AS_READ } from '@/graphql/misc/operations';

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) return rtf.format(diffInSeconds, 'second');
  if (absDiff < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  if (absDiff < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  if (absDiff < 2592000) return rtf.format(Math.round(diffInSeconds / 86400), 'day');
  if (absDiff < 31536000) return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
  return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Query a enviar:", GET_MY_NOTIFICATIONS);
      const response = await fetchGraphQL({ query: GET_MY_NOTIFICATIONS });
      
      if (response?.myNotifications) {
        setNotifications(response.myNotifications);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleAccept = async (notifId: string, projectId: string) => {
    try {
      await fetchGraphQL({ query: RESPOND_INVITATION, variables: { projectId, accept: true } });
      await fetchGraphQL({ query: MARK_NOTIFICATION_AS_READ, variables: { id: notifId } });
      loadNotifications(); 
    } catch (error) {
      console.error("Error al aceptar la invitación:", error);
    }
  };

  const handleIgnore = async (notifId: string) => {
    try {
      await fetchGraphQL({ query: MARK_NOTIFICATION_AS_READ, variables: { id: notifId } });
      loadNotifications(); 
    } catch (error) {
      console.error("Error al ignorar la invitación:", error);
    }
  };

  if (loading && notifications.length === 0) {
    return <div className="p-10 animate-pulse text-zinc-500 text-center">Cargando alertas...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Notificaciones</h1>

      {notifications.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900 p-12 rounded-3xl text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500">No tienes notificaciones por ahora.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n: any) => (
            <div 
              key={n.id} 
              className={`p-5 rounded-2xl border transition-all ${
                n.isRead 
                  ? 'bg-transparent border-zinc-100 dark:border-zinc-800 opacity-70' 
                  : 'bg-white dark:bg-zinc-900 border-blue-100 dark:border-blue-900 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {n.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {getRelativeTime(n.createdAt)}
                </span>
              </div>

              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{n.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{n.message}</p>

              {n.type === 'PROJECT_INVITATION' && !n.isRead && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAccept(n.id, n.entityId)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aceptar Invitación
                  </button>
                  <button 
                    onClick={() => handleIgnore(n.id)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Ignorar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}