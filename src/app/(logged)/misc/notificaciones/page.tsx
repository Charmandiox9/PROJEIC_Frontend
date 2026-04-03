'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_MY_NOTIFICATIONS, MARK_ALL_READ, MARK_NOTIFICATION_READ, RESPOND_TO_INVITATION } from '@/graphql/misc/operations';

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityId?: string;
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchGraphQL({
        query: GET_MY_NOTIFICATIONS,
        variables: { unreadOnly: filter === 'UNREAD' },
      });
      if (data?.myNotifications) {
        setNotifications(data.myNotifications);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      await fetchGraphQL({ query: MARK_ALL_READ });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (notif.isRead) return;
    try {
      await fetchGraphQL({
        query: MARK_NOTIFICATION_READ,
        variables: { id: notif.id },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRespondInvitation = async (notif: NotificationItem, accept: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notif.entityId) return;

    try {
      setProcessingId(notif.id);
      
      try {
        await fetchGraphQL({
          query: RESPOND_TO_INVITATION,
          variables: { projectId: notif.entityId, accept },
        });
      } catch (err: any) {
        if (err.message && err.message.includes('No tienes ninguna invitación pendiente')) {
          // Ya procesado, no lanzamos crash
        } else {
          throw err;
        }
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      window.dispatchEvent(new CustomEvent('notifications:refresh'));

      if (accept) {
        setTimeout(() => {
          router.push(`/misc/proyectos/${notif.entityId}`);
        }, 500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand" />
            Notificaciones
          </h1>
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || notifications.length === 0}
            className="text-sm font-medium text-brand hover:text-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isMarkingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Marcar todas como leídas
          </button>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setFilter('ALL')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              filter === 'ALL' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              filter === 'UNREAD' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            No leídas
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">No tienes notificaciones pendientes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const isInvitation = notif.type === 'PROJECT_INVITATION';
              const Icon = isInvitation ? UserPlus : Bell;
              const isProcessing = processingId === notif.id;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`relative border rounded-xl p-5 flex items-start gap-4 transition-all duration-300 ${
                    notif.isRead
                      ? 'border-gray-100 bg-gray-50/60 opacity-80'
                      : 'border-brand/30 shadow-md cursor-pointer hover:border-brand/50 hover:shadow-lg bg-white border-l-4 border-l-brand'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-brand ring-4 ring-brand/20 animate-pulse"></span>
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.isRead
                      ? 'bg-gray-200 text-gray-500'
                      : isInvitation ? 'bg-blue-100 text-blue-600' : 'bg-brand/10 text-brand'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-500 font-normal' : 'text-gray-900 font-bold'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notif.createdAt)}
                    </p>

                    {isInvitation && (
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={(e) => handleRespondInvitation(notif, true, e)}
                          disabled={isProcessing}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Aceptar
                        </button>
                        <button
                          onClick={(e) => handleRespondInvitation(notif, false, e)}
                          disabled={isProcessing}
                          className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
