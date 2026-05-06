'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import {
  GET_ALL_SUBJECTS, GET_PROFESSORS_FOR_SELECT,
  CREATE_SUBJECT, UPDATE_SUBJECT
} from '@/graphql/admin/operations';
import {
  BookOpen, Plus, Edit2, Loader2, Users, Calendar,
  Hash, X, UserPlus, UserMinus, Search, Layers,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────────── */
interface Professor { id: string; name: string; email?: string; avatarUrl?: string; }
interface Subject {
  id: string; name: string; code: string; period: string; professors: Professor[];
}
interface FormData {
  name: string; code: string; period: string; professorIds: string[];
}

/* ─── Anime.js lazy loader ───────────────────────────────────── */
function useAnime() {
  const [anime, setAnime] = useState<any>(null);
  useEffect(() => {
    import('animejs').then((mod) => { setAnime(() => mod.default ?? mod); });
  }, []);
  return anime;
}

/* ─── Avatar initials ────────────────────────────────────────── */
function ProfAvatar({ name, size = 8 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = name.charCodeAt(0) * 137 % 360;
  const px = size * 4;
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-xl text-[10px] font-black`}
      style={{
        width: px, height: px,
        background: `hsl(${hue},50%,88%)`,
        color: `hsl(${hue},60%,30%)`,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Code badge ─────────────────────────────────────────────── */
function CodeBadge({ code }: { code: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-xs font-black uppercase tracking-wider
                 bg-[var(--bg-code)] text-[var(--fg-code)] border border-[var(--border-code)]"
    >
      {code}
    </span>
  );
}

/* ─── Period badge ───────────────────────────────────────────── */
function PeriodBadge({ period }: { period: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold
                     bg-[var(--badge-bg)] text-[var(--badge-fg)]">
      <Calendar className="h-3 w-3" />
      {period}
    </span>
  );
}

/* ─── Skeleton row ───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--row-border)]">
      {[40, 55, 30, 60, 20].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-3.5 animate-pulse rounded-md bg-[var(--skeleton-bg)]"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ─── Prof selector row ──────────────────────────────────────── */
function ProfRow({
  prof, assigned, onToggle
}: { prof: Professor; assigned: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-center justify-between rounded-xl p-2.5 transition-all duration-150
                 border border-[var(--row-border)] hover:border-[var(--prof-hover-border)]
                 bg-[var(--prof-bg)] hover:bg-[var(--prof-hover-bg)]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <ProfAvatar name={prof.name} size={7} />
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--prof-hover-text)] transition-colors">
            {prof.name}
          </p>
          {prof.email && (
            <p className="truncate text-[10px] text-[var(--text-muted)]">{prof.email}</p>
          )}
        </div>
      </div>
      {assigned
        ? <UserMinus className="h-3.5 w-3.5 flex-shrink-0 text-[var(--prof-assigned-icon)] group-hover:text-red-500 transition-colors" />
        : <UserPlus className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--prof-hover-text)] transition-colors" />
      }
    </button>
  );
}

/* ─── Modal ──────────────────────────────────────────────────── */
interface ModalProps {
  editingSubject: Subject | null;
  professorsList: Professor[];
  onClose: () => void;
  onSaved: () => void;
}

function SubjectModal({ editingSubject, professorsList, onClose, onSaved }: ModalProps) {
  const anime = useAnime();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profSearch, setProfSearch] = useState('');
  const [formData, setFormData] = useState<FormData>(() =>
    editingSubject
      ? { name: editingSubject.name, code: editingSubject.code, period: editingSubject.period, professorIds: editingSubject.professors.map(p => p.id) }
      : { name: '', code: '', period: '2026-1', professorIds: [] }
  );

  /* entrance */
  useEffect(() => {
    if (!anime) return;
    anime({ targets: overlayRef.current, opacity: [0, 1], duration: 200, easing: 'linear' });
    anime({ targets: panelRef.current, opacity: [0, 1], translateY: [18, 0], scale: [0.97, 1], duration: 320, easing: 'easeOutExpo' });
  }, [anime]);

  const close = useCallback(() => {
    if (!anime) { onClose(); return; }
    anime({ targets: panelRef.current, opacity: [1, 0], translateY: [0, 12], scale: [1, 0.97], duration: 220, easing: 'easeInExpo', complete: onClose });
    anime({ targets: overlayRef.current, opacity: [1, 0], duration: 220, easing: 'linear' });
  }, [anime, onClose]);

  const toggleProfessor = (id: string) =>
    setFormData(prev => ({
      ...prev,
      professorIds: prev.professorIds.includes(id)
        ? prev.professorIds.filter(x => x !== id)
        : [...prev.professorIds, id]
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await fetchGraphQL({ query: UPDATE_SUBJECT, variables: { input: { id: editingSubject.id, ...formData } } });
        toast.success(<span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Asignatura actualizada</span>);
      } else {
        await fetchGraphQL({ query: CREATE_SUBJECT, variables: { input: formData } });
        toast.success(<span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Asignatura creada</span>);
      }
      onSaved(); close();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedProfs = professorsList.filter(p => formData.professorIds.includes(p.id));
  const availableProfs = professorsList.filter(p => !formData.professorIds.includes(p.id))
    .filter(p => !profSearch || p.name.toLowerCase().includes(profSearch.toLowerCase()) || p.email?.toLowerCase().includes(profSearch.toLowerCase()));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', opacity: 0 }}
      onClick={close}
    >
      <div
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{
          opacity: 0,
          background: 'var(--modal-bg)',
          border: '1px solid var(--modal-border)',
          maxHeight: '88vh',
        }}
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--modal-border)] px-5 py-4"
          style={{ background: 'var(--modal-header-bg)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {editingSubject ? 'Editar Asignatura' : 'Nueva Asignatura'}
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                Datos curriculares
              </p>
            </div>
          </div>
          <button onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--text-primary)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form id="subjectForm" onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5" style={{ overscrollBehavior: 'contain' }}>

          {/* Code + Period */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Código SIGA
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text" required value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="IS101"
                  className="w-full rounded-xl py-2.5 pl-8 pr-3 text-sm font-bold uppercase tracking-wider outline-none transition-all
                             bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)]
                             focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Periodo
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text" required value={formData.period}
                  onChange={e => setFormData({ ...formData, period: e.target.value })}
                  placeholder="2026-1"
                  className="w-full rounded-xl py-2.5 pl-8 pr-3 text-sm outline-none transition-all
                             bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)]
                             focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Nombre de la asignatura
            </label>
            <input
              type="text" required value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Ingeniería de Software I"
              className="w-full rounded-xl py-2.5 px-3 text-sm outline-none transition-all
                         bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)]
                         focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--modal-border)]" />

          {/* Assigned professors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                Asignados
              </label>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                {assignedProfs.length}
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5">
              {assignedProfs.length === 0
                ? <p className="py-2 text-xs italic text-[var(--text-muted)]">Ningún profesor asignado aún.</p>
                : assignedProfs.map(p => (
                  <ProfRow
                    key={p.id} prof={p} assigned
                    onToggle={() => toggleProfessor(p.id)}
                  />
                ))
              }
            </div>
          </div>

          {/* Available professors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Disponibles
              </label>
              <span className="rounded-full border border-[var(--row-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                {availableProfs.length}
              </span>
            </div>

            {/* Prof search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text" value={profSearch}
                onChange={e => setProfSearch(e.target.value)}
                placeholder="Filtrar profesores…"
                className="w-full rounded-lg py-1.5 pl-7 pr-3 text-xs outline-none transition-all
                           bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)]
                           focus:border-red-500/30 focus:ring-1 focus:ring-red-500/15"
              />
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
              {availableProfs.length === 0
                ? <p className="py-2 text-xs italic text-[var(--text-muted)]">
                  {profSearch ? 'Sin resultados para ese filtro.' : 'No hay más usuarios disponibles.'}
                </p>
                : availableProfs.map(p => (
                  <ProfRow
                    key={p.id} prof={p} assigned={false}
                    onToggle={() => toggleProfessor(p.id)}
                  />
                ))
              }
            </div>
          </div>
        </form>

        {/* Modal footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--modal-border)] px-5 py-4"
          style={{ background: 'var(--modal-header-bg)' }}>
          <button type="button" onClick={close}
            className="rounded-xl px-4 py-2 text-sm font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--text-primary)]">
            Cancelar
          </button>
          <button type="submit" form="subjectForm" disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black text-white transition-all disabled:opacity-50"
            style={{ background: '#ef4444', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
          >
            {isSubmitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
              : editingSubject ? 'Guardar Cambios' : 'Crear Asignatura'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professorsList, setProfessorsList] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();

  /* ── CSS variables injected once ── */
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'subjects-page-vars';
    style.textContent = `
      /* Light */
      :root {
        --modal-bg: #ffffff;
        --modal-header-bg: #f9f9fb;
        --modal-border: rgba(0,0,0,0.07);
        --input-bg: #f4f4f6;
        --input-border: rgba(0,0,0,0.09);
        --text-primary: #0f0f11;
        --text-muted: #7a7a85;
        --row-border: rgba(0,0,0,0.06);
        --row-hover: rgba(0,0,0,0.025);
        --skeleton-bg: rgba(0,0,0,0.07);
        --btn-ghost-hover: rgba(0,0,0,0.05);
        --badge-bg: rgba(0,0,0,0.06);
        --badge-fg: #555;
        --bg-code: #f1f1f3;
        --fg-code: #1a1a1f;
        --border-code: rgba(0,0,0,0.1);
        --prof-bg: #fafafa;
        --prof-hover-bg: rgba(59,130,246,0.05);
        --prof-hover-border: rgba(59,130,246,0.25);
        --prof-hover-text: #2563eb;
        --prof-assigned-icon: #3b82f6;
        --table-bg: #ffffff;
        --table-border: rgba(0,0,0,0.06);
        --table-header-bg: rgba(0,0,0,0.02);
      }
      /* Dark */
      .dark {
        --modal-bg: #111114;
        --modal-header-bg: rgba(255,255,255,0.025);
        --modal-border: rgba(255,255,255,0.07);
        --input-bg: rgba(255,255,255,0.04);
        --input-border: rgba(255,255,255,0.09);
        --text-primary: #f0f0f3;
        --text-muted: rgba(255,255,255,0.35);
        --row-border: rgba(255,255,255,0.05);
        --row-hover: rgba(255,255,255,0.025);
        --skeleton-bg: rgba(255,255,255,0.06);
        --btn-ghost-hover: rgba(255,255,255,0.06);
        --badge-bg: rgba(255,255,255,0.07);
        --badge-fg: rgba(255,255,255,0.45);
        --bg-code: rgba(255,255,255,0.07);
        --fg-code: rgba(255,255,255,0.9);
        --border-code: rgba(255,255,255,0.1);
        --prof-bg: rgba(255,255,255,0.02);
        --prof-hover-bg: rgba(59,130,246,0.08);
        --prof-hover-border: rgba(59,130,246,0.3);
        --prof-hover-text: #60a5fa;
        --prof-assigned-icon: #60a5fa;
        --table-bg: rgba(255,255,255,0.015);
        --table-border: rgba(255,255,255,0.06);
        --table-header-bg: rgba(255,255,255,0.02);
      }
    `;
    if (!document.getElementById('subjects-page-vars')) document.head.appendChild(style);
    return () => document.getElementById('subjects-page-vars')?.remove();
  }, []);

  /* ── Entrance ── */
  useEffect(() => {
    if (!anime) return;
    const t = setTimeout(() => {
      anime({ targets: headerRef.current, opacity: [0, 1], translateY: [-10, 0], duration: 550, easing: 'easeOutExpo' });
      anime({ targets: tableRef.current, opacity: [0, 1], translateY: [16, 0], duration: 650, delay: 100, easing: 'easeOutExpo' });
    }, 60);
    return () => clearTimeout(t);
  }, [anime]);

  /* ── Row stagger on load ── */
  const animateRows = useCallback(() => {
    if (!anime) return;
    const rows = document.querySelectorAll('.subject-row');
    if (!rows.length) return;
    anime({ targets: rows, opacity: [0, 1], translateX: [-8, 0], duration: 350, delay: anime.stagger(35), easing: 'easeOutExpo' });
  }, [anime]);

  /* ── Data fetch ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subsRes, profsRes] = await Promise.all([
        fetchGraphQL({ query: GET_ALL_SUBJECTS }),
        fetchGraphQL({ query: GET_PROFESSORS_FOR_SELECT }),
      ]);
      setSubjects(subsRes.data?.subjects ?? subsRes.subjects ?? []);
      const allUsers = profsRes.data?.adminGetUsers?.items ?? profsRes.adminGetUsers?.items ?? [];
      setProfessorsList(allUsers);
      setTimeout(animateRows, 60);
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [animateRows]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => { setEditingSubject(null); setModalOpen(true); };
  const openEdit = (sub: Subject) => { setEditingSubject(sub); setModalOpen(true); };

  return (
    <>
      {/* CSS vars */}
      <style>{`
        .subjects-input-focus:focus {
          border-color: rgba(239,68,68,0.45) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
        }
      `}</style>

      {modalOpen && (
        <SubjectModal
          editingSubject={editingSubject}
          professorsList={professorsList}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      )}

      <div className="space-y-7 p-6 lg:p-8 max-w-7xl mx-auto w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Header ── */}
        <div ref={headerRef} style={{ opacity: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Admin · UCN
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]"
              style={{ letterSpacing: '-0.02em' }}>
              Gestión Institucional
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Administra asignaturas y asigna profesores a cargo.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-black text-white transition-all sm:self-auto"
            style={{ background: '#ef4444', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            <Plus className="h-4 w-4" />
            Nueva Asignatura
          </button>
        </div>

        {/* ── Table ── */}
        <div ref={tableRef} style={{ opacity: 0 }}
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--table-bg)', border: '1px solid var(--table-border)' }}>

          {/* Table top bar */}
          <div className="flex items-center gap-2 border-b border-[var(--table-border)] px-5 py-3.5"
            style={{ background: 'var(--table-header-bg)' }}>
            <BookOpen className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Asignaturas
            </span>
            {!loading && (
              <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' }}>
                {subjects.length}
              </span>
            )}
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--table-border)]"
                style={{ background: 'var(--table-header-bg)' }}>
                {['Código', 'Asignatura', 'Periodo', 'Profesores', ''].map((h, i) => (
                  <th key={i}
                    className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]"
                    style={{ textAlign: i === 4 ? 'right' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : subjects.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{ background: 'var(--badge-bg)', border: '1px solid var(--table-border)' }}>
                            <BookOpen className="h-5 w-5 text-[var(--text-muted)]" />
                          </div>
                          <p className="text-sm font-bold text-[var(--text-muted)]">Sin asignaturas registradas</p>
                          <button onClick={openCreate}
                            className="rounded-xl px-4 py-2 text-xs font-black text-red-500 transition-colors hover:bg-red-500/10">
                            + Crear la primera
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                  : subjects.map(sub => (
                    <tr key={sub.id}
                      className="subject-row group border-b border-[var(--row-border)] transition-colors duration-100"
                      style={{ opacity: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--row-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <CodeBadge code={sub.code} />
                      </td>

                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{sub.name}</p>
                      </td>

                      {/* Period */}
                      <td className="px-5 py-3.5">
                        <PeriodBadge period={sub.period} />
                      </td>

                      {/* Professors */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {sub.professors?.length > 0
                            ? sub.professors.map(p => (
                              <span key={p.id}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                                style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                                <Users className="h-2.5 w-2.5" />
                                {p.name.split(' ')[0]}
                              </span>
                            ))
                            : <span className="text-xs italic text-[var(--text-muted)]">Sin asignar</span>
                          }
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openEdit(sub)}
                          title="Editar asignatura"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg
                                     opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                                     transition-all duration-150 text-[var(--text-muted)]
                                     hover:bg-red-500/10 hover:text-red-500"
                          style={{ border: '1px solid var(--row-border)' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--row-border)')}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] tracking-wider text-[var(--text-muted)]" style={{ opacity: 0.5 }}>
          PROJEIC · Universidad Católica del Norte
        </p>
      </div>
    </>
  );
}