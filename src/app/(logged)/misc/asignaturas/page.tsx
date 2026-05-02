'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_MY_TAUGHT_SUBJECTS } from '@/graphql/subjects/operations';
import { BookOpen, ChevronRight, Loader2, Calendar, Hash, FolderKanban } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  period: string;
}

export default function AsignaturasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetchGraphQL({ query: GET_MY_TAUGHT_SUBJECTS });
        const data = response.data || response;
        if (data && data.getMyTaughtSubjects) {
          setSubjects(data.getMyTaughtSubjects);
        }
      } catch (error) {
        console.error("Error cargando asignaturas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">Mis Asignaturas</h1>
        <p className="text-text-muted mt-2 max-w-2xl text-lg">
          Gestiona los catálogos financieros y revisa los proyectos asociados a los ramos que dictas en la escuela.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand" />
          <p>Cargando tus ramos...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-surface-primary border border-border-primary rounded-3xl p-12 text-center shadow-sm">
          <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-brand" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No tienes asignaturas</h3>
          <p className="text-text-muted max-w-md mx-auto">
            Actualmente no figuras como profesor en ninguna asignatura del sistema. Contacta con administración si esto es un error.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link 
              key={subject.id} 
              href={`/misc/asignaturas/${subject.id}`} // Al hacer clic, iremos a su gestor
              className="group block bg-surface-primary rounded-3xl border border-border-primary hover:border-brand/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
            >
              {/* Franja decorativa arriba */}
              <div className="h-2 w-full bg-gradient-to-r from-brand to-brand-hover"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-surface-secondary p-3 rounded-2xl text-text-primary group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="bg-surface-secondary px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    {subject.period || 'Semestre Actual'}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-text-primary mb-1 group-hover:text-brand transition-colors line-clamp-2">
                  {subject.name}
                </h2>
                
                <div className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
                  <Hash className="w-4 h-4 opacity-70" />
                  <span>Código: {subject.code || 'S/C'}</span>
                </div>

                {/* Pie de la tarjeta */}
                <div className="pt-4 border-t border-border-primary flex items-center justify-between mt-auto">
                  <span className="text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors flex items-center gap-2">
                    Gestionar Catálogo
                  </span>
                  <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all text-text-muted -rotate-45 group-hover:rotate-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}