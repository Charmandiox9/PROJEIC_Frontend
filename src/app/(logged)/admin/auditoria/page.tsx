'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import {
  ADMIN_GET_PROJECTS, ADMIN_DELETE_PROJECT,
  ADMIN_GET_PROJECT_DETAILS
} from '@/graphql/admin/operations';
import {
  Search, ShieldAlert, Globe, Lock, Trash2, Calendar,
  BookOpen, Loader2, Eye, X, Activity, Github, Users,
  Wallet, GitBranch, Briefcase, Layers, ChevronRight,
  Clock, CheckCircle2, Archive, Hash
} from 'lucide-react';
import { toast } from 'sonner';

const CSS_VARS = `
  :root {
    --audit-modal-bg: #ffffff;
    --audit-modal-header: #f8f8fb;
    --audit-modal-border: rgba(0,0,0,0.07);
    --audit-surface: #f4f4f7;
    --audit-surface-2: #eeeef2;
    --audit-text: #0d0d10;
    --audit-muted: #7a7a88;
    --audit-row-border: rgba(0,0,0,0.055);
    --audit-row-hover: rgba(0,0,0,0.022);
    --audit-input-bg: #f2f2f5;
    --audit-input-border: rgba(0,0,0,0.09);
    --audit-table-bg: #ffffff;
    --audit-table-border: rgba(0,0,0,0.065);
    --audit-skeleton: rgba(0,0,0,0.07);
    --audit-code-bg: #f0f0f4;
    --audit-code-fg: #1a1a22;
    --audit-code-border: rgba(0,0,0,0.09);
    --audit-member-bg: #fafafa;
    --audit-member-border: rgba(0,0,0,0.07);
    --audit-ghost-hover: rgba(0,0,0,0.05);
  }
  .dark {
    --audit-modal-bg: #0e0e12;
    --audit-modal-header: rgba(255,255,255,0.025);
    --audit-modal-border: rgba(255,255,255,0.07);
    --audit-surface: rgba(255,255,255,0.04);
    --audit-surface-2: rgba(255,255,255,0.07);
    --audit-text: #f0f0f4;
    --audit-muted: rgba(255,255,255,0.35);
    --audit-row-border: rgba(255,255,255,0.05);
    --audit-row-hover: rgba(255,255,255,0.025);
    --audit-input-bg: rgba(255,255,255,0.04);
    --audit-input-border: rgba(255,255,255,0.09);
    --audit-table-bg: rgba(255,255,255,0.015);
    --audit-table-border: rgba(255,255,255,0.065);
    --audit-skeleton: rgba(255,255,255,0.07);
    --audit-code-bg: rgba(255,255,255,0.08);
    --audit-code-fg: rgba(255,255,255,0.9);
    --audit-code-border: rgba(255,255,255,0.1);
    --audit-member-bg: rgba(255,255,255,0.025);
    --audit-member-border: rgba(255,255,255,0.07);
    --audit-ghost-hover: rgba(255,255,255,0.06);
  }
`;

