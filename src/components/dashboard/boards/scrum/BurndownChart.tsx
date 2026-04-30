'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { Loader2 } from 'lucide-react';
import { useT } from '@/hooks/useT';

const GET_BURNDOWN = `
  query GetSprintBurndown($sprintId: String!) {
    sprintBurndown(sprintId: $sprintId) {
      dayLabel
      date
      ideal
      real
    }
  }
`;

export default function BurndownChart({ sprintId }: { sprintId: string }) {
  const { t } = useT();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!sprintId) return;
      try {
        const res = await fetchGraphQL({ query: GET_BURNDOWN, variables: { sprintId } });
        setData(res.sprintBurndown || []);
      } catch (error) {
        console.error("Error cargando burndown:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [sprintId]);

  if (isLoading) return <div className="h-64 flex justify-center items-center"><Loader2 className="animate-spin text-brand" /></div>;
  if (data.length === 0) return <div className="h-64 flex justify-center items-center text-gray-400 text-sm">{t('kanban.burndownNoData')}</div>;

  return (
    <div className="h-72 w-full bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{t('kanban.burndownTitle')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="dayLabel" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis fontSize={10} axisLine={false} tickLine={false} tickCount={5} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />

          {/* Línea Ideal (La meta matemática) */}
          <Line name={t('kanban.burndownIdeal')} type="linear" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} />

          {/* Línea Real (El equipo real) */}
          <Line name={t('kanban.burndownReal')} type="stepAfter" dataKey="real" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}