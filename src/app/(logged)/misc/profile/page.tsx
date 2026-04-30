'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROFILE, GET_MY_PROJECTS, GET_DASHBOARD_ACTIVITY } from '@/graphql/misc/operations';
import { GET_PENDING_TASKS_BY_USER } from '@/graphql/tasks/operations';
import { Plus, Briefcase, CheckSquare, Activity, Users, FolderKanban, Clock, ArrowRight } from 'lucide-react';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';
import { getLocalizedText } from '@/utils/i18n';

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface Project {
  status: string;
  myRole?: string;
  members?: {
    role: string;
    status: string;
    user: {
      id: string;
    };
  }[];
}

interface DashboardMetrics {
  activeProjects: number | null;
  pendingTasks: number | null;
  activityPoints: number | null;
  collaborators: number | null;
}

export default function ProfileDashboard() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { t } = useT();
  const { locale } = useLocale();
  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? pt : es;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProjects: null,
    pendingTasks: null,
    activityPoints: null,
    collaborators: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentFeed, setRecentFeed] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    const loadData = async () => {
      try {
        const [profileRes, projectsRes, tasksRes, activityRes] = await Promise.all([
          fetchGraphQL({ query: GET_PROFILE }),
          fetchGraphQL({ query: GET_MY_PROJECTS, variables: { skip: 0, take: 50 } }),
          fetchGraphQL({ query: GET_PENDING_TASKS_BY_USER }),
          fetchGraphQL({ query: GET_DASHBOARD_ACTIVITY })
        ]);

        if (isSubscribed) {
          if (profileRes?.me) {
            setProfile(profileRes.me);

            if (projectsRes?.myProjects?.items) {
              const items = projectsRes.myProjects.items;
              setProjects(items);

              const leaderProjects = items.filter((p: Project) => {
                const activeMembers = p.members?.filter(m => m.status === 'ACTIVE') || [];
                const myMembership = activeMembers.find(m => m.user.id === user?.userId);
                const role = p.myRole || myMembership?.role;
                return role === 'LEADER';
              });

              const collaboratorIds = new Set<string>();
              leaderProjects.forEach((p: Project) => {
                p.members
                  ?.filter(m => m.status === 'ACTIVE' && m.user.id !== user?.userId)
                  .forEach(m => collaboratorIds.add(m.user.id));
              });

              const pendingTasksCount = tasksRes?.pendingTasksByUserId?.length || 0;

              setMetrics(prev => ({
                ...prev,
                activeProjects: items.filter((p: Project) => p.status === 'ACTIVE').length,
                collaborators: collaboratorIds.size,
                pendingTasks: pendingTasksCount,
              }));
            }

            if (activityRes) {
              setRecentFeed(activityRes.myRecentFeed || []);
              setMetrics(prev => ({
                ...prev,
                activityPoints: activityRes.myWeeklyActivityPoints || 0,
              }));
            }
          }
        }
      } catch (error: unknown) {
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    loadData();
    return () => { isSubscribed = false; };
  }, []);

  const handleProjectCreated = () => {
    setIsLoading(true);
    Promise.all([
      fetchGraphQL({ query: GET_PROFILE }),
      fetchGraphQL({ query: GET_MY_PROJECTS, variables: { skip: 0, take: 50 } })
    ])
      .then(([profileRes, projectsRes]) => {
        if (profileRes?.me && projectsRes?.myProjects?.items) {
          const items = projectsRes.myProjects.items;
          setProjects(items);

          const leaderProjects = items.filter((p: Project) => {
            const activeMembers = p.members?.filter(m => m.status === 'ACTIVE') || [];
            const myMembership = activeMembers.find(m => m.user.id === user?.userId);
            const role = p.myRole || myMembership?.role;
            return role === 'LEADER';
          });

          const collaboratorIds = new Set<string>();
          leaderProjects.forEach((p: Project) => {
            p.members
              ?.filter(m => m.status === 'ACTIVE' && m.user.id !== user?.userId)
              .forEach(m => collaboratorIds.add(m.user.id));
          });

          setMetrics(prev => ({
            ...prev,
            activeProjects: items.filter((p: Project) => p.status === 'ACTIVE').length,
            collaborators: collaboratorIds.size,
          }));
        }
      })
      .finally(() => setIsLoading(false));
  };

  const getFormattedDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const langCode = locale === 'en' ? 'en-US' : 'es-ES';
    let formatted = date.toLocaleDateString(langCode, options);
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${formatted} · ${t('profile.semester')}`;
  };

  const getFirstName = (fullName?: string): string => {
    if (!fullName) return '...';
    return fullName.split(' ')[0];
  };

  const renderMetricValue = (value: number | null) => {
    if (isLoading || value === null) return '-';
    return value.toString();
  };

  const getFeedMessage = (log: { action: string; entity?: string; meta?: string | Record<string, unknown>; user?: { name?: string }; }) => {
    const userName = log.user?.name?.split(' ')[0] || t('profile.feedSomeone');

    let metaData: Record<string, unknown> = {};
    if (log.meta) {
      try {
        metaData = typeof log.meta === 'string' ? JSON.parse(log.meta) : log.meta;
      } catch (e) {
        console.error('Error leyendo los metadatos', e);
      }
    }

    const itemName = metaData.title ? `"${metaData.title}"` : t('profile.feedElement');
    const interpolate = (key: Parameters<typeof t>[0], vars: Record<string, string>) =>
      Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), t(key));

    switch (log.action) {
      case 'CREATED':
        if (log.entity === 'TASK') return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedCreatedTask', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;
        if (log.entity === 'PROJECT') return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedCreatedProject', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;
        if (log.entity === 'EXPECTED_RESULT') return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedCreatedResult', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedCreated', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;

      case 'UPDATED':
        if (metaData.newStatus) {
          return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedUpdatedStatus', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName, status: `<span class="font-medium">${String(metaData.newStatus)}</span>` }) }} />;
        }
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedUpdated', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;

      case 'MOVED':
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedMoved', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;

      case 'COMMENTED':
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedCommented', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;

      case 'JOINED':
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedJoined', { user: `<span class="font-medium text-text-primary">${userName}</span>` }) }} />;

      case 'ASSIGNED':
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedAssigned', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;

      default:
        return <span dangerouslySetInnerHTML={{ __html: interpolate('profile.feedDefault', { user: `<span class="font-medium text-text-primary">${userName}</span>`, item: itemName }) }} />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-surface-page">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {mounted
              ? t('profile.welcome').replace('{name}', getFirstName(user?.name ?? profile?.name))
              : '...'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {mounted ? getFormattedDate() : t('profile.loading')}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-dark-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('profile.newProject')}
        </button>
      </header>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('profile.metricActiveProjects'), value: metrics.activeProjects, icon: Briefcase, color: 'text-brand dark:text-brand-light', bg: 'bg-brand-light dark:bg-brand/20' },
          { label: t('profile.metricPendingTasks'), value: metrics.pendingTasks, icon: CheckSquare, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/20' },
          { label: t('profile.metricActivity'), value: metrics.activityPoints, icon: Activity, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/20' },
          { label: t('profile.metricCollaborators'), value: metrics.collaborators, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/20' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-surface-primary border text-left border-border-primary p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{renderMetricValue(stat.value)}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="col-span-1 lg:col-span-2">
          <div className="bg-surface-primary border border-border-primary rounded-xl shadow-sm h-full flex flex-col">
            <div className="px-6 py-5 border-b border-border-primary flex items-center justify-between">
                            <h2 className="text-base font-semibold text-text-primary">{t('profile.myProjects')}</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="animate-pulse w-full max-w-sm space-y-4">
                    <div className="h-20 bg-surface-secondary rounded-xl w-full"></div>
                    <div className="h-20 bg-surface-secondary rounded-xl w-full"></div>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 bg-surface-secondary rounded-full flex items-center justify-center mb-3">
                    <FolderKanban className="w-6 h-6 text-gray-400" />
                  </div>
                                    <p className="text-sm font-medium text-text-primary">{t('profile.emptyProjectsTitle')}</p>
                  <p className="text-sm text-text-muted mt-1 max-w-sm">{t('profile.emptyProjectsDesc')}</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <Link
                      key={proj.id}
                      href={`/misc/proyectos/${proj.id}`}
                      className="block group bg-surface-primary rounded-2xl border border-border-primary p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: proj.color ?? 'var(--color-brand)' }}
                          ></div>
                          <h3 className="font-semibold text-text-primary leading-tight group-hover:text-brand transition-colors line-clamp-1 text-sm">
                            {getLocalizedText(proj.name, locale as 'es' | 'en' | 'pt')}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 mt-auto flex-1 mb-4">
                        {getLocalizedText(proj.description, locale as 'es' | 'en' | 'pt') || t('profile.noDescription')}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-border-primary mt-auto">
                        <span className="text-[10px] font-medium px-2 py-1 bg-surface-secondary text-text-secondary rounded-full uppercase tracking-wider">
                          {proj.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="col-span-1 border border-border-primary rounded-xl shadow-sm bg-surface-primary h-full flex flex-col">
          <div className="px-6 py-5 border-b border-border-primary">
                        <h2 className="text-base font-semibold text-text-primary">{t('profile.activityFeed')}</h2>
          </div>
          <div className="p-0 flex-1 flex flex-col overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-surface-secondary rounded-full shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-surface-secondary rounded w-3/4"></div>
                      <div className="h-2 bg-surface-secondary rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentFeed.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
                <div className="w-12 h-12 bg-surface-secondary rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                                <p className="text-sm text-text-muted">{t('profile.noActivity')}</p>
              </div>
            ) : (
              <div className="overflow-y-auto custom-scrollbar p-6 space-y-6 max-h-[500px]">
                {recentFeed.map((log) => (
                  <div key={log.id} className="flex gap-3 relative group">
                    {/* Línea conectora (opcional para estilo timeline) */}
                    <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-surface-secondary group-last:hidden"></div>

                    <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 z-10 overflow-hidden">
                      {log.user?.avatarUrl ? (
                        <img src={log.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-brand">{log.user?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm text-text-secondary leading-snug">
                        {getFeedMessage(log)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[11px] text-gray-400 truncate max-w-[120px]" title={getLocalizedText(log.project?.name, locale as 'es' | 'en' | 'pt')}>
                           {getLocalizedText(log.project?.name, locale as 'es' | 'en' | 'pt')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}