'use client';

import { useState, useEffect } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_SPRINTS_BY_PROJECT, COMPLETE_SPRINT } from '@/graphql/sprints/operations';
import ScrumPlanning from '../scrum/ScrumPlanning';
import KanbanBoard from '../kanban/KanbanBoard';
import SprintTimeline from '../scrum/SprintTimeline';
import BurndownChart from '../scrum/BurndownChart';
import { Loader2, Layout, History, LineChart } from 'lucide-react';

export default function ScrumbanBoard({ projectId, members, userRole }: any) {
  const [allSprints, setAllSprints] = useState<any[]>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentView, setCurrentView] = useState<'board' | 'timeline' | 'burndown'>('board');

  const loadSprints = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const res = await fetchGraphQL({
        query: GET_SPRINTS_BY_PROJECT,
        variables: { projectId }
      });

      const sprints = res.sprintsByProject || [];
      setAllSprints(sprints);

      const active = sprints.find((s: any) => s.status === 'ACTIVE');
      setActiveSprint(active || null);
    } catch (e) {
      console.error("Error en ScrumBoard:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSprints(); }, [projectId]);

  const handleCompleteSprint = async () => {
    if (!confirm('¿Estás seguro de finalizar este Sprint?')) return;
    try {
      await fetchGraphQL({ query: COMPLETE_SPRINT, variables: { id: activeSprint.id } });
      loadSprints();
    } catch (error) {
      console.error("Error finalizando sprint:", error);
    }
  };

  if (isLoading || !projectId) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* SUB-MENÚ ESTILO JIRA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 w-full sm:w-fit">
        <button
          onClick={() => setCurrentView('board')}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentView === 'board'
            ? 'bg-white dark:bg-gray-700 text-brand shadow-sm border border-gray-200/50 dark:border-gray-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <Layout className="w-4 h-4 shrink-0" />
          <span className="truncate">{activeSprint ? 'Sprint Activo' : 'Planificación'}</span>
        </button>
        <button
          onClick={() => setCurrentView('timeline')}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentView === 'timeline'
            ? 'bg-white dark:bg-gray-700 text-brand shadow-sm border border-gray-200/50 dark:border-gray-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span className="truncate">Cronograma / Historial</span>
        </button>
        <button
          onClick={() => setCurrentView('burndown')}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentView === 'burndown'
            ? 'bg-white dark:bg-gray-700 text-brand shadow-sm border border-gray-200/50 dark:border-gray-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <LineChart className="w-4 h-4 shrink-0" />
          <span className="truncate">Burndown</span>
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LA VISTA */}
      {currentView === 'timeline' ? (
        <SprintTimeline
          sprints={allSprints}
          projectId={projectId}
          members={members || []}
        />
      ) : currentView === 'burndown' ? (
        activeSprint ? (
          <div className="space-y-4 animate-in fade-in">
            <BurndownChart sprintId={activeSprint.id} />
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No hay sprint activo para mostrar el burndown.
          </div>
        )
      ) : activeSprint ? (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-brand/5 border border-brand/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm w-full relative">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="font-bold text-brand flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {activeSprint.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{activeSprint.goal || 'Sin meta definida'}</p>
            </div>
            <button
              onClick={handleCompleteSprint}
              className="text-xs font-bold text-red-600 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all shadow-sm shrink-0 sm:w-auto w-full"
            >
              Finalizar Sprint
            </button>
          </div>

          <KanbanBoard
            projectId={projectId}
            members={members || []}
            userRole={userRole}
            sprintId={activeSprint.id}
          />
        </div>
      ) : (
        <div className="animate-in fade-in">
          <ScrumPlanning
            projectId={projectId}
            members={members || []}
            onSprintStarted={loadSprints}
          />
        </div>
      )}

    </div>
  );
}