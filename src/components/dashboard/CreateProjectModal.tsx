'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_PROJECT, ADD_PROJECT_MEMBER, GET_SUBJECTS } from '@/graphql/misc/operations';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Subject } from '@/types/project';

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
  subjectId: string;
  mode: string;
  isInstitutional: boolean;
  professorId: string;
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
  color: '#2596BE',
  status: 'ACTIVE',
  methodology: 'KANBAN',
  isPublic: false,
  subjectId: '',
  mode: 'CLASSIC',
  isInstitutional: false,
  professorId: '',
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

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingSubjects(true);
      fetchGraphQL({ query: GET_SUBJECTS })
        .then((res) => {
          if (res?.subjects) {
            setSubjects(res.subjects as Subject[]);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSubjects(false));
    } else {
      setFormData(INITIAL_FORM);
      setPendingMembers([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleModeChange = (mode: 'CLASSIC' | 'HYBRID') => {
    setFormData((prev) => ({ ...prev, mode }));
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
            mode: formData.mode,
            isInstitutional: formData.isInstitutional,
            subjectId: formData.subjectId || undefined,
            professorId: formData.isInstitutional ? formData.professorId : undefined,
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
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-surface-primary shrink-0">
          <h2 className="text-xl font-bold text-text-primary">Crear nuevo proyecto</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-text-primary hover:bg-surface-tertiary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <form id="create-project-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* 🔥 NUEVO: Selector de Modalidad */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-primary block">
                Modalidad de Gestión <span className="text-brand">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleModeChange('CLASSIC')}
                  className={`relative p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col gap-1 ${formData.mode === 'CLASSIC'
                    ? 'border-brand bg-brand/5 shadow-sm'
                    : 'border-border-primary hover:border-border-secondary bg-surface-primary'
                    }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-bold text-sm ${formData.mode === 'CLASSIC' ? 'text-brand' : 'text-text-secondary'}`}>Modo Clasico</span>
                    {formData.mode === 'CLASSIC' && <CheckCircle2 className="w-4 h-4 text-brand" />}
                  </div>
                  <span className="text-xs text-text-muted leading-relaxed">
                    Basado en progreso de Tareas y metodologías ágiles (Scrum, Kanban).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('HYBRID')}
                  className={`relative p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col gap-1 ${formData.mode === 'HYBRID'
                    ? 'border-brand bg-brand/5 shadow-sm'
                    : 'border-border-primary hover:border-border-secondary bg-surface-primary'
                    }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-bold text-sm ${formData.mode === 'HYBRID' ? 'text-brand' : 'text-text-secondary'}`}>Projeic Native (EIC)</span>
                    {formData.mode === 'HYBRID' && <CheckCircle2 className="w-4 h-4 text-brand" />}
                  </div>
                  <span className="text-xs text-text-muted leading-relaxed">
                    Orientado a Resultados Esperados y validación por carga de Evidencias.
                  </span>
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-border-primary"></div>

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

            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                name="isInstitutional"
                checked={formData.isInstitutional}
                onChange={(e) => {
                  handleChange(e);
                  // Si desmarcan, limpiamos los campos
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, subjectId: '', professorId: '' }));
                  }
                }}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-semibold text-text-primary">Este es un proyecto de Asignatura (Institucional)</span>
            </label>

            {formData.isInstitutional && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-brand/5 border border-brand/10 rounded-xl animate-in fade-in slide-in-from-top-2">
                <Select
                  id="subjectId"
                  label="Asignatura *"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => {
                    handleChange(e);
                    // Reseteamos el profesor si cambian de ramo
                    setFormData(prev => ({ ...prev, professorId: '' }));
                  }}
                  disabled={isLoadingSubjects}
                  required={formData.isInstitutional}
                >
                  <option value="">Selecciona un ramo</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} {subject.code ? `(${subject.code})` : ''}
                    </option>
                  ))}
                </Select>

                <Select
                  id="professorId"
                  label="Profesor a cargo *"
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  disabled={!formData.subjectId}
                  required={formData.isInstitutional}
                >
                  <option value="">Selecciona un profesor</option>
                  {/* Buscamos el ramo seleccionado y mapeamos sus profesores */}
                  {subjects
                    .find(s => s.id === formData.subjectId)
                    ?.professors?.map((prof: any) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name}
                      </option>
                    ))}
                </Select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                id="status"
                label="Estado"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Activo</option>
                <option value="ON_HOLD">En pausa</option>
              </Select>

              {/* Ocultamos la metodología si estamos en Modo Híbrido */}
              {formData.mode === 'CLASSIC' && (
                <Select
                  id="methodology"
                  label="Metodología"
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleChange}
                >
                  <option value="KANBAN">Kanban</option>
                  <option value="SCRUM" disabled>Scrum (Próximamente)</option>
                  <option value="SCRUMBAN">Scrumban (Próximamente)</option>
                </Select>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-secondary rounded-xl border border-border-secondary">
              <div className="flex items-center gap-3">
                <label htmlFor="color" className="text-sm font-medium text-text-secondary">
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
                <span className="text-sm font-medium text-text-secondary">Hacer proyecto publico</span>
              </label>
            </div>

            <div className="pt-2 border-t border-border-primary space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-text-primary">Miembros del equipo</h3>
                <span className="text-xs text-gray-400 font-normal">(opcional)</span>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none w-fit">
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

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                  placeholder={isExternal ? 'correo@externo.com' : 'correo@alumnos.ucn.cl'}
                  className="flex-1 min-w-0"
                />
                <div className="flex gap-2">
                  {!isExternal && (
                    <Select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full sm:w-auto"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </Select>
                  )}
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-4 py-2 text-sm font-medium bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors shrink-0"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {memberError && (
                <p className="text-xs text-red-500 flex gap-1 items-center">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {memberError}
                </p>
              )}

              {pendingMembers.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {pendingMembers.map((m) => (
                    <li
                      key={m.email}
                      className="flex items-center justify-between px-3 py-2 bg-surface-primary rounded-lg border border-border-secondary text-sm shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-text-primary font-medium">{m.email}</span>
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
          </form>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-border-primary bg-surface-secondary flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-project-form"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
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
      </div>
    </div>
  );
}