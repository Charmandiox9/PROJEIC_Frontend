import { Project } from '@/types/project';
import { useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { ADD_PROJECT_MEMBER } from '@/graphql/misc/operations';
import { AlertCircle, Loader2, UserPlus, X } from 'lucide-react';
import { UCN_DOMAINS, ROLE_OPTIONS } from '../../project-detail/types';
import Select from '@/components/ui/Select';

interface InviteMemberFormProps {
  project: Project;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}

function isValidUcnEmail(email: string): boolean {
  return UCN_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

export default function InviteMemberForm({ project, onUpdateRole, onRemoveMember, onRefresh, onClose }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [isExternal, setIsExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Ingresa un correo.');
      return;
    }

    if (!isExternal && !isValidUcnEmail(trimmed)) {
      setError(`El correo debe pertenecer a: ${UCN_DOMAINS.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Correo inválido.');
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
      setSuccess('Invitación enviada correctamente.');
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la invitación.');
    } finally {
      setIsSending(false);
    }
  };

  const ROLE_DESCRIPTIONS = [
    { role: 'Líder', desc: 'Gestiona el proyecto, invita miembros y tiene control total.' },
    { role: 'Supervisor', desc: 'Supervisa el avance del equipo.' },
    { role: 'Estudiante', desc: 'Participa activamente en las tareas del proyecto.' },
    { role: 'Externo', desc: 'Colaborador con acceso limitado.' },
  ];

  const handleInviteAnother = () => {
    setSuccess(null);
    setEmail('');
    setRole('STUDENT');
    setIsExternal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full min-w-[320px] max-w-[400px] p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Agregar al equipo</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">¡Invitación enviada!</h3>
              <p className="text-sm text-gray-500 mt-2">
                El usuario ha sido invitado al proyecto exitosamente.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar ventana
              </button>
              <button
                type="button"
                onClick={handleInviteAnother}
                className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
              >
                Invitar a otro
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isExternal}
                onChange={(e) => { setIsExternal(e.target.checked); setError(null); }}
                className="w-3.5 h-3.5 text-brand border-gray-300 rounded focus:ring-brand"
              />
              Colaborador externo
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              placeholder={isExternal ? 'correo@externo.com' : 'correo@alumnos.ucn.cl'}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
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
              {isSending ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 overflow-y-auto max-h-48 pr-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Roles disponibles</h3>
          {ROLE_DESCRIPTIONS.map((r) => (
            <div key={r.role}>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{r.role}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}