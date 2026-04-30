import { X, TrendingUp, Calendar } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function AuthorModal({ author, onClose }: { author: any, onClose: () => void }) {
  const { t } = useT();
  if (!author) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-primary rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 border border-border-primary">
        <div className="p-6 border-b border-border-primary flex items-start justify-between bg-surface-secondary">
          <div className="flex items-center gap-4">
            <img src={author.avatarUrl} alt="" className="w-16 h-16 rounded-full border-4 border-surface-primary shadow-sm" />
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{author.name}</h2>
              <p className="text-sm text-brand font-bold uppercase tracking-wider">{t('github.devOverview')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-primary rounded-full transition-colors text-text-muted hover:text-text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-border-primary bg-surface-primary">
          <div className="text-center p-4 rounded-xl bg-surface-secondary border border-border-secondary">
            <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">{t('github.totalCommits')}</p>
            <p className="text-3xl font-black text-brand">{author.totalCommits}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">{t('github.linesAdded')}</p>
            <p className="text-3xl font-black text-green-500">+{author.additions}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">{t('github.linesDeleted')}</p>
            <p className="text-3xl font-black text-red-500">-{author.deletions}</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-primary">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" /> {t('github.specificHistory')}
          </h3>
          <div className="space-y-3">
            {author.commits.map((c: any) => (
              <div key={c.oid} className="p-4 bg-surface-secondary rounded-lg border border-border-secondary flex justify-between items-center hover:border-border-primary transition-colors">
                <div>
                  <p className="font-bold text-sm text-text-primary mb-1">{c.message}</p>
                  <p className="text-[10px] text-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(c.committedDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 text-[10px] font-mono font-bold shrink-0">
                  <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded">+{c.additions}</span>
                  <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded">-{c.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}