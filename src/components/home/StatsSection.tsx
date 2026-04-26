'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { COUNT_SEMESTERS, COUNT_SUBJECTS } from '@/graphql/subjects/operations';
import { COUNT_PROFESSORS_REGISTERED, COUNT_STUDENTS_REGISTERED } from '@/graphql/users/operations';
import { GET_PROJECTS_ACTIVE_COUNT } from '@/graphql/projects/operations';

interface StatsState {
  totalProjects: number | null;
  totalProfessors: number | null;
  totalStudents: number | null;
  totalSemesters: number | null;
  totalSubjects: number | null;
}

const STATS_VIEW = [
  { id: 2, label: 'Docentes supervisores', value: null as null },
  { id: 3, label: 'Estudiantes registrados', value: null as null },
  { id: 4, label: 'Semestres en uso', value: null as number | null },
];

export default function StatsSection() {
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [totalProfessors, setTotalProfessors] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [totalSemesters, setTotalSemesters] = useState<number | null>(null);
  const [totalSubjects, setTotalSubjects] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGraphQL({
          query: GET_PROJECTS_ACTIVE_COUNT,
        });
        if (typeof data?.projectsActiveCount === 'number') {
          setTotalProjects(data.projectsActiveCount);
        }
        const data2 = await fetchGraphQL({
          query: COUNT_PROFESSORS_REGISTERED,
        });
        if (typeof data2?.countProfessorsRegistered === 'number') {
          setTotalProfessors(data2.countProfessorsRegistered);
        }
        const data3 = await fetchGraphQL({
          query: COUNT_STUDENTS_REGISTERED,
        });
        if (typeof data3?.countStudentsRegistered === 'number') {
          setTotalStudents(data3.countStudentsRegistered);
        }
        const data4 = await fetchGraphQL({
          query: COUNT_SEMESTERS,
        });
        if (typeof data4?.countSemesters === 'number') {
          setTotalSemesters(data4.countSemesters);
        }
        const data5 = await fetchGraphQL({
          query: COUNT_SUBJECTS,
        });
        if (typeof data5?.countSubjects === 'number') {
          setTotalSubjects(data5.countSubjects);
        }
      } catch {
        console.error('Error al cargar los datos');
      }
    }
    loadData();
  }, []);

  const statsView = [
    { id: 1, label: 'Proyectos activos', value: totalProjects },
    { id: 2, label: 'Docentes supervisores', value: totalProfessors },
    { id: 3, label: 'Estudiantes registrados', value: totalStudents },
    { id: 4, label: 'Semestres en uso', value: totalSemesters },
    { id: 5, label: 'Asignaturas', value: totalSubjects },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-16 pt-8 pb-10 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-12 justify-center items-center">
      {statsView.map((stat) => (
        <div key={stat.id} className="text-center px-4">
          <div className="text-3xl md:text-4xl font-extrabold text-ui-dark dark:text-white mb-1 tracking-tight">
            {stat.value !== null ? stat.value : '-'}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-widest">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}