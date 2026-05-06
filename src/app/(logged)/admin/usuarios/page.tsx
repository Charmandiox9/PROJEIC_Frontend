'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { ADMIN_GET_USERS, ADMIN_UPDATE_ROLE } from '@/graphql/admin/operations';
import {
  Search, UserCog, ShieldCheck, Trash2, Mail,
  Calendar, ChevronLeft, ChevronRight, Loader2,
  Users, X, Shield, GraduationCap, UserCircle2,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt: string;
}

function useAnime() {
  const [anime, setAnime] = useState<any>(null);
  useEffect(() => {
    import('animejs').then((mod) => { setAnime(() => mod.default ?? mod); });
  }, []);
  return anime;
}

function RoleBadge({ user }: { user: User }) {
  if (user.isAdmin) return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
      <Shield className="h-2.5 w-2.5" /> Root Admin
    </span>
  );
  if (user.email.endsWith('@ucn.cl')) return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
      style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
      <GraduationCap className="h-2.5 w-2.5" /> Profesor
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <UserCircle2 className="h-2.5 w-2.5" /> Estudiante
    </span>
  );
}

function Avatar({ user }: { user: User }) {
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = user.name.charCodeAt(0) * 137 % 360;

  return (
    <div className="relative h-10 w-10 flex-shrink-0">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-2xl object-cover" />
      ) : (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-black"
          style={{
            background: `hsl(${hue},55%,18%)`,
            color: `hsl(${hue},80%,70%)`,
            border: `1px solid hsl(${hue},55%,28%)`,
          }}
        >
          {initials}
        </div>
      )}
      {user.isAdmin && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/40">
          <Shield className="h-2 w-2 text-white" />
        </span>
      )}
    </div>
  );
}

