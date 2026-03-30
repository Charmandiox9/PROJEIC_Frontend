'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PUBLIC_PROJECTS } from '@/graphql/misc/operations';

const STATIC_SEMESTERS = 1;

interface StatsState {
  totalProjects: number | null;
}

const STATS_VIEW = [
  { id: 2, label: 'Docentes supervisores', value: null as null },
  { id: 3, label: 'Estudiantes registrados', value: null as null },
  { id: 4, label: 'Semestres en uso', value: STATIC_SEMESTERS as number | null },
];

export default function StatsSection() {
  const [totalProjects, setTotalProjects] = useState<number | null>(null);

  useEffect(() => {
    async function loadProjectCount() {
      try {
        const data = await fetchGraphQL({
          query: GET_PUBLIC_PROJECTS,
          variables: { skip: 0, take: 1 },
        });
        if (typeof data?.findAll?.total === 'number') {
          setTotalProjects(data.findAll.total);
        }
      } catch {
        // Retain dash on error
      }
    }
    loadProjectCount();
  }, []);

  const statsView = [
    { id: 1, label: 'Proyectos activos', value: totalProjects },
    ...STATS_VIEW,
  ];

  return (
    <section className="bg-white border-b border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {statsView.map((stat) => (
          <div key={stat.id} className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stat.value !== null ? stat.value : '-'}
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}