'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { COUNT_SEMESTERS, COUNT_SUBJECTS } from '@/graphql/subjects/operations';
import { COUNT_PROFESSORS_REGISTERED, COUNT_STUDENTS_REGISTERED } from '@/graphql/users/operations';
import { GET_PROJECTS_ACTIVE_COUNT } from '@/graphql/projects/operations';

export default function StatsSection() {
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [totalProfessors, setTotalProfessors] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [totalSemesters, setTotalSemesters] = useState<number | null>(null);
  const [totalSubjects, setTotalSubjects] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [d1, d2, d3, d4, d5] = await Promise.allSettled([
          fetchGraphQL({ query: GET_PROJECTS_ACTIVE_COUNT }),
          fetchGraphQL({ query: COUNT_PROFESSORS_REGISTERED }),
          fetchGraphQL({ query: COUNT_STUDENTS_REGISTERED }),
          fetchGraphQL({ query: COUNT_SEMESTERS }),
          fetchGraphQL({ query: COUNT_SUBJECTS }),
        ]);
        if (d1.status === 'fulfilled' && typeof d1.value?.projectsActiveCount === 'number')
          setTotalProjects(d1.value.projectsActiveCount);
        if (d2.status === 'fulfilled' && typeof d2.value?.countProfessorsRegistered === 'number')
          setTotalProfessors(d2.value.countProfessorsRegistered);
        if (d3.status === 'fulfilled' && typeof d3.value?.countStudentsRegistered === 'number')
          setTotalStudents(d3.value.countStudentsRegistered);
        if (d4.status === 'fulfilled' && typeof d4.value?.countSemesters === 'number')
          setTotalSemesters(d4.value.countSemesters);
        if (d5.status === 'fulfilled' && typeof d5.value?.countSubjects === 'number')
          setTotalSubjects(d5.value.countSubjects);
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el || animatedRef.current) return;

    const hasValues = statsView.some((s) => s.value !== null);
    if (!hasValues) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animatedRef.current) return;
        animatedRef.current = true;
        observer.disconnect();

        import('animejs').then((mod) => {
          const anime = mod.default ?? mod;

          const tl = anime.timeline({
            easing: 'easeOutExpo',
          });

          tl.add({
            targets: el.querySelectorAll('[data-stat]'),
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: anime.stagger(100),
          })
          .add({
            targets: el.querySelectorAll('[data-line]'),
            width: ['0px', '32px'],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100),
          }, '-=600');

          el.querySelectorAll<HTMLElement>('[data-count]').forEach((numEl) => {
            const target = parseInt(numEl.dataset.count ?? '0', 10);
            if (isNaN(target)) return;
            anime({
              targets: numEl,
              innerHTML: [0, target],
              round: 1,
              duration: 1800,
              easing: 'easeOutCubic',
            });
          });
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [totalProjects, totalProfessors, totalStudents, totalSemesters, totalSubjects]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        translateY: -4,
        scale: 1.02,
        duration: 300,
        easing: 'easeOutQuad',
      });
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    import('animejs').then((mod) => {
      const anime = mod.default ?? mod;
      anime({
        targets: target,
        translateY: 0,
        scale: 1,
        duration: 300,
        easing: 'easeOutQuad',
      });
    });
  };

  return (
    <div
      ref={containerRef}
      className="max-w-5xl mx-auto mt-10 md:mt-16 pt-8 pb-10 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-12 justify-center items-start"
    >
      {statsView.map((stat) => (
        <div
          key={stat.id}
          data-stat
          style={{ opacity: 0 }}
          className="flex flex-col items-center text-center px-2 cursor-default"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="text-3xl md:text-4xl font-extrabold text-ui-dark dark:text-white mb-2 tracking-tight transition-colors duration-300 hover:text-brand dark:hover:text-brand"
            data-count={stat.value ?? undefined}
          >
            {stat.value !== null ? stat.value : '-'}
          </div>
          
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-widest leading-relaxed h-8 flex items-start justify-center">
            {stat.label}
          </div>

          <div 
            data-line
            className="h-1 bg-brand rounded-full mt-2" 
            style={{ width: 0, opacity: 0 }} 
          />
        </div>
      ))}
    </div>
  );
}