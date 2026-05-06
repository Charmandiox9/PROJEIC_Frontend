'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import {
  ADMIN_GET_SYSTEM_DATA, ADMIN_UPDATE_SETTINGS,
  ADMIN_CREATE_ANNOUNCEMENT, ADMIN_TOGGLE_ANNOUNCEMENT
} from '@/graphql/admin/operations';
import {
  Settings, Megaphone, Calendar, ShieldAlert, Power,
  AlertCircle, Plus, Loader2, Info, AlertTriangle,
  CheckCircle2, X, Layers, Zap, Bell, RadioTower,
  ToggleLeft, ToggleRight, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const CSS_VARS = `
  :root {
    --sys-bg: #ffffff;
    --sys-surface: #f4f4f7;
    --sys-surface-2: #eeeef2;
    --sys-border: rgba(0,0,0,0.07);
    --sys-border-2: rgba(0,0,0,0.11);
    --sys-text: #0d0d10;
    --sys-muted: #7a7a88;
    --sys-input-bg: #f2f2f5;
    --sys-input-border: rgba(0,0,0,0.09);
    --sys-card-bg: #ffffff;
    --sys-skeleton: rgba(0,0,0,0.07);
    --sys-ghost-hover: rgba(0,0,0,0.05);
    --sys-row-hover: rgba(0,0,0,0.022);
    --sys-modal-bg: #ffffff;
    --sys-modal-header: #f8f8fb;
  }
  .dark {
    --sys-bg: transparent;
    --sys-surface: rgba(255,255,255,0.04);
    --sys-surface-2: rgba(255,255,255,0.07);
    --sys-border: rgba(255,255,255,0.07);
    --sys-border-2: rgba(255,255,255,0.11);
    --sys-text: #f0f0f4;
    --sys-muted: rgba(255,255,255,0.35);
    --sys-input-bg: rgba(255,255,255,0.05);
    --sys-input-border: rgba(255,255,255,0.09);
    --sys-card-bg: rgba(255,255,255,0.02);
    --sys-skeleton: rgba(255,255,255,0.07);
    --sys-ghost-hover: rgba(255,255,255,0.06);
    --sys-row-hover: rgba(255,255,255,0.025);
    --sys-modal-bg: #0e0e12;
    --sys-modal-header: rgba(255,255,255,0.025);
  }
  .sys-toggle {
    position: relative; display: inline-flex;
    height: 24px; width: 44px; cursor: pointer;
    border-radius: 999px; border: 1px solid var(--sys-border-2);
    background: var(--sys-surface-2);
    transition: background 0.2s ease, border-color 0.2s ease;
    flex-shrink: 0;
  }
  .sys-toggle.on { background: #3b82f6; border-color: rgba(59,130,246,0.4); }
  .sys-toggle.danger.on { background: #ef4444; border-color: rgba(239,68,68,0.4); }
  .sys-toggle-thumb {
    position: absolute; top: 2px; left: 2px;
    height: 18px; width: 18px; border-radius: 50%;
    background: white; transition: transform 0.2s cubic-bezier(.34,1.56,.64,1);
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  }
  .sys-toggle.on .sys-toggle-thumb { transform: translateX(20px); }
  .sys-input {
    background: var(--sys-input-bg);
    border: 1px solid var(--sys-input-border);
    color: var(--sys-text);
    border-radius: 12px;
    padding: 8px 12px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sys-input:focus {
    border-color: rgba(59,130,246,0.45);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  textarea.sys-input { resize: vertical; min-height: 80px; }
`;

function useAnime() {
  const [anime, setAnime] = useState<any>(null);
  useEffect(() => { import('animejs').then(m => { setAnime(() => m.default ?? m); }); }, []);
  return anime;
}

function Toggle({
  checked, onChange, danger = false, disabled = false
}: { checked: boolean; onChange: (v: boolean) => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`sys-toggle ${checked ? 'on' : ''} ${danger ? 'danger' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className="sys-toggle-thumb" />
    </button>
  );
}

const ANN_TYPES: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  INFO:    { icon: <Info className="h-3.5 w-3.5" />, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  label: 'Información' },
  WARNING: { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: '#fb923c', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', label: 'Advertencia' },
  ERROR:   { icon: <ShieldAlert className="h-3.5 w-3.5" />, color: '#f87171', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  label: 'Crítico' },
};

function AnnCard({ ann, onToggle }: { ann: any; onToggle: () => void }) {
  const cfg = ANN_TYPES[ann.type] ?? ANN_TYPES.INFO;
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-3.5 transition-all duration-200"
      style={{
        background: ann.isActive ? 'var(--sys-surface)' : 'var(--sys-surface)',
        border: `1px solid ${ann.isActive ? 'var(--sys-border)' : 'var(--sys-border)'}`,
        opacity: ann.isActive ? 1 : 0.5,
      }}
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {cfg.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-black text-[var(--sys-text)]">{ann.title}</p>
          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--sys-muted)] line-clamp-2">{ann.message}</p>
      </div>
      <button
        onClick={onToggle}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-150 mt-0.5"
        style={{
          background: ann.isActive ? 'rgba(34,197,94,0.1)' : 'var(--sys-surface-2)',
          color: ann.isActive ? '#4ade80' : 'var(--sys-muted)',
          border: ann.isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--sys-border)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = ann.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)';
          (e.currentTarget as HTMLButtonElement).style.color = ann.isActive ? '#f87171' : '#4ade80';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = ann.isActive ? 'rgba(34,197,94,0.1)' : 'var(--sys-surface-2)';
          (e.currentTarget as HTMLButtonElement).style.color = ann.isActive ? '#4ade80' : 'var(--sys-muted)';
        }}
        title={ann.isActive ? 'Desactivar' : 'Activar'}
      >
        {ann.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function AnnModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO' });

  useEffect(() => {
    if (!anime) return;
    anime({ targets: overlayRef.current, opacity: [0, 1], duration: 200, easing: 'linear' });
    anime({ targets: panelRef.current, opacity: [0, 1], translateY: [16, 0], scale: [0.97, 1], duration: 320, easing: 'easeOutExpo' });
  }, [anime]);

  const close = useCallback(() => {
    if (!anime) { onClose(); return; }
    anime({ targets: panelRef.current, opacity: 0, translateY: 10, scale: 0.97, duration: 200, easing: 'easeInExpo', complete: onClose });
    anime({ targets: overlayRef.current, opacity: 0, duration: 200, easing: 'linear' });
  }, [anime, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchGraphQL({ query: ADMIN_CREATE_ANNOUNCEMENT, variables: { ...form } });
      toast.success(<span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Anuncio publicado</span>);
      onCreated();
      close();
    } catch {
      toast.error('No se pudo publicar el anuncio');
    } finally {
      setSubmitting(false);
    }
  };

  const cfg = ANN_TYPES[form.type];

  return (
    <div ref={overlayRef} style={{ opacity: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(7px)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={close}>
      <form ref={panelRef} onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{ opacity: 0, background: 'var(--sys-modal-bg)', border: '1px solid var(--sys-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--sys-border)] px-5 py-4"
          style={{ background: 'var(--sys-modal-header)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--sys-text)]">Nuevo Comunicado</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sys-muted)]">Banner global</p>
            </div>
          </div>
          <button type="button" onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-[var(--sys-muted)] transition-colors hover:bg-[var(--sys-ghost-hover)] hover:text-[var(--sys-text)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">

          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--sys-muted)]">Nivel de alerta</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ANN_TYPES).map(([key, c]) => (
                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type: key }))}
                  className="flex flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-150"
                  style={{
                    background: form.type === key ? c.bg : 'var(--sys-surface)',
                    border: `1px solid ${form.type === key ? c.border : 'var(--sys-border)'}`,
                    color: form.type === key ? c.color : 'var(--sys-muted)',
                  }}>
                  {c.icon}
                  <span className="text-[9px] font-black uppercase tracking-wider">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--sys-muted)]">Título</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Mantenimiento programado"
              className="sys-input w-full" />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--sys-muted)]">Mensaje</label>
            <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Describe el anuncio con detalle…"
              className="sys-input w-full" rows={3} />
          </div>

          {/* Preview */}
          {(form.title || form.message) && (
            <div className="rounded-xl p-3 text-xs"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
              <p className="font-black">{form.title || 'Sin título'}</p>
              {form.message && <p className="mt-0.5 opacity-80">{form.message}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--sys-border)] px-5 py-4"
          style={{ background: 'var(--sys-modal-header)' }}>
          <button type="button" onClick={close}
            className="rounded-xl px-4 py-2 text-sm font-bold text-[var(--sys-muted)] transition-colors hover:bg-[var(--sys-ghost-hover)] hover:text-[var(--sys-text)]">
            Cancelar
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black text-white transition-all disabled:opacity-50"
            style={{ background: '#f97316', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#ea6c0a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f97316')}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RadioTower className="h-4 w-4" />}
            Publicar ahora
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingRow({
  icon, title, desc, children, danger = false
}: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl p-4 transition-colors ${danger ? '' : ''}`}
      style={{
        background: danger ? 'rgba(239,68,68,0.05)' : 'var(--sys-surface)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.14)' : 'var(--sys-border)'}`,
      }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: danger ? 'rgba(239,68,68,0.1)' : 'var(--sys-surface-2)',
            color: danger ? '#f87171' : 'var(--sys-muted)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'var(--sys-border)'}`,
          }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-black ${danger ? 'text-red-400' : 'text-[var(--sys-text)]'}`}>{title}</p>
          <p className="text-xs text-[var(--sys-muted)] truncate">{desc}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SysCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl ${className}`}
      style={{ background: 'var(--sys-card-bg)', border: '1px solid var(--sys-border)' }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--sys-border)] px-5 py-4"
      style={{ background: 'var(--sys-modal-header)' }}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--sys-muted)]">{title}</span>
      </div>
      {action}
    </div>
  );
}

