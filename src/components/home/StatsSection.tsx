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
    <div className="max-w-5xl mx-auto mt-10 md:mt-16 pt-8 pb-10 border-t border-gray-100 flex flex-wrap justify-center gap-6 sm:gap-12">
      {statsView.map((stat) => (
        <div key={stat.id} className="text-center px-4">
          <div className="text-3xl md:text-4xl font-extrabold text-ui-dark mb-1 tracking-tight">
            {stat.value !== null ? stat.value : '-'}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-widest">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}