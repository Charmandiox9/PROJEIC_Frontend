'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_BY_ID } from '@/graphql/misc/operations';
import { ArrowLeft, Calendar, Layout, User, Loader2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PublicProjectDetailPage() {
  const { id } = useParams();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await fetchGraphQL({
        query: GET_PROJECT_BY_ID,
        variables: { id: Array.isArray(id) ? id[0] : id }
      });
      if (data?.findOne) {
        setProject(data.findOne);
      } else {
        setError('Proyecto no encontrado.');
      }
    } catch (err: any) {
      setError('Error al cargar la información del proyecto.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 font-medium">{error || 'Proyecto no disponible'}</p>
        <Link href="/" className="text-brand hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
      </div>
    );
  }

  const creationDate = new Date(project.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/50">
          {/* Color Banner */}
          <div className="h-32 w-full" style={{ backgroundColor: project.color || 'var(--color-brand)' }}></div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                  {project.description || 'Este proyecto no cuenta con una descripción pública detallada en este momento. Forma parte del ecosistema de desarrollo de PROJEIC.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-8">
                <div>
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ficha Técnica</h2>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Iniciado el</p>
                        <p className="text-sm font-semibold text-gray-900">{creationDate}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Metodología</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{project.mode === 'HYBRID' ? 'Orientado a Resultados' : project.methodology}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        {project.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Acceso</p>
                        <p className={`text-sm font-semibold ${project.isPublic ? 'text-green-600' : 'text-gray-700'}`}>
                          {project.isPublic ? 'Público Abierto' : 'Privado Restringido'}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Participantes del Proyecto</h2>
                
                {project.members && project.members.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.members.map((member: any) => (
                      <div key={member.id} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand/30 transition-colors">
                        <div className="flex items-center gap-4">
                          {member.user.avatarUrl ? (
                            <img src={member.user.avatarUrl} alt={member.user.name} className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-brand bg-opacity-10 text-brand flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm">
                              {member.user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate">{member.user.name}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gray-200/50 text-gray-600">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <User className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Aún no hay participantes públicos registrados.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
