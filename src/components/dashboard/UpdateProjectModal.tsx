'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, BookOpen, CheckCircle2, Github, AlertCircle } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { UPDATE_PROJECT } from '@/graphql/misc/operations';
import { GET_ALL_SUBJECTS } from '@/graphql/subjects/operations';
import Input from '@/components/ui/Input';
import { useT } from '@/hooks/useT';

interface UpdateProjectModalProps {
  isOpen: boolean;
  project: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface PendingRepository {
  name: string;
  owner: string;
  repoName: string;
}

export default function UpdateProjectModal({ isOpen, project, onClose, onSuccess }: UpdateProjectModalProps) {
  const { t } = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isSoftwareProject, setIsSoftwareProject] = useState(false);

  const [repoName, setRepoName] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoProjectName, setRepoProjectName] = useState('');
  const [repoError, setRepoError] = useState<string | null>(null);
  const [pendingRepositories, setPendingRepositories] = useState<PendingRepository[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2596BE',
    status: 'ACTIVE',
    methodology: 'KANBAN',
    isPublic: false,
    isInstitutional: false,
    subjectId: '',
    mode: 'CLASSIC',
  });

  useEffect(() => {
    if (isOpen) {
      const loadSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
          const response = await fetchGraphQL({ query: GET_ALL_SUBJECTS });
          if (response?.subjects) {
            setSubjects(response.subjects);
          }
        } catch (err) {
          console.error("Error al cargar los ramos:", err);
        } finally {
          setIsLoadingSubjects(false);
        }
      };
      loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (project && isOpen) {
      const hasRepositories = project.repositories && project.repositories.length > 0;
      setIsSoftwareProject(hasRepositories);

      // 🔥 CORRECCIÓN: Uso estricto de Nullish Coalescing (??) para evitar inputs descontrolados
      setFormData({
        name: project.name ?? '',
        description: project.description ?? '',
        color: project.color ?? '#2596BE',
        status: project.status ?? 'ACTIVE',
        methodology: project.methodology === 'NONE' ? 'KANBAN' : (project.methodology ?? 'KANBAN'),
        isPublic: project.isPublic ?? false,
        isInstitutional: project.isInstitutional ?? false,
        subjectId: project.subject?.id ?? project.subjectId ?? '',
        mode: project.mode ?? 'CLASSIC',
      });

      if (hasRepositories) {
        setPendingRepositories(
          project.repositories.map((repo: any) => ({
            name: repo.name,
            owner: repo.owner,
            repoName: repo.repoName
          }))
        );
      } else {
        setPendingRepositories([]);
      }

      setError(null);
      setRepoError(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  // 🔥 CORRECCIÓN: Manejo simplificado del input para evitar que value sea undefined
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleModeChange = (mode: 'CLASSIC' | 'HYBRID') => {
    setFormData((prev) => ({ ...prev, mode }));
  };

  const handleAddRepository = () => {
    setRepoError(null);
    const tName = repoName.trim();
    const tOwner = repoOwner.trim();
    const tRepo = repoProjectName.trim();

    if (!tName || !tOwner || !tRepo) {
      setRepoError(t('updateProject.errorRepoFields'));
      return;
    }

    if (pendingRepositories.some(r => r.owner === tOwner && r.repoName === tRepo)) {
      setRepoError(t('updateProject.errorRepoDuplicate'));
      return;
    }

    setPendingRepositories(prev => [...prev, { name: tName, owner: tOwner, repoName: tRepo }]);
    setRepoName('');
    setRepoOwner('');
    setRepoProjectName('');
  };

  const handleRemoveRepository = (indexToRemove: number) => {
    setPendingRepositories(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.isInstitutional && !formData.subjectId) {
      setError(t('updateProject.errorInstitutional'));
      setIsSubmitting(false);
      return;
    }

    try {
      await fetchGraphQL({
        query: UPDATE_PROJECT,
        variables: {
          input: {
            id: project.id,
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color,
            status: formData.status,
            methodology: formData.mode === 'HYBRID' ? 'NONE' : formData.methodology,
            isPublic: formData.isPublic,
            isInstitutional: formData.isInstitutional,
            subjectId: formData.isInstitutional ? formData.subjectId : null,
            mode: formData.mode,
            repositories: isSoftwareProject ? pendingRepositories : [], 
          }
        }
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('updateProject.errorUnexpected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0">
          <h2 className="text-xl font-bold text-text-primary">{t('updateProject.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-text-primary hover:bg-surface-tertiary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="update-project-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* SELECTOR DE MODALIDAD */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-text-primary block">
              {t('createProject.managementMode')} <span className="text-brand">*</span>
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
                    <span className={`font-bold text-sm ${formData.mode === 'CLASSIC' ? 'text-brand' : 'text-text-secondary'}`}>{t('updateProject.modeClassic')}</span>
                  {formData.mode === 'CLASSIC' && <CheckCircle2 className="w-4 h-4 text-brand" />}
                </div>
                <span className="text-xs text-text-muted leading-relaxed">{t('updateProject.modeClassicDesc')}</span>
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
                    <span className={`font-bold text-sm ${formData.mode === 'HYBRID' ? 'text-brand' : 'text-text-secondary'}`}>{t('updateProject.modeHybrid')}</span>
                  {formData.mode === 'HYBRID' && <CheckCircle2 className="w-4 h-4 text-brand" />}
                </div>
                <span className="text-xs text-text-muted leading-relaxed">{t('updateProject.modeHybridDesc')}</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-border-primary"></div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
              {t('updateProject.projectName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              minLength={3}
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow bg-surface-primary text-text-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
              {t('updateProject.description')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow resize-none bg-surface-primary text-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">
                {t('updateProject.status')}
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-surface-primary text-text-primary"
              >
                <option value="STARTING">{t('updateProject.statusStarting')}</option>
                <option value="ACTIVE">{t('updateProject.statusActive')}</option>
                <option value="ON_HOLD">{t('updateProject.statusOnHold')}</option>
                <option value="COMPLETED">{t('updateProject.statusCompleted')}</option>
                <option value="CANCELLED">{t('updateProject.statusCancelled')}</option>
              </select>
            </div>

            {formData.mode === 'CLASSIC' && (
              <div>
                <label htmlFor="methodology" className="block text-sm font-medium text-text-secondary mb-1">
                  {t('updateProject.methodology')}
                </label>
                <select
                  id="methodology"
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-surface-primary text-text-primary"
                >
                  <option value="KANBAN">Kanban</option>
                  <option value="SCRUM">{t('updateProject.methodologyScrum')}</option>
                  <option value="SCRUMBAN">{t('updateProject.methodologyScrumban')}</option>
                </select>
              </div>
            )}
          </div>

          {/* SECCIÓN INSTITUCIONAL */}
          <div className="p-4 bg-surface-secondary border border-border-secondary rounded-xl space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isInstitutional"
                checked={formData.isInstitutional}
                onChange={handleChange}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand" /> {t('updateProject.institutional')}
                </span>
                <span className="text-xs text-text-muted">{t('updateProject.institutionalDesc')}</span>
              </div>
            </label>

            {formData.isInstitutional && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <label htmlFor="subjectId" className="block text-sm font-medium text-text-secondary mb-1">
                  {t('updateProject.selectSubject')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  disabled={isLoadingSubjects}
                  className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-surface-primary text-text-primary disabled:opacity-50"
                >
                  <option value="">{t('updateProject.selectSubjectPlaceholder')}</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.period})
                    </option>
                  ))}
                </select>
                {isLoadingSubjects && <p className="text-xs text-gray-400 mt-1">{t('updateProject.loadingSubjects')}</p>}
              </div>
            )}
          </div>

          {/* SECCIÓN: GITHUB / SOFTWARE MÚLTIPLE */}
          <div className="p-4 bg-surface-secondary border border-border-secondary rounded-xl space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSoftwareProject}
                onChange={(e) => setIsSoftwareProject(e.target.checked)}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-brand" /> {t('updateProject.softwareProject')}
                </span>
                <span className="text-xs text-text-muted">{t('updateProject.softwareProjectDesc')}</span>
              </div>
            </label>

            {isSoftwareProject && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="Etiqueta (Ej. Backend)"
                      className="w-full"
                    />
                    <Input
                      type="text"
                      value={repoOwner}
                      onChange={(e) => setRepoOwner(e.target.value)}
                      placeholder="Owner (Ej. fb)"
                      className="w-full"
                    />
                    <Input
                      type="text"
                      value={repoProjectName}
                      onChange={(e) => setRepoProjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRepository())}
                      placeholder="Repo (Ej. react)"
                      className="w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRepository}
                    className="w-full sm:w-auto self-end px-4 py-2 text-sm font-medium bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors"
                  >
                    {t('updateProject.addRepository')}
                  </button>
                </div>

                {repoError && (
                  <p className="text-xs text-red-500 flex gap-1 items-center">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {repoError}
                  </p>
                )}

                {pendingRepositories.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {pendingRepositories.map((repo, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-surface-primary rounded-lg border border-border-secondary text-sm shadow-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate text-text-primary font-bold">{repo.name}</span>
                          <span className="text-xs text-text-muted truncate">
                            ({repo.owner}/{repo.repoName})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRepository(index)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-secondary rounded-xl border border-border-secondary">
            <div className="flex items-center gap-3">
              <label htmlFor="color" className="block text-sm font-medium text-text-secondary">
                {t('updateProject.labelColor')}
              </label>
              <div className="relative">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden color-input appearance-none bg-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-medium text-text-secondary">{t('updateProject.makePublic')}</span>
            </label>
          </div>
        </form>

        <div className="p-4 border-t border-border-primary bg-surface-secondary flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            {t('modal.cancel')}
          </button>
          <button
            type="submit"
            form="update-project-form"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t('modal.saving')}
              </>
            ) : (
              t('updateProject.saveChanges')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}