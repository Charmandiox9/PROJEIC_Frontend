import { Activity, Play, CheckCircle, XCircle, Clock, BarChart } from 'lucide-react';

interface Props {
  workflows: any[];
  workflowFile: string;
  setWorkflowFile: (v: string) => void;
  handleDispatch: () => void;
  dispatching: boolean;
  token: string;
}

import { useT } from '@/hooks/useT';

export default function WorkflowPanel({ workflows, workflowFile, setWorkflowFile, handleDispatch, dispatching, token }: Props) {
  const { t } = useT();
  const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = ((diff % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  const getDurationSeconds = (start: string, end: string) => (new Date(end).getTime() - new Date(start).getTime()) / 1000;

  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-brand" /> {t('github.deployments')}
        </h4>
        <div className="flex gap-2">
          <input type="text" placeholder="main.yml" value={workflowFile} onChange={(e) => setWorkflowFile(e.target.value)} className="text-[10px] px-2 py-1 bg-surface-secondary border border-border-secondary rounded outline-none focus:border-brand w-24" />
          <button onClick={handleDispatch} disabled={dispatching || !token} className="flex items-center gap-1 px-3 py-1 bg-brand text-white text-[10px] font-bold rounded hover:bg-brand-hover disabled:opacity-50 transition-colors">
            <Play className="w-3 h-3 fill-current" /> {dispatching ? t('github.running') : t('github.run')}
          </button>
        </div>
      </div>

      {workflows.length > 0 && (
        <div className="mb-4 p-3 bg-surface-secondary border border-border-secondary rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1"><BarChart className="w-3 h-3" /> {t('github.times')}</span>
            <span className="text-[10px] text-text-muted font-mono">{t('github.latestRuns')}</span>
          </div>
          <div className="flex items-end gap-2 h-12 pt-2">
            {workflows.slice().reverse().map((run: any) => {
              if (run.status !== 'completed') return <div key={run.id} className="flex-1 bg-surface-primary rounded animate-pulse h-full opacity-50"></div>;
              const seconds = getDurationSeconds(run.created_at, run.updated_at);
              const maxSeconds = Math.max(...workflows.map((r: any) => getDurationSeconds(r.created_at, r.updated_at)));
              const heightPercent = Math.max((seconds / maxSeconds) * 100, 10);
              const isSuccess = run.conclusion === 'success';

              return (
                <div key={run.id} className="flex-1 flex flex-col justify-end group relative h-full">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-primary border border-border-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-sm pointer-events-none">
                    {getDuration(run.created_at, run.updated_at)}
                  </div>
                  <div style={{ height: `${heightPercent}%` }} className={`w-full rounded-t-sm transition-all duration-500 ${isSuccess ? 'bg-green-500/50 group-hover:bg-green-500' : 'bg-red-500/50 group-hover:bg-red-500'}`}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
        {workflows.map((run: any) => (
          <div key={run.id} className="p-3 bg-surface-secondary rounded-lg border border-border-secondary flex items-center justify-between group hover:border-border-primary transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              {run.conclusion === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : run.conclusion === 'failure' ? <XCircle className="w-5 h-5 text-red-500 shrink-0" /> : <Clock className="w-5 h-5 text-yellow-500 animate-spin shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" title={run.display_title}>{run.display_title}</p>
                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{new Date(run.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  {run.status === 'completed' && (
                    <><span className="font-mono flex items-center gap-1 text-text-secondary"><Clock className="w-3 h-3" /> {getDuration(run.created_at, run.updated_at)}</span></>
                  )}
                </div>
              </div>
            </div>
            <a href={run.html_url} target="_blank" rel="noreferrer" className="text-[10px] text-brand font-bold bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded uppercase shrink-0 opacity-0 group-hover:opacity-100 transition-all">{t('github.logs')}</a>
          </div>
        ))}
        {workflows.length === 0 && <p className="text-xs text-center text-text-muted p-2">{t('github.noRecentRuns')}</p>}
      </div>
    </div>
  );
}