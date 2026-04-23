'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Loader2, ShieldCheck, Clock, FileCheck, AlertTriangle } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_EXPECTED_RESULTS } from '@/graphql/hybrid/operations';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import CreateResultModal from '../hybrid/CreateResultModal';
import UpdateResultStatusModal from '../hybrid/UpdateResultStatusModal';
import ResultDetailsModal from '../hybrid/ResultDetailsModal';

interface TabResultadosProps {
  project: any;
  isLeader: boolean;
}

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  NOT_STARTED: { label: 'Iniciado (Sin avance)', color: 'bg-gray-100 text-gray-600' },
  STARTED: { label: 'En Progreso (10%)', color: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'En Revisión (50%)', color: 'bg-yellow-100 text-yellow-700' },
  VALIDATED: { label: 'Testeado (80%)', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completado Real (100%)', color: 'bg-green-100 text-green-700' },
};

export default function TabResultados({ project, isLeader }: TabResultadosProps) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResultToUpdate, setSelectedResultToUpdate] = useState<any>(null);
  const [selectedResultDetails, setSelectedResultDetails] = useState<any>(null);

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchGraphQL({
        query: GET_EXPECTED_RESULTS,
        variables: { projectId: project.id }
      });
      if (data?.expectedResultsByProject) {
        setResults(data.expectedResultsByProject);
      }
    } catch (error) {
      console.error("Error cargando resultados", error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER DE LA PESTAÑA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand" />
            Panel de Resultados Esperados
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona el progreso mediante hitos y carga de evidencias obligatorias.
          </p>
        </div>
        {isLeader && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Nuevo Resultado
          </button>
        )}
      </div>

      {/* LISTA DE RESULTADOS */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
          <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay resultados esperados definidos.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Comienza creando el primer objetivo de valor.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((result) => {
            const hasEvidence = result.evidences && result.evidences.length > 0;
            const progressColor = result.progress === 100 ? 'bg-green-500' : 'bg-brand';

            return (
              <div
                key={result.id}
                onClick={() => setSelectedResultDetails(result)} // 🔥 1. Abre el modal de detalles
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-brand/40 transition-all flex flex-col h-full cursor-pointer"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">{result.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${STATUS_MAP[result.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_MAP[result.status]?.label || result.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
                  {result.description || 'Sin criterios de aceptación definidos.'}
                </p>

                {/* Motor de Progreso (Barra) */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">Progreso Validado</span>
                    <span className={result.progress === 100 ? 'text-green-600' : 'text-brand'}>{result.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 rounded-full ${progressColor}`} style={{ width: `${result.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700 mt-auto">
                  {/* Responsable */}
                  <div className="flex items-center gap-2">
                    <img
                      src={result.owner.avatarUrl || `${AVATAR_FALLBACK_URL}${result.owner.userId}`}
                      alt={result.owner.name}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-none">{result.owner.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">Responsable</p>
                    </div>
                  </div>

                  {/* Estado de Evidencias */}
                  <div className="flex items-center gap-2">
                    {hasEvidence ? (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        <ShieldCheck className="w-3.5 h-3.5" /> Evidencia OK
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5" /> Sin Evidencia
                      </div>
                    )}

                    {/* Botón para abrir modal de avance */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResultToUpdate(result);
                      }}
                      className="p-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-600 transition-colors"
                      title="Actualizar estado y subir evidencia"
                    >
                      <FileCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateResultModal
        isOpen={isCreateModalOpen}
        projectId={project.id}
        members={project.members}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadResults}
      />

      <UpdateResultStatusModal
        isOpen={!!selectedResultToUpdate}
        result={selectedResultToUpdate}
        onClose={() => setSelectedResultToUpdate(null)}
        onSuccess={() => {
          setSelectedResultToUpdate(null);
          loadResults();
        }}
      />

      <ResultDetailsModal
        isOpen={!!selectedResultDetails}
        result={selectedResultDetails}
        onClose={() => setSelectedResultDetails(null)}
        onRefresh={loadResults}
      />
    </div>
  );
}