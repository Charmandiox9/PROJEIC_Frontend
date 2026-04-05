import { Project } from '@/types/project';
import { useState } from 'react';
import { ROLE_OPTIONS, UCN_DOMAINS } from '@/constants/project-constants';
import { Trash2, Loader2, User, UserPlus, AlertCircle, Check } from 'lucide-react';
import Select from '@/components/ui/Select';
import MemberAvatar from '../../project-detail/MemberAvatar';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { ADD_PROJECT_MEMBER } from '@/graphql/misc/operations';

interface TabMiembrosProps {
  project: Project;
  isLeader: boolean;
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
  onRefresh: () => void;
}

function isValidUcnEmail(email: string): boolean {
  return UCN_DOMAINS.some((d) => email.toLowerCase().endsWith(d));
}

export default function TabMiembros({
  project,
  isLeader,
  onUpdateRole,
  onRemoveMember,
  onRefresh,
}: TabMiembrosProps) {
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
    if (!trimmed) { setError('Ingresa un correo.'); return; }

    if (!isExternal && !isValidUcnEmail(trimmed)) {
      setError(`El correo debe pertenecer a: ${UCN_DOMAINS.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Correo inválido.'); return; }

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

  const handleInviteAnother = () => {
    setSuccess(null);
    setEmail('');
    setRole('STUDENT');
    setIsExternal(false);
  };

  const ROLE_DESCRIPTIONS = [
    { role: 'Líder', desc: 'Gestiona el proyecto, invita miembros y tiene control total.' },
    { role: 'Supervisor', desc: 'Supervisa el avance del equipo. Rol típico para docentes.' },
    { role: 'Estudiante', desc: 'Participa activamente en las tareas del proyecto.' },
    { role: 'Externo', desc: 'Colaborador fuera de la institución con acceso limitado.' },
  ];

  const activeMembers = project.members.filter(m => m.status === 'ACTIVE');

  return (
    <div className={`grid grid-cols-1 ${isLeader ? 'lg:grid-cols-3' : ''} gap-6`}>
      <div className={`${isLeader ? 'md:col-span-2' : ''} bg-white rounded-xl border border-gray-100 p-6 space-y-4`}>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Integrantes ({activeMembers.length})</h3>
        {activeMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No hay miembros registrados.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activeMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <MemberAvatar member={m} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                      {m.user.name}
                    </p>
                    {m.status === 'PENDING' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded-md">
                        <Loader2 className="w-3 h-3 animate-spin" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={m.role}
                    onChange={(e) => onUpdateRole(m.id, e.target.value)}
                    disabled={!isLeader}
                    className="text-[11px] font-bold text-brand bg-brand/5 border-brand/20 w-auto"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                  {isLeader && (
                    <button
                      onClick={() => onRemoveMember(m.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Expulsar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isLeader && (
        <div className="space-y-4 min-w-0 overflow-hidden">
          {success ? (
            <div className="bg-white rounded-xl border border-green-200 p-8 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">¡Invitación enviada!</h3>
                <p className="text-sm text-gray-500 mt-1">El usuario ha sido invitado exitosamente.</p>
              </div>
              <button
                onClick={handleInviteAnother}
                className="mt-4 px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
              >
                Invitar a otro
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Agregar miembro</h3>

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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
              />

              {!isExternal && (
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
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

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3 overflow-y-auto max-h-64">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Roles disponibles</h3>
            {ROLE_DESCRIPTIONS.map((r) => (
              <div key={r.role}>
                <p className="text-xs font-bold text-gray-700">{r.role}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}