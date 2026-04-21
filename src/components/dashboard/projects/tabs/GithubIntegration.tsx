'use client';

import { useState } from 'react';
import { Github, GitCommit, Play, CheckCircle, XCircle, Clock, GitBranch, Package } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_GITHUB_DATA, DISPATCH_WORKFLOW } from '@/graphql/misc/operations';
import Input from '@/components/ui/Input';

export default function GithubIntegration({ project }: { project: any }) {
  const [token, setToken] = useState('');
  const [branch, setBranch] = useState('main'); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [workflowFile, setWorkflowFile] = useState('main.yml');
  const [dispatching, setDispatching] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const syncData = async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL({
        query: GET_GITHUB_DATA,
        variables: {
          token,
          owner: project.githubOwner,
          repo: project.githubRepo,
          branch: branch
        }
      });
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!confirm(`¿Deseas disparar manualmente el flujo "${workflowFile}" en la rama "${branch}"?`)) return;
    
    setDispatching(true);
    try {
      const result = await fetchGraphQL({
        query: DISPATCH_WORKFLOW,
        variables: {
          token,
          owner: project.githubOwner,
          repo: project.githubRepo,
          workflowId: workflowFile,
          ref: branch
        }
      });

      if (result.dispatchWorkflow?.success) {
        alert("¡Éxito! El workflow se ha solicitado. Aparecerá en la lista en unos segundos.");
        setTimeout(syncData, 3000);
      }
    } catch (err: any) {
      alert("Error al disparar: " + err.message);
    } finally {
      setDispatching(false);
    }
  };

  const handleDownloadArtifact = async (artifactId: string, artifactName: string) => {
    setDownloadingId(artifactId);
    try {
      const res = await fetch(`http://localhost:4000/projeic/api/github/artifacts/${project.githubOwner}/${project.githubRepo}/${artifactId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Fallo la descarga');

      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${artifactName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err) {
      alert("Error al descargar el artefacto.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (!project.githubOwner || !project.githubRepo) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border-primary rounded-xl">
        <Github className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-text-muted">Vincula un repositorio en los ajustes del proyecto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-surface-primary rounded-xl border border-border-primary space-y-4">
        <div className="flex items-center gap-3">
          <Github className="w-6 h-6" />
          <h3 className="font-bold text-lg">{project.githubOwner} / {project.githubRepo}</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-[2]">
            <Input 
              label="GitHub Personal Access Token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input 
              label="Rama (Branch)"
              type="text"
              placeholder="Ej: main, develop..."
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
          <button 
            onClick={syncData}
            disabled={!token || !branch.trim() || loading} 
            className="w-full md:w-auto px-6 py-[10px] bg-brand text-white rounded-lg font-bold disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Sincronizando...' : 'Actualizar Datos'}
          </button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna de Commits  */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-4">
              <h4 className="font-bold flex items-center gap-2">
                <GitCommit className="w-4 h-4" /> Commits en <span className="text-brand bg-brand/10 px-2 py-0.5 rounded font-mono text-xs">{branch}</span>
              </h4>
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                Total: {data.getGithubCommits.totalCommits}
              </span>
            </div>
            
            {data.getGithubCommits.commits.map((c: any) => (
              <div key={c.oid} className="p-3 bg-surface-secondary rounded-lg border border-border-secondary">
                <p className="text-sm font-medium line-clamp-1" title={c.message}>{c.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <img src={c.author.user?.avatarUrl || '/default-avatar.png'} alt="" className="w-4 h-4 rounded-full bg-surface-primary" />
                    {c.author.name}
                  </span>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="text-green-500">+{c.additions}</span>
                    <span className="text-red-500">-{c.deletions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Columna de Actions y Artefactos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold flex items-center gap-2"><Play className="w-4 h-4" /> CI/CD</h4>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="archivo.yml"
                  value={workflowFile}
                  onChange={(e) => setWorkflowFile(e.target.value)}
                  className="text-[10px] px-2 py-1 bg-surface-secondary border border-border-secondary rounded outline-none focus:border-brand"
                />
                <button
                  onClick={handleDispatch}
                  disabled={dispatching || !token}
                  className="flex items-center gap-1 px-3 py-1 bg-brand text-white text-[10px] font-bold rounded hover:bg-brand-hover disabled:opacity-50 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" /> {dispatching ? 'Iniciando...' : 'Run'}
                </button>
              </div>
            </div>

            {/* Listado de Runs */}
            {data.getWorkflowRuns.map((run: any) => (
              <div key={run.id} className="p-3 bg-surface-secondary rounded-lg border border-border-secondary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {run.conclusion === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium line-clamp-1" title={run.display_title}>{run.display_title}</p>
                    <p className="text-[10px] text-text-muted">{new Date(run.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <a href={run.html_url} target="_blank" rel="noreferrer" className="text-[10px] text-brand font-bold uppercase hover:underline">
                  Ver log
                </a>
              </div>
            ))}
            
            {data.getWorkflowRuns.length === 0 && (
              <div className="p-4 text-center text-sm text-text-muted bg-surface-secondary border border-border-secondary rounded-lg">
                No hay workflows ejecutados recientemente en este repositorio.
              </div>
            )}

            {/* SECCIÓN DE ARTEFACTOS */}
            <div className="pt-4 mt-6 border-t border-border-primary">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <Package className="w-4 h-4" /> Artefactos de Compilación
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.getArtifacts?.map((art: any) => (
                  <div key={art.id} className="p-3 bg-surface-secondary border border-border-secondary rounded-lg flex flex-col justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text-primary truncate" title={art.name}>{art.name}</p>
                      <p className="text-[10px] text-text-muted">
                        {(art.size_in_bytes / 1024 / 1024).toFixed(2)} MB • {new Date(art.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {art.expired ? (
                      <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded self-start uppercase tracking-wider">
                        Expirado
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleDownloadArtifact(art.id, art.name)}
                        disabled={downloadingId === art.id}
                        className="text-[10px] text-brand font-bold bg-brand/10 hover:bg-brand/20 transition-colors px-3 py-1.5 rounded self-start uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {downloadingId === art.id ? (
                          <> <Clock className="w-3 h-3 animate-spin" /> Descargando... </>
                        ) : (
                          <> <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Descargar </>
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {(!data.getArtifacts || data.getArtifacts.length === 0) && (
                  <div className="col-span-1 sm:col-span-2 p-4 text-center text-sm text-text-muted bg-surface-primary border border-dashed border-border-secondary rounded-lg">
                    No hay artefactos recientes.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}