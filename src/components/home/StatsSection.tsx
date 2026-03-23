'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PLATFORM_STATS } from '@/graphql/misc/operations';

interface PlatformStats {
  activeProjects: number | string;
  supervisors: number | string;
  students: number | string;
  semesters: number | string;
}

export default function StatsSection() {
  const [stats, setStats] = useState<PlatformStats>({
    activeProjects: '-',
    supervisors: '-',
    students: '-',
    semesters: '-'
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchGraphQL({ query: GET_PLATFORM_STATS });
        if (data?.platformStats) {
          setStats({
            activeProjects: data.platformStats.activeProjects,
            supervisors: data.platformStats.supervisors,
            students: data.platformStats.students,
            semesters: data.platformStats.semesters
          });
        }
      } catch (error) {
        // En caso de error se retiene el estado con los guiones
      }
    }
    loadStats();
  }, []);

  const statsView = [
    { id: 1, label: 'Proyectos activos', value: stats.activeProjects },
    { id: 2, label: 'Docentes supervisores', value: stats.supervisors },
    { id: 3, label: 'Estudiantes registrados', value: stats.students },
    { id: 4, label: 'Semestres en uso', value: stats.semesters },
  ];

  return (
    <section className="bg-white border-b border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {statsView.map((stat) => (
          <div key={stat.id} className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}