const formatDate = (v: string | number) => {
  if (!v) return '—';
  const d = new Date(!isNaN(Number(v)) ? Number(v) : v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
};

function useAnime() {
  const [anime, setAnime] = useState<any>(null);
  useEffect(() => { import('animejs').then(m => { setAnime(() => m.default ?? m); }); }, []);
  return anime;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--audit-row-border)]">
      {[48, 32, 20].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 animate-pulse rounded-md bg-[var(--audit-skeleton)]" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

function VisibilityPill({ isPublic }: { isPublic: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
      style={isPublic
        ? { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }
        : { background: 'rgba(255,255,255,0.05)', color: 'var(--audit-muted)', border: '1px solid var(--audit-row-border)' }
      }>
      {isPublic ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
      {isPublic ? 'Público' : 'Privado'}
    </span>
  );
}

function StatusBadge({ archived }: { archived: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
      style={archived
        ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
        : { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
      }>
      {archived ? <Archive className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5" />}
      {archived ? 'Archivado' : 'Activo'}
    </span>
  );
}

function MemberCard({ m }: { m: any }) {
  const initials = m.user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = m.user.name.charCodeAt(0) * 137 % 360;
  return (
    <div className="flex items-center gap-2.5 rounded-xl p-2.5"
      style={{ background: 'var(--audit-member-bg)', border: '1px solid var(--audit-member-border)' }}>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden text-xs font-black"
        style={{ background: `hsl(${hue},50%,88%)`, color: `hsl(${hue},60%,30%)` }}>
        {m.user.avatarUrl
          ? <img src={m.user.avatarUrl} alt="" className="h-full w-full object-cover" />
          : initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-[var(--audit-text)]">{m.user.name}</p>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--audit-muted)' }}>{m.role}</p>
      </div>
    </div>
  );
}

function DetailModal({ project, onClose }: { project: any; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();
  const isLoading = project._isLoading;

  useEffect(() => {
    if (!anime) return;
    anime({ targets: overlayRef.current, opacity: [0, 1], duration: 200, easing: 'linear' });
    anime({ targets: panelRef.current, opacity: [0, 1], translateY: [20, 0], scale: [0.97, 1], duration: 340, easing: 'easeOutExpo' });
  }, [anime]);

  const close = useCallback(() => {
    if (!anime) { onClose(); return; }
    anime({ targets: panelRef.current, opacity: 0, translateY: 12, scale: 0.97, duration: 220, easing: 'easeInExpo', complete: onClose });
    anime({ targets: overlayRef.current, opacity: 0, duration: 220, easing: 'linear' });
  }, [anime, onClose]);

  return (
    <div ref={overlayRef} style={{ opacity: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(7px)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={close}>
      <div ref={panelRef} onClick={e => e.stopPropagation()}
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{ opacity: 0, maxHeight: '88vh', background: 'var(--audit-modal-bg)', border: '1px solid var(--audit-modal-border)' }}>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--audit-muted)]">
              Extrayendo datos clasificados…
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="shrink-0 border-b border-[var(--audit-modal-border)] px-6 py-5"
              style={{ background: 'var(--audit-modal-header)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge archived={project.isArchived} />
                    {project.isInstitutional && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                        style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <Briefcase className="h-2.5 w-2.5" /> Institucional
                      </span>
                    )}
                    <VisibilityPill isPublic={project.isPublic} />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-[var(--audit-text)]"
                    style={{ letterSpacing: '-0.02em' }}>
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="mt-1 text-sm leading-relaxed text-[var(--audit-muted)] line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <button onClick={close}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-colors text-[var(--audit-muted)] hover:text-[var(--audit-text)]"
                  style={{ border: '1px solid var(--audit-modal-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--audit-ghost-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* Left col */}
                <div className="space-y-4 lg:col-span-1">

                  {/* Meta card */}
                  <div className="space-y-3 rounded-2xl p-4"
                    style={{ background: 'var(--audit-surface)', border: '1px solid var(--audit-row-border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--audit-muted)]">Metadatos</p>

                    {[
                      { icon: <Activity className="h-3.5 w-3.5" />, label: 'Estado', value: project.status },
                      { icon: <GitBranch className="h-3.5 w-3.5" />, label: 'Metodología', value: project.methodology },
                    ].map(({ icon, label, value }) => value && (
                      <div key={label} className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-[var(--audit-muted)]">{icon}</span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--audit-muted)]">{label}</p>
                          <p className="text-sm font-bold text-[var(--audit-text)]">{value}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-start gap-2.5">
                      <Clock className="mt-0.5 h-3.5 w-3.5 text-[var(--audit-muted)]" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--audit-muted)]">Fechas</p>
                        <p className="text-xs text-[var(--audit-text)]">Creado: <span className="font-bold">{formatDate(project.createdAt)}</span></p>
                        <p className="text-xs text-[var(--audit-text)]">Editado: <span className="font-bold">{formatDate(project.updatedAt)}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Subject card */}
                  {project.subject && (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)' }}>
                      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        <BookOpen className="h-3 w-3" /> Asignatura
                      </p>
                      <p className="text-sm font-black text-[var(--audit-text)]">{project.subject.name}</p>
                      <span className="mt-0.5 inline-block rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold"
                        style={{ background: 'var(--audit-code-bg)', color: 'var(--audit-code-fg)', border: '1px solid var(--audit-code-border)' }}>
                        {project.subject.code}
                      </span>
                      {project.subject.professors?.length > 0 && (
                        <div className="mt-3 border-t border-blue-500/10 pt-3 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--audit-muted)]">Docentes</p>
                          {project.subject.professors.map((p: any) => (
                            <p key={p.email} className="flex items-center gap-1.5 text-xs text-[var(--audit-text)]">
                              <ChevronRight className="h-3 w-3 text-blue-400" />{p.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wallet */}
                  {project.wallet ? (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-400">
                        <Wallet className="h-3 w-3" /> Wallet
                      </p>
                      <p className="text-2xl font-black" style={{ color: '#4ade80' }}>
                        ${Number(project.wallet.balance).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'var(--audit-surface)', border: '1px solid var(--audit-row-border)' }}>
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--audit-muted)]">
                        <Wallet className="h-3 w-3" /> Wallet
                      </p>
                      <p className="text-xs italic text-[var(--audit-muted)]">No activada</p>
                    </div>
                  )}
                </div>

                {/* Right col */}
                <div className="space-y-5 lg:col-span-2">

                  {/* Members */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-[var(--audit-muted)]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--audit-muted)]">
                        Equipo
                      </p>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
                        {project.members?.length ?? 0}
                      </span>
                    </div>
                    {project.members?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {project.members.map((m: any) => <MemberCard key={m.user.email} m={m} />)}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[var(--audit-muted)]">Sin miembros registrados.</p>
                    )}
                  </div>

                  {/* Repos */}
                  <div className="border-t border-[var(--audit-row-border)] pt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Github className="h-3.5 w-3.5 text-[var(--audit-muted)]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--audit-muted)]">
                        Repositorios
                      </p>
                      {project.repositories?.length > 0 && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                          style={{ background: 'var(--audit-surface)', color: 'var(--audit-muted)', border: '1px solid var(--audit-row-border)' }}>
                          {project.repositories.length}
                        </span>
                      )}
                    </div>
                    {project.repositories?.length > 0 ? (
                      <div className="space-y-1.5">
                        {project.repositories.map((repo: any, i: number) => (
                          <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors"
                            style={{ background: 'var(--audit-surface)', border: '1px solid var(--audit-row-border)' }}>
                            <GitBranch className="h-3.5 w-3.5 flex-shrink-0 text-[var(--audit-muted)]" />
                            <span className="flex-1 truncate font-mono text-xs font-bold text-blue-400">{repo.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[var(--audit-muted)]">Sin repositorios vinculados.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminAuditPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailedProject, setDetailedProject] = useState<any | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();

  /* CSS vars */
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'audit-page-vars';
    el.textContent = CSS_VARS;
    if (!document.getElementById('audit-page-vars')) document.head.appendChild(el);
    return () => document.getElementById('audit-page-vars')?.remove();
  }, []);

  /* Entrance */
  useEffect(() => {
    if (!anime) return;
    const t = setTimeout(() => {
      anime({ targets: headerRef.current, opacity: [0, 1], translateY: [-10, 0], duration: 550, easing: 'easeOutExpo' });
      anime({ targets: tableRef.current, opacity: [0, 1], translateY: [18, 0], duration: 650, delay: 100, easing: 'easeOutExpo' });
    }, 60);
    return () => clearTimeout(t);
  }, [anime]);

  /* Row stagger */
  const animateRows = useCallback(() => {
    if (!anime) return;
    const rows = document.querySelectorAll('.audit-row');
    if (!rows.length) return;
    anime({ targets: rows, opacity: [0, 1], translateX: [-10, 0], duration: 380, delay: anime.stagger(40), easing: 'easeOutExpo' });
  }, [anime]);

  /* Data */
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGraphQL({ query: ADMIN_GET_PROJECTS, variables: { skip: 0, take: 50, search } });
      setProjects(res.data?.adminGetProjects?.items ?? res.adminGetProjects?.items ?? []);
      setTimeout(animateRows, 60);
    } catch {
      toast.error('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  }, [search, animateRows]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleOpenDetails = async (id: string) => {
    setDetailedProject({ id, _isLoading: true });
    try {
      const res = await fetchGraphQL({ query: ADMIN_GET_PROJECT_DETAILS, variables: { id } });
      setDetailedProject(res.data?.adminGetProjectDetails ?? res.adminGetProjectDetails);
    } catch {
      toast.error('Error al obtener detalles');
      setDetailedProject(null);
    }
  };

  return (
    <>
      {detailedProject && (
        <DetailModal project={detailedProject} onClose={() => setDetailedProject(null)} />
      )}

      <div className="space-y-7 p-6 lg:p-8 max-w-7xl mx-auto w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div ref={headerRef} style={{ opacity: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--audit-muted)]">
                Admin · God Mode
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--audit-text)]"
              style={{ letterSpacing: '-0.02em' }}>
              Auditoría de Proyectos
            </h1>
            <p className="mt-0.5 text-sm text-[var(--audit-muted)]">
              Supervisión total de todos los proyectos en la plataforma.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--audit-muted)]" />
            <input
              type="text"
              placeholder="Buscar proyecto…"
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl py-2.5 pl-9 pr-4 text-sm text-[var(--audit-text)] outline-none transition-all duration-200"
              style={{ background: 'var(--audit-input-bg)', border: '1px solid var(--audit-input-border)' }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(239,68,68,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid var(--audit-input-border)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--audit-muted)] hover:text-[var(--audit-text)] transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div ref={tableRef} style={{ opacity: 0 }}
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--audit-table-bg)', border: '1px solid var(--audit-table-border)' }}>

          {/* Top bar */}
          <div className="flex items-center gap-2 border-b border-[var(--audit-row-border)] px-5 py-3.5"
            style={{ background: 'var(--audit-modal-header)' }}>
            <Layers className="h-3.5 w-3.5 text-[var(--audit-muted)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--audit-muted)]">
              Proyectos
            </span>
            {!loading && (
              <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {projects.length}
              </span>
            )}
            {search && (
              <span className="ml-auto text-[10px] text-[var(--audit-muted)]">
                Filtrando por <span className="font-bold text-[var(--audit-text)]">"{search}"</span>
              </span>
            )}
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--audit-row-border)]"
                style={{ background: 'var(--audit-modal-header)' }}>
                {['Proyecto', 'Contexto', ''].map((h, i) => (
                  <th key={i}
                    className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--audit-muted)]"
                    style={{ textAlign: i === 2 ? 'right' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                : projects.length === 0
                  ? (
                    <tr>
                      <td colSpan={3} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{ background: 'var(--audit-surface)', border: '1px solid var(--audit-row-border)' }}>
                            <Search className="h-5 w-5 text-[var(--audit-muted)]" />
                          </div>
                          <p className="text-sm font-bold text-[var(--audit-muted)]">
                            {search ? 'Sin resultados para esa búsqueda' : 'No hay proyectos registrados'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : projects.map(proj => (
                    <tr key={proj.id}
                      className="audit-row group cursor-pointer border-b border-[var(--audit-row-border)] transition-colors duration-100"
                      style={{ opacity: 0 }}
                      onClick={() => handleOpenDetails(proj.id)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--audit-row-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Project */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors"
                            style={proj.isPublic
                              ? { background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }
                              : { background: 'var(--audit-surface)', color: 'var(--audit-muted)' }
                            }>
                            {proj.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[var(--audit-text)]">{proj.name}</p>
                            <p className="flex items-center gap-1 text-[10px] text-[var(--audit-muted)]">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(proj.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Context */}
                      <td className="px-5 py-3.5">
                        {proj.subject
                          ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
                              style={{ background: 'var(--audit-code-bg)', color: 'var(--audit-code-fg)', border: '1px solid var(--audit-code-border)' }}>
                              <BookOpen className="h-3 w-3" />
                              {proj.subject.name}
                            </span>
                          )
                          : <span className="text-xs italic text-[var(--audit-muted)]">Independiente</span>
                        }
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          className="inline-flex h-7 w-7 items-center justify-center rounded-xl
                                     opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                                     transition-all duration-150 text-[var(--audit-muted)]"
                          style={{ border: '1px solid var(--audit-row-border)' }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.1)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.25)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--audit-muted)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--audit-row-border)';
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        <p className="text-center text-[10px] tracking-wider" style={{ color: 'var(--audit-muted)', opacity: 0.5 }}>
          PROJEIC · Universidad Católica del Norte
        </p>
      </div>
    </>
  );
}