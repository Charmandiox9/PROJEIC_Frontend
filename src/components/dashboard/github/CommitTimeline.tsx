import { GitCommit, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  commits: any[];
  totalCommits: number;
  branch: string;
  show: boolean;
  onToggle: () => void;
}

export default function CommitTimeline({ commits, totalCommits, branch, show, onToggle }: Props) {
  return (
    <div className="mt-8 bg-surface-primary border border-border-primary rounded-xl overflow-hidden transition-all shadow-sm">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-6 bg-surface-primary hover:bg-surface-secondary transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-brand" />
            <h4 className="font-bold text-lg text-text-primary">Historial Completo</h4>
          </div>
          <span className="text-xs font-bold bg-brand/10 text-brand px-3 py-1 rounded-full font-mono">{branch} • {totalCommits} commits</span>
        </div>
        <div className="p-1 rounded-full bg-surface-secondary border border-border-secondary">
          {show ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
        </div>
      </button>

      {show && (
        <div className="p-6 pt-0 border-t border-border-primary animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative border-l-2 border-border-secondary ml-3 space-y-6 pt-6">
            {commits.map((c: any) => (
              <div key={c.oid} className="relative pl-6 group">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-primary border-2 border-brand group-hover:bg-brand transition-colors"></div>
                <div className="bg-surface-secondary border border-border-secondary p-4 rounded-lg shadow-sm group-hover:border-border-primary transition-colors">
                  <p className="text-sm font-bold text-text-primary mb-2">{c.message}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img src={c.author.user?.avatarUrl || '/default-avatar.png'} alt="" className="w-5 h-5 rounded-full" />
                      <span className="text-xs font-medium text-text-secondary">{c.author.name}</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(c.committedDate).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono font-bold">
                      <span className="text-green-500">+{c.additions}</span>
                      <span className="text-red-500">-{c.deletions}</span>
                      <span className="text-text-muted ml-2">{c.oid.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}