export default function AdminSystemPage() {
  const [settings, setSettings] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();

  /* CSS vars */
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'sys-page-vars';
    el.textContent = CSS_VARS;
    if (!document.getElementById('sys-page-vars')) document.head.appendChild(el);
    return () => document.getElementById('sys-page-vars')?.remove();
  }, []);

  /* Entrance */
  useEffect(() => {
    if (loading || !anime) return;
    const t = setTimeout(() => {
      anime({ targets: headerRef.current, opacity: [0, 1], translateY: [-10, 0], duration: 550, easing: 'easeOutExpo' });
      anime({ targets: '.sys-card', opacity: [0, 1], translateY: [20, 0], duration: 600, delay: anime.stagger(80, { start: 100 }), easing: 'easeOutExpo' });
    }, 60);
    return () => clearTimeout(t);
  }, [loading, anime]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGraphQL({ query: ADMIN_GET_SYSTEM_DATA });
      setSettings(res.data?.adminGetSettings ?? res.adminGetSettings);
      setAnnouncements(res.data?.adminGetAnnouncements ?? res.adminGetAnnouncements ?? []);
    } catch {
      toast.error('Error al cargar datos del sistema');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdateSettings = async (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    try {
      await fetchGraphQL({ query: ADMIN_UPDATE_SETTINGS, variables: { [key]: value } });
      toast.success(<span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Configuración guardada</span>);
    } catch {
      toast.error('Error al guardar cambios');
      loadData();
    }
  };

  const handleToggleAnnouncement = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      await fetchGraphQL({ query: ADMIN_TOGGLE_ANNOUNCEMENT, variables: { id, isActive: !currentStatus } });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
    } catch {
      toast.error('Error al cambiar estado del anuncio');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500/15" />
        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--sys-muted,#888)]">
        Cargando entorno del sistema…
      </p>
    </div>
  );

  const activeAnns = announcements.filter(a => a.isActive).length;

  return (
    <>
      <style>{CSS_VARS}</style>

      {modalOpen && (
        <AnnModal onClose={() => setModalOpen(false)} onCreated={loadData} />
      )}

      <div className="space-y-7 p-6 lg:p-8 max-w-7xl mx-auto w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div ref={headerRef} style={{ opacity: 0 }}>
          <div className="mb-1 flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sys-muted)]">
              Admin · Sistema
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--sys-text)]"
            style={{ letterSpacing: '-0.02em' }}>
            Entorno del Sistema
          </h1>
          <p className="mt-0.5 text-sm text-[var(--sys-muted)]">
            Variables globales y comunicación directa con los usuarios.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* ── Panel 1: Reglas de negocio ── */}
          <SysCard className="sys-card" style={{ opacity: 0 }}>
            <CardHeader
              icon={<Zap className="h-3.5 w-3.5 text-blue-400" />}
              title="Reglas de negocio"
            />
            <div className="flex flex-col gap-3 p-4">

              {/* Active period */}
              <SettingRow
                icon={<Calendar className="h-4 w-4" />}
                title="Semestre Activo"
                desc="Impacta en la creación de nuevos proyectos"
              >
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--sys-muted)]" />
                  <input
                    type="text"
                    value={settings?.activePeriod ?? ''}
                    onChange={e => setSettings((s: any) => ({ ...s, activePeriod: e.target.value }))}
                    onBlur={e => handleUpdateSettings('activePeriod', e.target.value)}
                    className="sys-input w-28 pl-7 font-bold"
                    placeholder="2026-1"
                  />
                </div>
              </SettingRow>

              {/* Allow new projects */}
              <SettingRow
                icon={<Layers className="h-4 w-4" />}
                title="Nuevos Proyectos"
                desc="Habilita creación para estudiantes"
              >
                <Toggle
                  checked={!!settings?.allowNewProjects}
                  onChange={v => handleUpdateSettings('allowNewProjects', v)}
                />
              </SettingRow>

              {/* Maintenance mode — danger */}
              <SettingRow
                icon={<ShieldAlert className="h-4 w-4" />}
                title="Modo Mantenimiento"
                desc="Restringe el acceso a toda la plataforma"
                danger
              >
                <Toggle
                  checked={!!settings?.maintenanceMode}
                  onChange={v => handleUpdateSettings('maintenanceMode', v)}
                  danger
                />
              </SettingRow>

              {/* Warning if maintenance on */}
              {settings?.maintenanceMode && (
                <div className="flex items-start gap-2.5 rounded-xl p-3"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                  <p className="text-[11px] font-bold text-red-400 leading-relaxed">
                    La plataforma está en mantenimiento. Los usuarios no pueden acceder.
                  </p>
                </div>
              )}
            </div>
          </SysCard>

          {/* ── Panel 2: Banners globales ── */}
          <SysCard className="sys-card" style={{ opacity: 0 }}>
            <CardHeader
              icon={<Bell className="h-3.5 w-3.5 text-orange-400" />}
              title="Banners Globales"
              action={
                <div className="flex items-center gap-2">
                  {activeAnns > 0 && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                      {activeAnns} activo{activeAnns !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black text-white transition-all"
                    style={{ background: '#f97316', boxShadow: '0 3px 12px rgba(249,115,22,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ea6c0a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f97316')}>
                    <Plus className="h-3.5 w-3.5" /> Nuevo
                  </button>
                </div>
              }
            />

            <div className="flex flex-col gap-2 overflow-y-auto p-4" style={{ maxHeight: 300 }}>
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: 'var(--sys-surface)', border: '1px solid var(--sys-border)' }}>
                    <AlertCircle className="h-5 w-5 text-[var(--sys-muted)]" />
                  </div>
                  <p className="text-xs font-bold text-[var(--sys-muted)]">Sin comunicados activos</p>
                  <button onClick={() => setModalOpen(true)}
                    className="text-xs font-black text-orange-400 hover:text-orange-300 transition-colors">
                    + Crear el primero
                  </button>
                </div>
              ) : (
                announcements.map(ann => (
                  <AnnCard
                    key={ann.id}
                    ann={ann}
                    onToggle={() => handleToggleAnnouncement(ann.id, ann.isActive)}
                  />
                ))
              )}
            </div>
          </SysCard>
        </div>

        <p className="text-center text-[10px] tracking-wider" style={{ color: 'var(--sys-muted)', opacity: 0.45 }}>
          PROJEIC · Universidad Católica del Norte
        </p>
      </div>
    </>
  );
}