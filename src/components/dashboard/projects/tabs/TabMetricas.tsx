'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Calendar, ArrowRight, AlertTriangle, ShieldCheck, Info, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  AreaChart, Area, Line, LineChart,
  ComposedChart
} from 'recharts'; 

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
  const [isMounted, setIsMounted] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount || 0);
  };

  useEffect(() => {
    setIsMounted(true);
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

  if (isLoading || !isMounted) {
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
  ];

  const pieChartData = metrics.tasksByColumn.map((col: any) => ({
    name: col.name,
    value: col.count,
    color: col.color || '#3B82F6'
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* TARJETA DE SALUD DEL PROYECTO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-6 shadow-sm">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" className="dark:stroke-gray-700" />
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
            <span className={`text-xs font-medium ${hasOverdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
              {healthText}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{metrics.completedTasks} {t('tabMetricas.totalTasks').toLowerCase()} ({metrics.totalTasks})</p>
        </div>
      </div>

      {metrics.projectRisk && (
        <div className={`rounded-xl border p-5 mb-6 shadow-sm transition-colors ${
          metrics.projectRisk.level === 'HIGH' ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900' :
          metrics.projectRisk.level === 'MEDIUM' ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900' :
          metrics.projectRisk.level === 'LOW' ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' :
          'bg-gray-50/50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg shrink-0 ${
              metrics.projectRisk.level === 'HIGH' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
              metrics.projectRisk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' :
              metrics.projectRisk.level === 'LOW' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
              'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {metrics.projectRisk.level === 'HIGH' && <AlertTriangle className="w-6 h-6" />}
              {metrics.projectRisk.level === 'MEDIUM' && <Info className="w-6 h-6" />}
              {metrics.projectRisk.level === 'LOW' && <ShieldCheck className="w-6 h-6" />}
              {metrics.projectRisk.level === 'UNKNOWN' && <Info className="w-6 h-6 opacity-60" />}
            </div>
            
            <div className="flex-1 w-full min-w-0">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${
                metrics.projectRisk.level === 'HIGH' ? 'text-red-800 dark:text-red-400' :
                metrics.projectRisk.level === 'MEDIUM' ? 'text-yellow-800 dark:text-yellow-400' :
                metrics.projectRisk.level === 'LOW' ? 'text-green-800 dark:text-green-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {t('tabMetricas.riskIndex')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mt-1">
                {metrics.projectRisk.message}
              </p>
              
              {/* Mostramos las barras solo si tenemos datos calculables */}
              {metrics.projectRisk.level !== 'UNKNOWN' && (
                <div className="mt-4 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500">
                      <span>{t('tabMetricas.timeElapsed') || 'Tiempo Transcurrido'}</span>
                      <span>{metrics.projectRisk.timeElapsedPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-400 dark:bg-gray-500" 
                        style={{ width: `${metrics.projectRisk.timeElapsedPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500">
                      <span>{t('tabMetricas.workCompleted') || 'Trabajo Completado'}</span>
                      <span>{metrics.projectRisk.workCompletedPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          metrics.projectRisk.level === 'HIGH' ? 'bg-red-500' :
                          metrics.projectRisk.level === 'MEDIUM' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} 
                        style={{ width: `${metrics.projectRisk.workCompletedPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MÉTRICAS RÁPIDAS & TENDENCIA DE ACTIVIDAD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:border-brand/30 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
          </div>
        ))}

        {/* TARJETA ESPECIAL: GRÁFICA DE ÁREA DE ACTIVIDAD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm relative overflow-hidden group hover:border-brand/30 transition-colors">
          <div className="relative z-10 pointer-events-none">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tabMetricas.activity7Days') || 'Actividad (7 días)'}</p>
            <p className="text-2xl font-bold text-brand mt-1">{metrics.activityLast7Days}</p>
          </div>
          
          {metrics.activityTrend && metrics.activityTrend.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
              <ResponsiveContainer width="100%" height={64}>
                <AreaChart data={metrics.activityTrend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                  <RechartsTooltip 
                    cursor={false}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => format(new Date(label), "d MMM", { locale: dateLocale })}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO CIRCULAR: DISTRIBUCIÓN POR COLUMNA */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{t('tabMetricas.boardDistribution')}</h3>
          
          {metrics.tasksByColumn.length === 0 ? (
            <div className="text-center py-8 flex-1 flex flex-col justify-center">
              <p className="text-sm text-gray-400">{t('tabMetricas.noColumns')}</p>
            </div>
          ) : (
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--bg-surface-primary, #ffffff)' }}
                    formatter={(value) => [`${value} tareas`, 'Total']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* LISTA ACCIONABLE: TAREAS VENCIDAS */}
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
                  className="w-full text-left flex items-center justify-between p-3 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/50 hover:border-red-200 transition-colors rounded-lg group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-700 dark:group-hover:text-red-400 truncate transition-colors">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t('tabMetricas.overdueSince')} {format(new Date(task.dueDate), "d MMM yyyy", { locale: dateLocale })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
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

      {/* GRÁFICO DE BARRAS APILADAS: MAPA DE CARGA DE TRABAJO (WORKLOAD) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
          {t('tabMetricas.workload') || 'Carga de Trabajo por Miembro'}
        </h3>
        
        {metrics.workload && metrics.workload.length > 0 ? (
          <div className="w-full overflow-x-auto nice-scrollbar pb-2">
            <div className="h-[300px] min-w-[600px] lg:min-w-0 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metrics.workload}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
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
                  
                  <Bar dataKey="todo" name={t('kanban.todo') || 'Por Hacer'} stackId="a" fill="#9CA3AF" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="inProgress" name={t('kanban.inProgress') || 'En Progreso'} stackId="a" fill="#3B82F6" />
                  <Bar dataKey="inReview" name={t('kanban.statusInReview') || 'En Revisión'} stackId="a" fill="#F59E0B" />
                  <Bar dataKey="done" name={t('kanban.done') || 'Completado'} stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 flex flex-col justify-center h-[300px]">
            <p className="text-sm text-gray-400">No hay datos de carga de trabajo disponibles.</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {t('tabMetricas.burndownChart') || 'Burndown Chart'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ritmo de completado vs. Trabajo total del proyecto.
            </p>
          </div>
        </div>
        
        {metrics.burndownData && metrics.burndownData.length > 0 ? (
          <div className="w-full overflow-x-auto nice-scrollbar pb-2">
            <div className="h-[350px] min-w-[600px] lg:min-w-0 w-full">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={metrics.burndownData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(val) => format(new Date(val), "d MMM", { locale: dateLocale })} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    allowDecimals={false}
                  />
                  <RechartsTooltip 
                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'var(--bg-surface-primary, #ffffff)' 
                    }}
                    labelFormatter={(label) => format(new Date(label), "d MMMM yyyy", { locale: dateLocale })}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  
                  <Line 
                    type="stepAfter" 
                    dataKey="totalTasks" 
                    name="Total de Tareas" 
                    stroke="#9CA3AF" 
                    strokeWidth={2} 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completedTasks" 
                    name="Tareas Completadas" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
            <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tabMetricas.burndownCollecting')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[250px]">
              {t('tabMetricas.burndownDesc')}
            </p>
          </div>
        )}
      </div>

      {/* ==================================================
          2. NUEVA SECCIÓN: MÉTRICAS FINANCIERAS (BURN RATE)
          ================================================== */}
      
      {metrics.financialTrend && metrics.financialTrend.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border-primary space-y-6">
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand/10 p-2 rounded-lg text-brand">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Burn Rate & Salud Financiera</h2>
              <p className="text-sm text-text-muted">Análisis de cómo el proyecto está consumiendo su presupuesto institucional.</p>
            </div>
          </div>

          {/* Tarjetas resumen financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-primary border border-border-primary p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <Wallet className="w-4 h-4" />
                <h4 className="text-sm font-semibold uppercase tracking-wider">Presupuesto Actual</h4>
              </div>
              <p className="text-3xl font-black text-text-primary">{formatCurrency(metrics.currentBalance || 0)}</p>
            </div>
            <div className="bg-surface-primary border border-border-primary p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <TrendingDown className="w-4 h-4" />
                <h4 className="text-sm font-semibold uppercase tracking-wider">Total Gastado</h4>
              </div>
              <p className="text-3xl font-black text-red-500">-{formatCurrency(metrics.totalSpent || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* GRÁFICO 1: EVOLUCIÓN DEL BALANCE (BURN RATE) */}
            <div className="xl:col-span-2 bg-surface-primary rounded-2xl border border-border-primary p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Proyección de Gastos (Burn Rate)</h3>
              <div className="w-full overflow-x-auto nice-scrollbar pb-2">
                <div className="h-[300px] min-w-[600px] lg:min-w-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={metrics.financialTrend} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        tickFormatter={(val) => format(new Date(val), "d MMM", { locale: dateLocale })}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false} tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        tickFormatter={(val) => `$${(val / 1000)}k`} // Formato abreviado
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface-primary)' }}
                        labelFormatter={(label) => format(new Date(label), "d MMM yyyy", { locale: dateLocale })}
                        formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), name === 'balance' ? 'Bóveda' : 'Gastos del día']}
                      />
                      <Legend iconType="circle" />
                      {/* Area verde para el balance */}
                      <Area yAxisId="left" type="stepAfter" dataKey="balance" name="Balance de Bóveda" fill="url(#colorBalance)" stroke="#10B981" strokeWidth={3} />
                      {/* Barras rojas para indicar días de alto gasto */}
                      <Bar yAxisId="left" dataKey="spent" name="Gastos Diarios" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* GRÁFICO 2: DISTRIBUCIÓN DE GASTOS */}
            <div className="xl:col-span-1 bg-surface-primary rounded-2xl border border-border-primary p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Distribución de Gastos</h3>
              
              {metrics.expensesByType && metrics.expensesByType.length > 0 ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.expensesByType}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                        >
                          {metrics.expensesByType.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--bg-surface-primary)' }}
                          formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), 'Monto']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Leyenda personalizada */}
                  <div className="mt-4 space-y-2 px-2">
                    {metrics.expensesByType.map((expense: any) => (
                      <div key={expense.type} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }}></div>
                          <span className="text-text-primary font-medium">{expense.name}</span>
                        </div>
                        <span className="text-text-muted font-bold">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
                  <DollarSign className="w-12 h-12 mb-2" />
                  <p className="text-sm text-center">Aún no hay gastos registrados para analizar la distribución.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}