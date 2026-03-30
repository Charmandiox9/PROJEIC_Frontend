'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';

interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ProjectMember {
  id: string;
  role: string;
  user: PublicUser;
}

interface Project {
  id: string;
  name: string;
  status: string;
  description: string | null;
  color: string;
  members: ProjectMember[];
}

const STATUS_INITIAL_TAKE = 6;

export default function RecentProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await fetchGraphQL({
          query: GET_PUBLIC_PROJECTS,
          variables: { skip: 0, take: STATUS_INITIAL_TAKE },
        });
        if (data?.findAll?.items) {
          setProjects(data.findAll.items);
        }
      } catch {
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
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
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{project.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-3 ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                    'bg-brand-light text-brand'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{project.description}</p>
                <div className="flex -space-x-2">
                  {project.members?.map((member) => (
                    <img
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                      src={member.user.avatarUrl || `${AVATAR_FALLBACK_URL}${member.user.id}`}
                      alt={member.user.name}
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