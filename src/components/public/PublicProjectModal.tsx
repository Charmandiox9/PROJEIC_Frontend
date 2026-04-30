'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_BY_ID } from '@/graphql/misc/operations';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/hooks/useLocale';
import { getLocalizedText } from '@/utils/i18n';
import {
  Calendar,
  Layout,
  User,
  Loader2,
  Globe,
  Lock,
  X,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  LEADER: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  SUPERVISOR: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  EXTERNAL: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
};

interface PublicProjectModalProps {
  isOpen: boolean;
  projectId: string | null;
  onClose: () => void;
}

export default function PublicProjectModal({ isOpen, projectId, onClose }: PublicProjectModalProps) {
  const { t, tDynamic } = useT();
  const { locale } = useLocale();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      const loadProject = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await fetchGraphQL({
            query: GET_PROJECT_BY_ID,
            variables: { id: projectId }
          });
          if (data?.findOne) {
            setProject(data.findOne);
          } else {
            setError(t('publicProjectModal.notFound'));
          }
        } catch (err: any) {
          setError(t('publicProjectModal.errorLoad'));
        } finally {
          setIsLoading(false);
        }
      };
      loadProject();
    } else {
      setProject(null);
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">

        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white hover:bg-black/40 backdrop-blur-md rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="flex-1 min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : error || !project ? (
          <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <p className="text-gray-500 font-medium">{error || t('publicProjectModal.notAvailable')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            {/* Color Banner */}
            <div className="h-40 w-full shrink-0" style={{ backgroundColor: project.color || 'var(--color-brand)' }}></div>

            <div className="p-6 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight break-words">{getLocalizedText(project.name, locale as 'es' | 'en' | 'pt')}</h1>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-3xl whitespace-pre-wrap">
                    {getLocalizedText(project.description, locale as 'es' | 'en' | 'pt') || t('publicProjectModal.noDescription')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Lado Izquierdo: Ficha Técnica */}
                <div className="md:col-span-1 space-y-8">
                  <div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t('publicProjectModal.fichaTecnica')}</h2>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('publicProjectModal.startedOn')}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(project.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                          <Layout className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('publicProjectModal.methodology')}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{project.mode === 'HYBRID' ? t('publicProjectModal.methodologyNative') : project.methodology.toLowerCase()}</p>
                        </div>
                      </li>

                      {/* Información Institucional */}
                      {project.isInstitutional && project.subject && (
                        <>
                          <li className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">{t('publicProjectModal.subject')}</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {project.subject.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{t('publicProjectModal.period')} {project.subject.period}</p>
                            </div>
                          </li>

                          {project.subject.professors && project.subject.professors.length > 0 && (
                            <li className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">{t('publicProjectModal.professorGuide')}</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                                  {project.subject.professors.map((p: any) => p.name).join(', ')}
                                </p>
                              </div>
                            </li>
                          )}
                        </>
                      )}

                      <li className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                          {project.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('publicProjectModal.access')}</p>
                          <p className={`text-sm font-semibold ${project.isPublic ? 'text-green-600' : 'text-gray-700'}`}>
                            {project.isPublic ? t('publicProjectModal.publicOpen') : t('publicProjectModal.privateRestricted')}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Lado Derecho: Participantes */}
                <div className="md:col-span-2 space-y-6">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t('publicProjectModal.participants')}</h2>

                  {project.members && project.members.filter((m: any) => m.status === 'ACTIVE').length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.members.filter((m: any) => m.status === 'ACTIVE').map((member: any) => (
                        <div key={member.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-brand/30 transition-colors min-w-0">
                          <div className="flex items-center gap-4 min-w-0 w-full">
                            {member.user.avatarUrl ? (
                              <img src={member.user.avatarUrl} alt={member.user.name} className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm shrink-0 object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-brand bg-opacity-10 text-brand flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm shrink-0">
                                {member.user.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate" title={member.user.name}>{member.user.name}</p>
                              <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300'}`}>
                                {tDynamic(`projectRole.${member.role}`)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <User className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">{t('publicProjectModal.noParticipants')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}