interface ConfirmModalProps {
  user: User;
  action: 'promote' | 'demote' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ user, action, onConfirm, onCancel }: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();

  useEffect(() => {
    if (!anime || !modalRef.current) return;
    anime({
      targets: modalRef.current,
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 280,
      easing: 'easeOutExpo',
    });
  }, [anime]);

  const configs = {
    promote: {
      icon: <ShieldCheck className="h-5 w-5" />,
      color: '#ef4444',
      title: 'Otorgar permisos de Admin',
      desc: `¿Dar acceso root a ${user.name}? Tendrá control total del sistema.`,
      btn: 'Sí, hacer Admin',
    },
    demote: {
      icon: <Shield className="h-5 w-5" />,
      color: '#f97316',
      title: 'Revocar permisos de Admin',
      desc: `¿Quitar privilegios a ${user.name}? Volverá a ser usuario estándar.`,
      btn: 'Sí, revocar acceso',
    },
    delete: {
      icon: <AlertTriangle className="h-5 w-5" />,
      color: '#ef4444',
      title: 'Eliminar usuario',
      desc: `Esta acción es irreversible. ¿Eliminar a ${user.name} del sistema?`,
      btn: 'Sí, eliminar',
    },
  };

  const cfg = configs[action];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl p-6"
        style={{
          background: 'rgba(16,16,20,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        <button onClick={onCancel} className="absolute right-4 top-4 rounded-xl p-1.5 text-white/30 hover:text-white/60 transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: `${cfg.color}18`, color: cfg.color }}>
          {cfg.icon}
        </div>

        <h3 className="text-base font-black text-white">{cfg.title}</h3>
        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{cfg.desc}</p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-black text-white transition-all hover:brightness-110"
            style={{ background: cfg.color, boxShadow: `0 8px 24px ${cfg.color}40` }}
          >
            {cfg.btn}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 animate-pulse rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', width: i === 1 ? '70%' : i === 4 ? '40%' : '55%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<{ user: User; action: 'promote' | 'demote' | 'delete' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const take = 10;

  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const anime = useAnime();

  /* ── Entrance ── */
  useEffect(() => {
    if (!anime) return;
    const timer = setTimeout(() => {
      if (headerRef.current) anime({ targets: headerRef.current, opacity: [0, 1], translateY: [-12, 0], duration: 600, easing: 'easeOutExpo' });
      if (tableRef.current) anime({ targets: tableRef.current, opacity: [0, 1], translateY: [20, 0], duration: 700, delay: 120, easing: 'easeOutExpo' });
    }, 80);
    return () => clearTimeout(timer);
  }, [anime]);

  /* ── Row animation on data load ── */
  const animateRows = useCallback(() => {
    if (!anime) return;
    const rows = document.querySelectorAll('.user-row');
    if (!rows.length) return;
    anime({
      targets: rows,
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 400,
      delay: anime.stagger(40),
      easing: 'easeOutExpo',
    });
  }, [anime]);

  /* ── Data fetch ── */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchGraphQL({
        query: ADMIN_GET_USERS,
        variables: { skip: page * take, take, search },
      });
      const data = response.data?.adminGetUsers ?? response.adminGetUsers;
      setUsers(data.items);
      setTotalCount(data.totalCount);
      setTimeout(animateRows, 60);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, search, animateRows]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* ── Toggle admin ── */
  const handleToggleAdmin = async (user: User) => {
    setModal({ user, action: user.isAdmin ? 'demote' : 'promote' });
  };

  const confirmAction = async () => {
    if (!modal) return;
    setActionLoading(modal.user.id);
    setModal(null);
    try {
      if (modal.action !== 'delete') {
        await fetchGraphQL({
          query: ADMIN_UPDATE_ROLE,
          variables: { userId: modal.user.id, isAdmin: !modal.user.isAdmin },
        });
        toast.success(
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Rol actualizado correctamente</span>
        );
      } else {
        toast.success('Usuario eliminado');
      }
      loadUsers();
    } catch {
      toast.error('Error al ejecutar la acción');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / take);
  const currentFrom = page * take + 1;
  const currentTo = Math.min((page + 1) * take, totalCount);

  const formatSafeDate = (dateVal: string | number) => {
    if (!dateVal) return 'N/A';
    const dateToParse = !isNaN(Number(dateVal)) ? Number(dateVal) : dateVal;
    const date = new Date(dateToParse);
    
    return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
  };

  return (
    <>
      {/* ── Confirm modal ── */}
      {modal && (
        <ConfirmModal
          user={modal.user}
          action={modal.action}
          onConfirm={confirmAction}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="space-y-7 p-6 lg:p-8 max-w-7xl mx-auto w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Header ── */}
        <div ref={headerRef} style={{ opacity: 0 }}
          className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Admin · UCN</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Gestión de Usuarios
            </h1>
            <p className="mt-0.5 text-sm text-white/35">Control de roles y acceso de la comunidad PROJEIC.</p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar nombre o correo…"
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(239,68,68,0.4)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Table container ── */}
        <div ref={tableRef} style={{ opacity: 0 }}
          className="overflow-hidden rounded-3xl"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.015)',
          }}>

          {/* Table top bar */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/25">Usuarios</span>
              {!loading && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-red-400"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {totalCount.toLocaleString()}
                </span>
              )}
            </div>
            {search && (
              <span className="text-xs text-white/30">
                Resultados para <span className="text-white/60">"{search}"</span>
              </span>
            )}
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Usuario', 'Rol', 'Registro', 'Acciones'].map((col, i) => (
                  <th key={col}
                    className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.2)', textAlign: i === 3 ? 'right' : 'left' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Search className="h-6 w-6 text-white/20" />
                      </div>
                      <p className="text-sm font-bold text-white/25">Sin resultados</p>
                      <p className="text-xs text-white/15">Intenta con otro término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="user-row group"
                    style={{
                      opacity: 0,
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{u.name}</p>
                          <p className="flex items-center gap-1 truncate text-xs"
                            style={{ color: 'rgba(255,255,255,0.3)' }}>
                            <Mail className="h-2.5 w-2.5 flex-shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <RoleBadge user={u} />
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        {formatSafeDate(u.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5
                                      opacity-0 translate-x-2 transition-all duration-200
                                      group-hover:opacity-100 group-hover:translate-x-0">
                        {/* Toggle admin */}
                        <button
                          onClick={() => handleToggleAdmin(u)}
                          disabled={actionLoading === u.id}
                          title={u.isAdmin ? 'Revocar Admin' : 'Hacer Admin'}
                          className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150"
                          style={{
                            background: u.isAdmin ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
                            color: u.isAdmin ? '#ef4444' : 'rgba(255,255,255,0.3)',
                            border: `1px solid ${u.isAdmin ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = u.isAdmin
                              ? 'rgba(239,68,68,0.22)' : 'rgba(239,68,68,0.1)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = u.isAdmin
                              ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)';
                            (e.currentTarget as HTMLButtonElement).style.color = u.isAdmin
                              ? '#ef4444' : 'rgba(255,255,255,0.3)';
                          }}
                        >
                          {actionLoading === u.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <UserCog className="h-3.5 w-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setModal({ user: u, action: 'delete' })}
                          title="Eliminar usuario"
                          className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.3)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ── Pagination ── */}
          {!loading && totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>

              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Mostrando{' '}
                <span className="font-bold text-white/50">{currentFrom}–{currentTo}</span>
                {' '}de{' '}
                <span className="font-bold text-white/50">{totalCount}</span>
                {' '}usuarios
              </p>

              <div className="flex items-center gap-2">
                {/* Page pills */}
                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: page === p ? '#ef4444' : 'rgba(255,255,255,0.05)',
                          color: page === p ? '#fff' : 'rgba(255,255,255,0.3)',
                          border: page === p ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Prev / Next */}
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-20"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={(page + 1) * take >= totalCount}
                  onClick={() => setPage(p => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-20"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.1)' }}>
          PROJEIC · Universidad Católica del Norte
        </p>
      </div>
    </>
  );
}