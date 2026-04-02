'use client';

import { useState } from 'react';
import { X, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_PROJECT, ADD_PROJECT_MEMBER } from '@/graphql/misc/operations';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  status: string;
  methodology: string;
  isPublic: boolean;
}

interface PendingMember {
  email: string;
  role: string;
  isExternal: boolean;
}

const UCN_DOMAINS = ['@alumnos.ucn.cl', '@ucn.cl', '@ce.ucn.cl'];

function isValidUcnEmail(email: string): boolean {
  return UCN_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
}

const ROLE_OPTIONS = [
  { value: 'LEADER', label: 'Líder' },
  { value: 'STUDENT', label: 'Estudiante' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
];

const EXTERNAL_ROLE = { value: 'EXTERNAL', label: 'Externo' };

const INITIAL_FORM: ProjectFormData = {
  name: '',
  description: '',
  color: '#3B82F6',
  status: 'ACTIVE',
  methodology: 'KANBAN',
  isPublic: false,
};

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM);

  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('STUDENT');
  const [isExternal, setIsExternal] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleAddMember = () => {
    setMemberError(null);
    const trimmed = memberEmail.trim().toLowerCase();

    if (!trimmed) {
      setMemberError('Ingresa un correo electrónico.');
      return;
    }

    if (pendingMembers.some((m) => m.email === trimmed)) {
      setMemberError('Este correo ya fue agregado.');
      return;
    }

    if (isExternal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setMemberError('Ingresa un correo válido para el colaborador externo.');
        return;
      }
      setPendingMembers((prev) => [...prev, { email: trimmed, role: EXTERNAL_ROLE.value, isExternal: true }]);
    } else {
      if (!isValidUcnEmail(trimmed)) {
        setMemberError(`El correo debe pertenecer a: ${UCN_DOMAINS.join(', ')}`);
        return;
      }
      setPendingMembers((prev) => [...prev, { email: trimmed, role: memberRole, isExternal: false }]);
    }

    setMemberEmail('');
  };

  const handleRemoveMember = (email: string) => {
    setPendingMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchGraphQL({
        query: CREATE_PROJECT,
        variables: {
          input: {
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color,
            status: formData.status,
            methodology: formData.methodology,
            isPublic: formData.isPublic,
          },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message ?? 'Error al crear el proyecto');
      }

      const projectId: string = response.data?.createProject?.id ?? response.createProject?.id;

      if (projectId && pendingMembers.length > 0) {
        await Promise.allSettled(
          pendingMembers.map((m) =>
            fetchGraphQL({
              query: ADD_PROJECT_MEMBER,
              variables: {
                input: { projectId, email: m.email, role: m.role },
              },
            })
          )
        );
      }

      setFormData(INITIAL_FORM);
      setPendingMembers([]);
      setMemberEmail('');
      setMemberRole('STUDENT');
      setIsExternal(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = (member: PendingMember) => {
    if (member.isExternal) return 'Externo';
    return ROLE_OPTIONS.find((r) => r.value === member.role)?.label ?? member.role;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Crear nuevo proyecto</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Input
            id="name"
            label="Nombre del proyecto *"
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Plataforma de Trazabilidad UCN"
          />

          <Textarea
            id="description"
            label="Descripción"
            name="description"
            rows={3}
            maxLength={500}
            value={formData.description}
            onChange={handleChange}
            placeholder="Un breve resumen de la meta del proyecto..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="status"
              label="Estado inicial"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="STARTING">Iniciando</option>
              <option value="ACTIVE">Activo</option>
              <option value="ON_HOLD">En pausa</option>
            </Select>
            <Select
              id="methodology"
              label="Metodología"
              name="methodology"
              value={formData.methodology}
              onChange={handleChange}
            >
              <option value="KANBAN">Kanban</option>
              <option value="SCRUM">Scrum</option>
              <option value="SCRUMBAN">Scrumban</option>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label htmlFor="color" className="text-sm font-medium text-gray-700">
                Color de etiqueta:
              </label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden appearance-none bg-transparent"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-medium text-gray-700">Proyecto público</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">Miembros del equipo</h3>
              <span className="text-xs text-gray-400 font-normal">(opcional)</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isExternal}
                  onChange={(e) => {
                    setIsExternal(e.target.checked);
                    setMemberError(null);
                  }}
                  className="w-3.5 h-3.5 text-brand border-gray-300 rounded focus:ring-brand"
                />
                Colaborador externo
              </label>
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                placeholder={isExternal ? 'correo@externo.com' : 'correo@alumnos.ucn.cl'}
                className="flex-1 min-w-0"
              />
              {!isExternal && (
                <Select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-auto"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              )}
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3 py-2 text-sm font-medium bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors shrink-0"
              >
                Agregar
              </button>
            </div>

            {memberError && (
              <p className="text-xs text-red-500 flex gap-1 items-center">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {memberError}
              </p>
            )}

            {pendingMembers.length > 0 && (
              <ul className="space-y-1.5">
                {pendingMembers.map((m) => (
                  <li
                    key={m.email}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-gray-800 font-medium">{m.email}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${m.isExternal ? 'bg-gray-200 text-gray-600' : 'bg-brand/10 text-brand'}`}>
                        {roleLabel(m)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.email)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Proyecto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
