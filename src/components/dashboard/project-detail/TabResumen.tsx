'use client';

import { Edit3, Trash2, Calendar, Layout, Globe, Lock, Loader2, UserPlus, User } from 'lucide-react';
import { Project, STATUS_COLORS, ROLE_OPTIONS } from './types';
import MemberAvatar from './MemberAvatar';
import RoleBadge from './RoleBadge';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';

interface TabResumenProps {
  project: Project;
  isLeader: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onAddMember: () => void;
  isDeleting: boolean;
}

export default function TabResumen({
  project,
  isLeader,
  onEdit,
  onDelete,
  onUpdateRole,
  onRemoveMember,
  onAddMember,
  isDeleting,
}: TabResumenProps) {
  const { t, tDynamic } = useT();
  const { locale } = useLocale();
  const creationDate = new Date(project.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const activeMembers = project.members.filter(m => m.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="bg-surface-primary rounded-2xl border border-border-primary overflow-hidden shadow-sm">
        <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
        <div className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-extrabold text-text-primary tracking-tight break-words">
                {project.name}
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 ${STATUS_COLORS[project.status] ?? 'bg-surface-secondary text-text-secondary'}`}>
                {tDynamic(`projectStatus.${project.status}`)}
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-3xl">
              {project.description ?? t('projectDetail.noDescription')}
            </p>
          </div>
          {isLeader && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onEdit}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-surface-primary border border-border-secondary text-text-primary text-sm font-bold rounded-xl hover:bg-surface-tertiary transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-brand" /> {t('projectDetail.edit')}
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? t('projectDetail.deleting') : t('projectDetail.delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
        <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 space-y-6 h-fit shadow-sm min-w-0">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest truncate">{t('projectDetail.detailsTitle')}</h3>
          <div className="grid grid-cols-1 gap-4 min-w-0">
            <div className="flex items-center gap-4 p-4 bg-surface-secondary/30 rounded-2xl border border-border-secondary group hover:border-brand/30 transition-all min-w-0">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-tighter sm:tracking-widest mb-0.5 truncate">{t('projectDetail.createdOn')}</p>
                <p className="text-sm font-bold text-text-primary break-words whitespace-normal">{creationDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-secondary/30 rounded-2xl border border-border-secondary group hover:border-brand/30 transition-all min-w-0">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Layout className="w-6 h-6 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-tighter sm:tracking-widest mb-0.5 truncate">{t('projectDetail.methodology')}</p>
                <p className="text-sm font-bold text-text-primary capitalize break-words whitespace-normal">{project.methodology.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-secondary/30 rounded-2xl border border-border-secondary group hover:border-brand/30 transition-all min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${project.isPublic ? 'bg-green-100' : 'bg-gray-100'}`}>
                {project.isPublic ? (
                  <Globe className="w-6 h-6 text-green-600" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-tighter sm:tracking-widest mb-0.5 truncate">{t('projectDetail.visibility')}</p>
                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg border ${project.isPublic ? 'bg-green-100 text-green-700 border-green-200' : 'bg-surface-secondary text-text-secondary border-border-primary'} whitespace-normal break-words max-w-full`}>
                  {project.isPublic ? t('projectDetail.public') : t('projectDetail.private')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 space-y-4 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">
              {t('projectDetail.team').replace('{n}', String(activeMembers.length))}
            </h3>
            {isLeader && (
              <button
                onClick={onAddMember}
                className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-2 transition-all bg-brand/5 px-3 py-1.5 rounded-xl border border-brand/10 hover:border-brand/30"
              >
                <UserPlus className="w-4 h-4" /> {t('projectDetail.addMember')}
              </button>
            )}
          </div>

          {activeMembers.length > 0 ? (
            <ul className="space-y-3 overflow-y-auto max-h-[400px] nice-scrollbar pr-2">
              {activeMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between p-4 bg-surface-secondary/30 rounded-2xl border border-border-secondary hover:border-brand/20 transition-all group">
                  <div className="flex items-center gap-4 min-w-0 mr-4">
                    <div className="shrink-0 group-hover:scale-105 transition-transform">
                      <MemberAvatar member={member} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text-primary truncate" title={member.user.name}>
                        {member.user.name}
                      </p>
                      {member.status === 'PENDING' && (
                        <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase text-amber-600 mt-0.5">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> {t('projectDetail.pending')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isLeader ? (
                      <div className="relative group/role">
                        <RoleBadge role={member.role} label={tDynamic('projectRole.' + member.role) || member.role} />
                        <select
                          value={member.role}
                          onChange={(e) => onUpdateRole(member.id, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value} className="bg-surface-primary text-text-primary">
                              {tDynamic('projectRole.' + r.value)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <RoleBadge role={member.role} label={tDynamic('projectRole.' + member.role) || member.role} />
                    )}
                    {isLeader && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all shrink-0"
                        title={t('projectDetail.removeMember')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-surface-secondary/20 rounded-2xl border border-dashed border-border-primary">
              <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-muted">{t('projectDetail.noMembers')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
