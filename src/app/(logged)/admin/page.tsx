'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import {
  Users, FolderKanban, BookOpen, GraduationCap,
  TrendingUp, Loader2, ArrowUpRight, Layers, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  Area, AreaChart, Cell
} from 'recharts';
import { GET_GLOBAL_STATS } from '@/graphql/admin/operations';

/* ─── Types ─────────────────────────────────────────────────── */
interface Stats {
  totalUsers: number;
  totalProfessors: number;
  totalProjects: number;
  activeSubjects: number;
  projectsAdoption: { month: string; count: number }[];
}

/* ─── Anime.js lazy loader ───────────────────────────────────── */
function useAnime() {
  const [anime, setAnime] = useState<any>(null);
  useEffect(() => {
    import('animejs').then((mod) => {
      setAnime(() => mod.default ?? mod);
    });
  }, []);
  return anime;
}

/* ─── Custom Tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(10,10,14,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '10px 16px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p style={{ color: '#888', fontSize: 11, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{payload[0].value}</p>
      <p style={{ color: '#e55', fontSize: 11, margin: 0, marginTop: 2 }}>proyectos</p>
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────────────── */
interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  delay: number;
  trend?: string;
}

function KpiCard({ icon, label, value, accent, delay, trend }: KpiProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const anime = useAnime();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!anime || !cardRef.current || !numRef.current) return;

      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 600,
        easing: 'easeOutExpo',
      });

      anime({
        targets: { val: 0 },
        val: value,
        duration: 1200,
        delay: 200,
        easing: 'easeOutExpo',
        update(anim: any) {
          if (numRef.current) {
            numRef.current.textContent = Math.round(anim.animations[0].currentValue).toLocaleString();
          }
        },
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, anime]);

  return (
    <div
      ref={cardRef}
      style={{ opacity: 0 }}
      className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm
                 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 cursor-default"
    >
      {/* Glow spot */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ background: `${accent}18`, color: accent }}
          >
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">{label}</p>
        <p className="mt-1 text-4xl font-black tracking-tight text-white">
          <span ref={numRef}>0</span>
        </p>
      </div>

      {/* Bottom bar accent */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();

  /* ── Data fetch ── */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchGraphQL({ query: GET_GLOBAL_STATS });
        setStats(response.data?.getGlobalStats ?? response.getGlobalStats);
      } catch (error) {
        console.error('Error cargando estadísticas globales', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  /* ── Entrance animations ── */
  useEffect(() => {
    if (!stats || !anime) return;

    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [-16, 0],
        duration: 700,
        easing: 'easeOutExpo',
      });
    }

    if (chartRef.current) {
      anime({
        targets: chartRef.current,
        opacity: [0, 1],
        translateY: [32, 0],
        duration: 800,
        delay: 500,
        easing: 'easeOutExpo',
      });
    }
  }, [stats, anime]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-sm text-white/30 tracking-widest uppercase">Cargando métricas</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const students = stats.totalUsers - stats.totalProfessors;
  const maxCount = Math.max(...(stats.projectsAdoption?.map((d) => d.count) ?? [1]));

  /* ── Color palette for bars ── */
  const barColors = stats.projectsAdoption?.map((d) =>
    d.count === maxCount ? '#ef4444' : '#ef444430'
  );

  /* ── Spark mini data (area chart) ── */
  const sparkData = stats.projectsAdoption?.map((d) => ({ v: d.count })) ?? [];

  /* ── KPI definitions ── */
  const kpis: KpiProps[] = [
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Estudiantes',
      value: students,
      accent: '#3b82f6',
      delay: 80,
      trend: '+4.2%',
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: 'Profesores',
      value: stats.totalProfessors,
      accent: '#a855f7',
      delay: 180,
    },
    {
      icon: <FolderKanban className="h-5 w-5" />,
      label: 'Proyectos',
      value: stats.totalProjects,
      accent: '#ef4444',
      delay: 280,
      trend: '+12%',
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Asignaturas',
      value: stats.activeSubjects,
      accent: '#f97316',
      delay: 380,
    },
  ];

  return (
    <div
      className="min-h-screen space-y-10 p-6 lg:p-8 max-w-7xl mx-auto w-full"
      style={{ background: 'transparent', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <div ref={headerRef} style={{ opacity: 0 }} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-red-500" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            PROJEIC · UCN
          </span>
        </div>
        <h1
          className="text-4xl font-black tracking-tight text-white"
          style={{ letterSpacing: '-0.02em' }}
        >
          Dashboard General
        </h1>
        <p className="text-sm text-white/40">
          Métricas de adopción y uso de la plataforma en tiempo real.
        </p>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Chart section ── */}
      <div
        ref={chartRef}
        style={{ opacity: 0 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* Main bar chart */}
        <div
          className="col-span-2 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Adopción</p>
              <h3 className="mt-0.5 text-lg font-bold text-white">Proyectos creados</h3>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] px-3 py-1">
              <Activity className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs text-white/40">Últimos 6 meses</span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.projectsAdoption}
                margin={{ top: 8, right: 4, left: -28, bottom: 0 }}
                onMouseLeave={() => setActiveBar(null)}
              >
                <CartesianGrid
                  strokeDasharray="2 6"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={52}
                  onMouseEnter={(_, idx) => setActiveBar(idx)}
                >
                  {stats.projectsAdoption?.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={activeBar === idx ? '#ef4444' : barColors?.[idx] ?? '#ef444430'}
                      style={{ transition: 'fill 0.2s ease' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side panel: summary + sparkline */}
        <div className="flex flex-col gap-4">
          {/* Total projects sparkline card */}
          <div className="flex-1 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">Tendencia</p>
            <p className="mt-1 text-3xl font-black text-white">
              {stats.totalProjects.toLocaleString()}
            </p>
            <p className="mb-4 text-xs text-white/30">proyectos totales</p>

            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#sparkGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#ef4444' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ratio card */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">
              Ratio usuarios
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-black text-white">
                {students > 0 && stats.totalProfessors > 0
                  ? (students / stats.totalProfessors).toFixed(1)
                  : '—'}
              </span>
              <span className="mb-0.5 text-sm text-white/30">est / prof</span>
            </div>
            {/* Visual ratio bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((students / (students + stats.totalProfessors)) * 100, 100).toFixed(1)}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/25">
              <span>Estudiantes</span>
              <span>Profesores</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer note ── */}
      <p className="text-center text-xs text-white/15 tracking-wider">
        PROJEIC · Universidad Católica del Norte · Datos en tiempo real
      </p>
    </div>
  );
}