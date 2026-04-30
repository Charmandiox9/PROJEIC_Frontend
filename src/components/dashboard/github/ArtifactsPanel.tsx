import { Package, Clock } from 'lucide-react';

interface Props {
  artifacts: any[];
  handleDownloadArtifact: (id: string, name: string) => void;
  downloadingId: string | null;
}

import { useT } from '@/hooks/useT';

export default function ArtifactsPanel({ artifacts, handleDownloadArtifact, downloadingId }: Props) {
  const { t } = useT();
  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5">
      <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
        <Package className="w-5 h-5 text-brand" /> {t('github.buildArtifacts')}
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {artifacts?.map((art: any) => (
          <div key={art.id} className="p-3 bg-surface-secondary border border-border-secondary rounded-lg flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-bold truncate">{art.name}</p>
              <p className="text-[10px] text-text-muted">{(art.size_in_bytes / 1024 / 1024).toFixed(2)} MB • {new Date(art.created_at).toLocaleDateString()}</p>
            </div>
            {art.expired ? (
              <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded uppercase shrink-0 tracking-wider">{t('github.expired')}</span>
            ) : (
              <button 
                onClick={() => handleDownloadArtifact(art.id, art.name)} 
                disabled={downloadingId === art.id} 
                className="text-[10px] text-brand font-bold bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded uppercase flex items-center gap-1 disabled:opacity-50 shrink-0 transition-colors tracking-wider"
              >
                {downloadingId === art.id ? <><Clock className="w-3 h-3 animate-spin"/> ZIP</> : <><Package className="w-3 h-3"/> {t('github.download')}</>}
              </button>
            )}
          </div>
        ))}
        {(!artifacts || artifacts.length === 0) && <p className="text-xs text-center text-text-muted p-2">{t('github.noArtifacts')}</p>}
      </div>
    </div>
  );
}