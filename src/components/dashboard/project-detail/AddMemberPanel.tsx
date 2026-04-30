'use client';

import { useState } from 'react';
import { X, Check, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import Select from '@/components/ui/Select';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { ADD_PROJECT_MEMBER } from '@/graphql/misc/operations';
import { Project, ROLE_OPTIONS, UCN_DOMAINS, isValidUcnEmail } from './types';
import { useT } from '@/hooks/useT';

interface AddMemberPanelProps {
  project: Project;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export default function AddMemberPanel({
  project,
  onRefresh,
  onClose,
}: AddMemberPanelProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [isExternal, setIsExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useT();

  const handleInvite = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError(t('inviteMember.errorEmailEmpty'));
      return;
    }

    if (!isExternal && !isValidUcnEmail(trimmed)) {
      setError(`${t('inviteMember.errorEmailDomain')} ${UCN_DOMAINS.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError(t('inviteMember.errorEmailInvalid'));
      return;
    }

    setIsSending(true);
    try {
      await fetchGraphQL({
        query: ADD_PROJECT_MEMBER,
        variables: {
          input: {
            projectId: project.id,
            email: trimmed,
            role: isExternal ? 'EXTERNAL' : role,
          },
        },
      });
      setEmail('');
      setSuccess(t('inviteMember.inviteSuccess'));
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('inviteMember.errorSendInvite'));
    } finally {
      setIsSending(false);
    }
  };

  const ROLE_DESCRIPTIONS = [
    { key: 'leader', desc: t('inviteMember.roleLeaderDesc') },
    { key: 'supervisor', desc: t('inviteMember.roleSupervisorDesc') },
    { key: 'student', desc: t('inviteMember.roleStudentDesc') },
    { key: 'external', desc: t('inviteMember.roleExternalDesc') },
  ];

  const roleNames: Record<string, string> = {
    leader: t('projectRole.LEADER'),
    supervisor: t('projectRole.SUPERVISOR'),
    student: t('projectRole.STUDENT'),
    external: t('projectRole.EXTERNAL'),
  };

  const handleInviteAnother = () => {
    setSuccess(null);
    setEmail('');
    setRole('STUDENT');
    setIsExternal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full min-w-[320px] max-w-[400px] p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">{t('inviteMember.title')}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-secondary rounded-full hover:bg-surface-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">{t('inviteMember.successTitle')}</h3>
              <p className="text-sm text-text-muted mt-2">
                {t('inviteMember.successMessage')}
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface-primary border border-border-secondary rounded-lg hover:bg-surface-secondary transition-colors"
              >
                {t('modal.close')}
              </button>
              <button
                type="button"
                onClick={handleInviteAnother}
                className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
              >
                {t('inviteMember.inviteAnother')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
          <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isExternal}
              onChange={(e) => { setIsExternal(e.target.checked); setError(null); }}
              className="w-3.5 h-3.5 text-brand border-border-secondary rounded focus:ring-brand"
            />
            {t('inviteMember.externalCollaborator')}
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder={isExternal ? 'correo@externo.com' : 'correo@alumnos.ucn.cl'}
            className="w-full px-3 py-2 text-sm border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
          />

          {!isExternal && (
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full"
            >
              {ROLE_OPTIONS.filter((r) => r.value !== 'EXTERNAL').map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          )}

          {error && (
            <p className="text-xs text-red-500 flex gap-1 items-start">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
            </p>
          )}
          {success && <p className="text-xs text-green-600">{success}</p>}

          <button
            onClick={handleInvite}
            disabled={isSending}
            className="w-full py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isSending ? t('inviteMember.sending') : t('inviteMember.sendInvitation')}
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-border-primary space-y-3 overflow-y-auto max-h-48 pr-2">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">{t('inviteMember.availableRoles')}</h3>
          {ROLE_DESCRIPTIONS.map((r) => (
            <div key={r.key}>
              <p className="text-xs font-bold text-text-secondary">{roleNames[r.key]}</p>
              <p className="text-xs text-text-muted leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}