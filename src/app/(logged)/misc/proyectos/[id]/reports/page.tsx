'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_FULL_PROJECT_REPORT } from '@/graphql/misc/operations'; 
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { Loader2, Printer, BookOpen, Calendar, Info, User } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function ProjectReportPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useT();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const projectId = Array.isArray(id) ? id[0] : id;
  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? ptBR : es;

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const result = await fetchGraphQL({
          query: GET_FULL_PROJECT_REPORT,
          variables: { id: projectId, projectId: projectId }
        });
        setData(result);
      } catch (error) {
        console.error("Error loading report", error);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, [projectId]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  if (!data || !data.findOne) return <div className="p-10">{t('projectReport.noData')}</div>;

  const project = data.findOne;
  const metrics = data.projectMetrics;

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto print:p-0 print:max-w-full">
      
      {/* Botón de impresión (Oculto al imprimir) */}
      <div className="fixed top-4 right-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg shadow-xl hover:bg-black transition-all font-bold"
        >
          <Printer className="w-4 h-4" /> {t('projectReport.exportPdf')}
        </button>
      </div>

      {/* PORTADA */}
      <div className="break-after-page min-h-[90vh] flex flex-col justify-center border-l-8 border-blue-600 pl-12">
        <div className="space-y-4">
          <p className="text-blue-600 font-bold tracking-[0.2em] uppercase text-sm">{t('projectReport.title')}</p>
          <h1 className="text-6xl font-black text-gray-900 leading-tight">{project.name}</h1>
          
          {project.subject && (
            <div className="flex items-center gap-2 text-2xl text-gray-600 font-medium">
              <BookOpen className="w-6 h-6" />
              <span>{project.subject.name}</span>
            </div>
          )}

          {project.subject && (
            <div className="flex items-center gap-2 text-2xl text-gray-600 font-medium">
                <Calendar className="w-6 h-6" />
                <span>{project.subject.period}</span>
            </div>
          )}

          {project.subject && project.subject.professors && project.subject.professors.length > 0 && (
            <div className="flex items-center gap-2 text-2xl text-gray-600 font-medium">
                <User className="w-6 h-6" />
                <span>{project.subject.professors.map((p: any) => p.name).join(', ')}</span>
            </div>
          )}

          <div className="pt-12 space-y-2 text-gray-500">
            <p className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4" /> 
              {t('projectReport.createdAt')} {format(new Date(project.createdAt), "dd 'de' MMMM, yyyy", { locale: dateLocale })}
            </p>
            <p className="font-medium">{t('projectReport.institution')}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: DETALLES GENERALES */}
      <div className="break-after-page pt-10">
        <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6" /> {t('projectReport.section1')}
        </h2>
        
        <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-10">
          <div className="col-span-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('projectReport.description')}</p>
            <p className="text-gray-800 leading-relaxed text-justify">
              {project.description || t('projectReport.noDescription')}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('projectReport.methodology')}</p>
            <p className="font-semibold text-lg">{project.methodology} ({project.mode})</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('projectReport.healthStatus')}</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${metrics.projectRisk?.level === 'HIGH' ? 'bg-red-500' : 'bg-green-500'}`} />
              <p className="font-semibold text-lg">{metrics.projectRisk?.level || t('projectReport.stable')}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-6 mt-12">{t('projectReport.section2')}</h2>
        <div className="grid grid-cols-1 gap-4">
          {project.members.map((member: any) => (
            // 🔥 SOLUCIÓN AL ERROR DE KEY: Usamos el memberId o userId
            <div key={member.id || member.user.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">{member.user.name}</p>
                <p className="text-xs text-gray-500 uppercase font-medium">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: MÉTRICAS Y ANALÍTICA */}
      <div className="pt-10">
        <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-6">{t('projectReport.section3')}</h2>
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl mb-8">
          <p className="text-blue-800 font-bold mb-2">{t('projectReport.predictiveConclusion')}</p>
          <p className="text-blue-900 italic">"{metrics.projectRisk?.message}"</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="border p-4 rounded-lg text-center">
            <p className="text-3xl font-black">{metrics.totalTasks}</p>
            <p className="text-xs text-gray-500 uppercase font-bold">{t('projectReport.totalTasks')}</p>
          </div>
          <div className="border p-4 rounded-lg text-center bg-green-50 border-green-200">
            <p className="text-3xl font-black text-green-700">{metrics.completedTasks}</p>
            <p className="text-xs text-green-600 uppercase font-bold">{t('projectReport.completedTasks')}</p>
          </div>
          <div className="border p-4 rounded-lg text-center bg-red-50 border-red-200">
            <p className="text-3xl font-black text-red-700">{metrics.overdueTasksCount}</p>
            <p className="text-xs text-red-600 uppercase font-bold">{t('projectReport.overdueTasks')}</p>
          </div>
        </div>

        {/* Podrías agregar aquí una lista de los tableros y cuántas tareas tiene cada uno */}
      </div>

    </div>
  );
}