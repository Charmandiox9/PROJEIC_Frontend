import { Server, GitBranch, Calendar } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function EnvironmentsPanel({ deployments }: { deployments: any[] }) {
  const { t } = useT();
  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5">
      <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
        <Server className="w-5 h-5 text-brand" /> {t('github.activeEnvironments')}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {deployments?.map((dep: any) => (
          <div key={dep.id} className="p-3 bg-surface-secondary border border-border-secondary rounded-lg flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start pl-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{dep.environment}</p>
                <p className="text-sm font-bold text-text-primary mt-0.5 flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-text-muted" /> {dep.ref}
                </p>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="pl-2 flex justify-between items-end mt-1">
              <p className="text-[10px] text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(dep.created_at).toLocaleDateString()}</p>
              <p className="text-[10px] bg-surface-primary px-2 py-0.5 rounded border border-border-primary text-text-secondary">{t('github.by')} {dep.creator_login}</p>
            </div>
          </div>
        ))}
        {(!deployments || deployments.length === 0) && (
          <div className="col-span-1 sm:col-span-2 p-4 text-center text-sm text-text-muted border border-dashed border-border-secondary rounded-lg">
            {t('github.noEnvironments')}
          </div>
        )}
      </div>
    </div>
  );
}