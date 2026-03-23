'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_RECENT_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';

interface ProjectMember {
  id: string;
  avatarUrl: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  description: string;
  progress: number;
  members: ProjectMember[];
}

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchGraphQL({ query: GET_RECENT_PROJECTS });
        if (data?.recentProjects) {
          setProjects(data.recentProjects);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="bg-[#1e3a5f] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Proyectos de la EIC</h1>
          <p className="text-blue-200">Iniciativas académicas abiertas a la comunidad universitaria.</p>
        </div>
      </section>

      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 text-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['Todos', 'En curso', 'Iniciando', 'Finalizado'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === status 
                    ? 'bg-[#1e3a5f] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Ocurrió un error al cargar los proyectos. Inténtalo más tarde.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No hay proyectos públicos disponibles.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{project.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-3 ${
                    project.status === 'En curso' ? 'bg-green-100 text-green-700' : 
                    project.status === 'Finalizado' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{project.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center -space-x-2">
                  {project.members?.map((member) => (
                    <img 
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                      src={member.avatarUrl || `${AVATAR_FALLBACK_URL}${member.id}`}
                      alt="Avatar miembro"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#1e3a5f] text-white/80 py-6 text-center text-sm mt-auto">
        <p>PROJEIC &middot; Escuela de Ingeniería Coquimbo</p>
      </footer>
    </div>
  );
}
