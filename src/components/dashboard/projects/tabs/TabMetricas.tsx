'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'; 

import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_METRICS } from '@/graphql/misc/operations';
import { useT } from '@/hooks/useT';

interface TabMetricasProps {
  projectId: string;
  onTaskClick: (taskId: string) => void;
}

export default function TabMetricas({ projectId, onTaskClick }: TabMetricasProps) {
  const { t, locale } = useT();
  const dateLocale = locale === 'en' ? enUS : es;
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadMetrics = async () => {
      try {
        const data = await fetchGraphQL({
          query: GET_PROJECT_METRICS,
          variables: { projectId }
        });
        setMetrics(data.projectMetrics);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!metrics) return null;

  const progressPercentage = metrics.totalTasks > 0
    ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
    : 0;

  const hasOverdue = metrics.overdueTasksCount > 0;
  const healthBgColor = hasOverdue ? 'bg-red-500' : 'bg-green-500';
  const healthText = hasOverdue 
    ? `${metrics.overdueTasksCount} ${metrics.overdueTasksCount === 1 ? t('tabMetricas.overdueTaskSingle') : t('tabMetricas.overdueTaskPlural')}` 
    : t('tabMetricas.noOverdueTasks');

  const metricCards = [
    { label: t('tabMetricas.totalTasks'), value: metrics.totalTasks },
    { label: t('tabMetricas.overdueTasksLabel'), value: metrics.overdueTasksCount },
    { label: t('tabMetricas.inReview'), value: metrics.inReviewTasks },
    { label: t('tabMetricas.activity7Days'), value: metrics.activityLast7Days },
  ];

  const chartData = metrics.tasksByColumn.map((col: any) => ({
    name: col.name,
    value: col.count,
    color: col.color || '#3B82F6'
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-6 shadow-sm">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={progressPercentage === 0 ? '#f3f4f6' : '#22c55e'}
              strokeWidth="3.5"
              strokeDasharray={`${progressPercentage} 100`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{progressPercentage}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{t('tabMetricas.projectHealth')}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${healthBgColor} animate-pulse`} />
            <span className={`text-xs font-medium ${hasOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              {healthText}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{metrics.completedTasks} {t('tabMetricas.totalTasks').toLowerCase()} ({metrics.totalTasks})</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:border-brand/30 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{t('tabMetricas.boardDistribution')}</h3>
          
          {metrics.tasksByColumn.length === 0 ? (
            <div className="text-center py-8 flex-1 flex flex-col justify-center">
              <p className="text-sm text-gray-400">{t('tabMetricas.noColumns')}</p>
            </div>
          ) : (
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} tareas`, 'Total']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              {t('tabMetricas.overdueList')} 
              {hasOverdue && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{metrics.overdueTasksList.length}</span>}
            </h3>
          </div>

          {metrics.overdueTasksList.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center flex-1 justify-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('tabMetricas.allClear')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('tabMetricas.noOverdueDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {metrics.overdueTasksList.map((task: any) => (
                <button
                  onClick={() => onTaskClick(task.id)}
                  key={task.id} 
                  className="w-full text-left flex items-center justify-between p-3 bg-red-50/50 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-colors rounded-lg group"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 line-clamp-1 transition-colors">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-red-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t('tabMetricas.overdueSince')} {format(new Date(task.dueDate), "d MMM yyyy", { locale: dateLocale })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded text-gray-500 border border-gray-200">
                      {task.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
          {t('tabMetricas.workload') || 'Carga de Trabajo por Miembro'}
        </h3>
        
        {metrics.workload && metrics.workload.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.workload}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="memberName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--bg-surface-primary, #ffffff)' 
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                {/* Barras Apiladas (Stacked) */}
                <Bar dataKey="todo" name={t('kanban.todo') || 'Por Hacer'} stackId="a" fill="#9CA3AF" radius={[0, 0, 4, 4]} />
                <Bar dataKey="inProgress" name={t('kanban.inProgress') || 'En Progreso'} stackId="a" fill="#3B82F6" />
                <Bar dataKey="inReview" name={t('kanban.statusInReview') || 'En Revisión'} stackId="a" fill="#F59E0B" />
                <Bar dataKey="done" name={t('kanban.done') || 'Completado'} stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 flex flex-col justify-center h-[300px]">
            <p className="text-sm text-gray-400">{t('tabMetricas.noWorkload') || 'No hay datos de carga de trabajo disponibles.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}