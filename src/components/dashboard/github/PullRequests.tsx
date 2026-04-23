import { GitPullRequest } from 'lucide-react';

export default function PullRequests({ pullRequests }: { pullRequests: any[] }) {
  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 flex-1">
      <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
        <GitPullRequest className="w-5 h-5 text-brand" /> Pull Requests Activos
      </h4>
      <div className="grid gap-3">
        {pullRequests?.map((pr: any) => (
          <div key={pr.id} className="p-3 bg-surface-secondary border border-border-secondary rounded-lg flex items-center justify-between group hover:border-brand transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={pr.user_avatar} alt="" className="w-8 h-8 rounded-full border border-border-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-text-primary truncate" title={pr.title}>{pr.title}</p>
                <p className="text-[10px] text-text-muted">
                  Abierto por <span className="font-bold text-text-secondary">{pr.user_login}</span> • {new Date(pr.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <a href={pr.html_url} target="_blank" rel="noreferrer" className="text-[10px] text-brand font-bold bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded uppercase shrink-0 transition-colors">
              Revisar
            </a>
          </div>
        ))}
        {(!pullRequests || pullRequests.length === 0) && (
          <div className="p-4 text-center text-sm text-text-muted border border-dashed border-border-secondary rounded-lg">
            No hay Pull Requests abiertos.
          </div>
        )}
      </div>
    </div>
  );
}