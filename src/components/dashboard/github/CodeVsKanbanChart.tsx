import { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { GitCommit, CheckSquare } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROJECT_METRICS } from '@/graphql/misc/operations';

export default function CodeVsKanbanChart({ projectId, githubCommits }: { projectId: string, githubCommits: any[] }) {
  const [kanbanData, setKanbanData] = useState<any[]>([]);

  useEffect(() => {
    const fetchKanban = async () => {
      try {
        const data = await fetchGraphQL({ query: GET_PROJECT_METRICS, variables: { projectId } });
        if (data.projectMetrics?.dailyCompletions) {
          setKanbanData(data.projectMetrics.dailyCompletions);
        }
      } catch (e) { console.error(e); }
    };
    fetchKanban();
  }, [projectId]);

  const mergedData = useMemo(() => {
    if (!kanbanData.length) return [];

    const commitCounts = githubCommits.reduce((acc, commit) => {
      const dateStr = commit.committedDate.split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return kanbanData.map(day => ({
      date: day.date,
      displayDate: format(parseISO(day.date), "d MMM", { locale: es }),
      kanbanDone: day.count,
      githubCommits: commitCounts[day.date] || 0
    }));
  }, [kanbanData, githubCommits]);

  if (mergedData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
        Correlación: Esfuerzo vs. Valor
      </h3>
      <p className="text-xs text-gray-500 mb-6">Compara los commits de código (esfuerzo) con las tarjetas terminadas en Kanban (valor).</p>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mergedData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#3B82F6', fontSize: 12 }} allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#10B981', fontSize: 12 }} allowDecimals={false} />
            
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar yAxisId="left" dataKey="githubCommits" name="Commits" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
            
            <Line yAxisId="right" type="monotone" dataKey="kanbanDone" name="Tareas Terminadas" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}