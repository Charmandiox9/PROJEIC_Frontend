'use client';

import { useEffect, useState } from 'react';
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

export default function RecentProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await fetchGraphQL({ query: GET_RECENT_PROJECTS });
        if (data?.recentProjects) setProjects(data.recentProjects);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Proyectos recientes de la EIC</h2>
          <p className="text-gray-600">Iniciativas visibles de la comunidad</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error || projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aún no hay proyectos recientes para mostrar.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{project.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'En curso' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
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
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {project.members?.map((member) => (
                    <img 
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                      src={member.avatarUrl || `${AVATAR_FALLBACK_URL}${member.id}`}
                      alt="Avatar"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}