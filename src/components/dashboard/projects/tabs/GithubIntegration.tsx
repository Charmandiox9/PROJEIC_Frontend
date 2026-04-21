'use client';

import { useState } from 'react';
import { Github, GitCommit } from 'lucide-react';
import Input from '@/components/ui/Input';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_GITHUB_COMMITS } from '@/graphql/misc/operations';

export default function GithubIntegration() {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('main');
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGraphQL({
        query: GET_GITHUB_COMMITS,
        variables: { token, owner, name: repoName, branch }
      });
      
      if (result.getGithubCommits) {
        setData(result.getGithubCommits);
      } else {
        throw new Error('No se recibieron datos de GitHub.');
      }

    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || 'Error de conexión con GraphQL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-surface-primary rounded-xl border border-border-primary">
      <div className="flex items-center gap-3 border-b border-border-primary pb-4">
        <Github className="w-6 h-6" />
        <h3 className="font-bold">Sincronización con GitHub</h3>
      </div>

      {/* Formulario de Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="GitHub Access Token" 
          type="password" 
          placeholder="ghp_xxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Input 
          label="Propietario (Owner)" 
          placeholder="Ej: johndoe"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <Input 
          label="Nombre del Repositorio" 
          placeholder="Ej: project-backend"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
        />
        <Input 
          label="Rama (Branch)" 
          placeholder="main, master, develop..."
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />
      </div>

      <button 
        onClick={fetchCommits}
        disabled={!token || !owner || !repoName || loading}
        className="w-full py-2.5 bg-text-primary text-surface-primary rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Consultando a GitHub...' : 'Obtener Historial de Commits'}
      </button>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      {/* Panel de Resultados */}
      {data && data.commits && (
        <div className="space-y-6 pt-4 border-t border-border-primary animate-in fade-in slide-in-from-bottom-4">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-brand/10 border border-brand/20 rounded-lg text-center">
              <span className="block text-2xl font-bold text-brand">{data.totalCommits}</span>
              <span className="text-xs text-brand/80 uppercase tracking-wider font-semibold">Commits en {branch}</span>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <span className="block text-2xl font-bold text-green-500">+{data.stats.totalAdditions}</span>
              <span className="text-xs text-green-400 uppercase tracking-wider font-semibold">Líneas Agregadas</span>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <span className="block text-2xl font-bold text-red-500">-{data.stats.totalDeletions}</span>
              <span className="text-xs text-red-400 uppercase tracking-wider font-semibold">Líneas Eliminadas</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.commits.map((commit: any) => (
              <div key={commit.oid} className="p-4 bg-surface-secondary rounded-lg border border-border-secondary hover:border-border-primary transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <img 
                      src={commit.author.user?.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
                      alt={commit.author.name}
                      className="w-10 h-10 rounded-full border border-border-secondary bg-surface-primary object-cover shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-text-primary line-clamp-1" title={commit.message}>
                        {commit.message.split('\n')[0]}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        <span className="font-medium text-text-secondary">{commit.author.name}</span> 
                        {' '}• {new Date(commit.committedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded font-medium">
                      +{commit.additions}
                    </span>
                    <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded font-medium">
                      -{commit.deletions}
                    </span>
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