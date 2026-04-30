import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function TeamRanking({ data, onSelectAuthor }: { data: any, onSelectAuthor: (author: any) => void }) {
  const { t } = useT();
  const authorsStats = useMemo(() => {
    if (!data?.getGithubCommits?.commits) return [];
    const stats: Record<string, any> = {};
    data.getGithubCommits.commits.forEach((c: any) => {
      const name = c.author.name;
      if (!stats[name]) {
        stats[name] = { name, avatarUrl: c.author.user?.avatarUrl || '/default-avatar.png', totalCommits: 0, additions: 0, deletions: 0, commits: [] };
      }
      stats[name].totalCommits += 1;
      stats[name].additions += c.additions;
      stats[name].deletions += c.deletions;
      stats[name].commits.push(c);
    });
    return Object.values(stats).sort((a: any, b: any) => b.totalCommits - a.totalCommits);
  }, [data]);

  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 h-full">
      <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
        <Users className="w-5 h-5 text-brand" /> {t('github.teamRanking')}
      </h4>
      <div className="grid gap-3">
        {authorsStats.map((author: any, index: number) => (
          <div 
            key={author.name} 
            onClick={() => onSelectAuthor(author)}
            className="p-3 bg-surface-secondary border border-border-secondary rounded-lg cursor-pointer hover:border-brand hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={author.avatarUrl} alt="" className="w-10 h-10 rounded-full border-2 border-surface-primary group-hover:border-brand transition-colors" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface-primary border border-border-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-text-primary">
                  {index + 1}
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary group-hover:text-brand transition-colors">{author.name}</p>
                <p className="text-[10px] text-text-muted font-mono">{t('github.commitsInBranch').replace('{n}', author.totalCommits)}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-[10px] font-mono">
              <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded">+{author.additions.toLocaleString()}</span>
              <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">-{author.deletions.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {authorsStats.length === 0 && (
          <div className="p-4 text-center text-sm text-text-muted border border-dashed border-border-secondary rounded-lg">
            {t('github.noCommits')}
          </div>
        )}
      </div>
    </div>
  );
}