'use client';

import { useState, useMemo } from 'react';
import { 
  Github, GitCommit, Play, CheckCircle, XCircle, Clock, 
  Package, Users, Activity, X, TrendingUp, Calendar, ChevronUp, ChevronDown
} from 'lucide-react';
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
  const [selectedAuthor, setSelectedAuthor] = useState<any | null>(null);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const authorsStats = useMemo(() => {
    if (!data?.getGithubCommits?.commits) return [];
    
    const stats: Record<string, any> = {};
    
    data.getGithubCommits.commits.forEach((c: any) => {
      const name = c.author.name;
      if (!stats[name]) {
        stats[name] = {
          name,
          avatarUrl: c.author.user?.avatarUrl || '/default-avatar.png',
          totalCommits: 0,
          additions: 0,
          deletions: 0,
          commits: []
        };
      }
      stats[name].totalCommits += 1;
      stats[name].additions += c.additions;
      stats[name].deletions += c.deletions;
      stats[name].commits.push(c);
    });

    return Object.values(stats).sort((a: any, b: any) => b.totalCommits - a.totalCommits);
  }, [data]);

  if (!project.githubOwner || !project.githubRepo) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border-primary rounded-xl">
        <Github className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-text-muted">Vincula un repositorio en los ajustes del proyecto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* PANEL DE CONFIGURACIÓN SUPERIOR */}
      <div className="p-6 bg-surface-primary rounded-xl border border-border-primary space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className="w-6 h-6 text-text-primary" />
            <h3 className="font-bold text-lg">{project.githubOwner} / {project.githubRepo}</h3>
          </div>
          {data && (
            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Sincronizado
            </span>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end pt-4 border-t border-border-primary">
          <div className="flex-[2]">
            <Input label="GitHub Personal Access Token" type="password" placeholder="ghp_xxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Rama (Branch)" type="text" placeholder="Ej: main, develop..." value={branch} onChange={(e) => setBranch(e.target.value)} />
          </div>
          <button 
            onClick={syncData} disabled={!token || !branch.trim() || loading} 
            className="w-full md:w-auto px-6 py-[10px] bg-brand text-white rounded-lg font-bold hover:bg-brand-hover disabled:opacity-50 whitespace-nowrap transition-colors"
          >
            {loading ? 'Sincronizando...' : 'Actualizar Datos'}
          </button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: Analítica de Equipo */}
            <div className="bg-surface-primary border border-border-primary rounded-xl p-5 h-full">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
                <Users className="w-5 h-5 text-brand" /> Ranking del Equipo
              </h4>
              <div className="grid gap-3">
                {authorsStats.map((author: any, index: number) => (
                  <div 
                    key={author.name} 
                    onClick={() => setSelectedAuthor(author)}
                    className="p-3 bg-surface-secondary border border-border-secondary rounded-lg cursor-pointer hover:border-brand hover:shadow-sm transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full border-2 border-surface-primary group-hover:border-brand transition-colors" />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface-primary border border-border-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-text-primary group-hover:text-brand transition-colors">{author.name}</p>
                        <p className="text-[10px] text-text-muted font-mono">{author.totalCommits} commits en la rama</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[10px] font-mono">
                      <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded">+{author.additions.toLocaleString()} líneas</span>
                      <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">-{author.deletions.toLocaleString()} líneas</span>
                    </div>
                  </div>
                ))}
                
                {authorsStats.length === 0 && (
                  <div className="p-4 text-center text-sm text-text-muted border border-dashed border-border-secondary rounded-lg">
                    No hay commits registrados.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: DevOps (CI/CD y Artefactos) */}
            <div className="space-y-6 h-full flex flex-col">
              {/* Sección Actions */}
              <div className="bg-surface-primary border border-border-primary rounded-xl p-5 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-brand" /> Despliegues (CI/CD)
                  </h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="main.yml" value={workflowFile} onChange={(e) => setWorkflowFile(e.target.value)} className="text-[10px] px-2 py-1 bg-surface-secondary border border-border-secondary rounded outline-none focus:border-brand w-24" />
                    <button onClick={handleDispatch} disabled={dispatching || !token} className="flex items-center gap-1 px-3 py-1 bg-brand text-white text-[10px] font-bold rounded hover:bg-brand-hover disabled:opacity-50">
                      <Play className="w-3 h-3 fill-current" /> {dispatching ? 'Run...' : 'Ejecutar'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.getWorkflowRuns.map((run: any) => (
                    <div key={run.id} className="p-3 bg-surface-secondary rounded-lg border border-border-secondary flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {run.conclusion === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : run.conclusion === 'failure' ? <XCircle className="w-5 h-5 text-red-500" /> : <Clock className="w-5 h-5 text-yellow-500 animate-spin" />}
                        <div>
                          <p className="text-sm font-bold truncate max-w-[200px]" title={run.display_title}>{run.display_title}</p>
                          <p className="text-[10px] text-text-muted">{new Date(run.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <a href={run.html_url} target="_blank" rel="noreferrer" className="text-[10px] text-brand font-bold uppercase hover:underline">Ver log</a>
                    </div>
                  ))}
                  {data.getWorkflowRuns.length === 0 && <p className="text-xs text-center text-text-muted p-2">Sin ejecuciones recientes.</p>}
                </div>
              </div>

              {/* Sección Artefactos */}
              <div className="bg-surface-primary border border-border-primary rounded-xl p-5">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
                  <Package className="w-5 h-5 text-brand" /> Archivos de Compilación
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {data.getArtifacts?.map((art: any) => (
                    <div key={art.id} className="p-3 bg-surface-secondary border border-border-secondary rounded-lg flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-bold truncate" title={art.name}>{art.name}</p>
                        <p className="text-[10px] text-text-muted">{(art.size_in_bytes / 1024 / 1024).toFixed(2)} MB • {new Date(art.created_at).toLocaleDateString()}</p>
                      </div>
                      {art.expired ? (
                        <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded uppercase shrink-0">Expirado</span>
                      ) : (
                        <button onClick={() => handleDownloadArtifact(art.id, art.name)} disabled={downloadingId === art.id} className="text-[10px] text-brand font-bold bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded uppercase flex items-center gap-1 disabled:opacity-50 shrink-0">
                          {downloadingId === art.id ? <><Clock className="w-3 h-3 animate-spin"/> ZIP</> : <><Package className="w-3 h-3"/> Bajar</>}
                        </button>
                      )}
                    </div>
                  ))}
                  {(!data.getArtifacts || data.getArtifacts.length === 0) && <p className="text-xs text-center text-text-muted p-2">No hay artefactos disponibles.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ANCHO COMPLETO: Timeline de Commits Global */}
          <div className="mt-8 bg-surface-primary border border-border-primary rounded-xl overflow-hidden transition-all">
            
            <button 
              onClick={() => setShowFullTimeline(!showFullTimeline)}
              className="w-full flex items-center justify-between p-6 bg-surface-primary hover:bg-surface-secondary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-brand" />
                  <h4 className="font-bold text-lg text-text-primary">Historial Completo</h4>
                </div>
                <span className="text-xs font-bold bg-brand/10 text-brand px-3 py-1 rounded-full font-mono">
                  {branch} • {data.getGithubCommits.totalCommits} commits
                </span>
              </div>
              
              <div className="p-1 rounded-full bg-surface-secondary border border-border-secondary">
                {showFullTimeline ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </div>
            </button>

            {showFullTimeline && (
              <div className="p-6 pt-0 border-t border-border-primary animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="relative border-l-2 border-border-secondary ml-3 space-y-6 pt-6">
                  {data.getGithubCommits.commits.map((c: any) => (
                    <div key={c.oid} className="relative pl-6 group">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-primary border-2 border-brand group-hover:bg-brand transition-colors"></div>
                      
                      <div className="bg-surface-secondary border border-border-secondary p-4 rounded-lg shadow-sm group-hover:border-border-primary transition-colors">
                        <p className="text-sm font-bold text-text-primary mb-2">{c.message}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img src={c.author.user?.avatarUrl || '/default-avatar.png'} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-xs font-medium text-text-secondary">{c.author.name}</span>
                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(c.committedDate).toLocaleString()}
                            </span>
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
        </>
      )}

      {/* MODAL DE AUTOR SUPERPUESTO */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-primary rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header del Modal */}
            <div className="p-6 border-b border-border-primary flex items-start justify-between bg-surface-secondary">
              <div className="flex items-center gap-4">
                <img src={selectedAuthor.avatarUrl} alt="" className="w-16 h-16 rounded-full border-4 border-surface-primary shadow-sm" />
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{selectedAuthor.name}</h2>
                  <p className="text-sm text-brand font-bold">Radiografía de Desarrollo</p>
                </div>
              </div>
              <button onClick={() => setSelectedAuthor(null)} className="p-2 hover:bg-surface-primary rounded-full transition-colors text-text-muted hover:text-text-primary">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border-primary bg-surface-primary">
              <div className="text-center p-4 rounded-xl bg-surface-secondary border border-border-secondary">
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Total Commits</p>
                <p className="text-3xl font-black text-brand">{selectedAuthor.totalCommits}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">Líneas Agregadas</p>
                <p className="text-3xl font-black text-green-500">+{selectedAuthor.additions}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">Líneas Borradas</p>
                <p className="text-3xl font-black text-red-500">-{selectedAuthor.deletions}</p>
              </div>
            </div>

            {/* Lista de Commits del Autor */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-primary">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand" /> Historial Específico
              </h3>
              <div className="space-y-3">
                {selectedAuthor.commits.map((c: any) => (
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
      )}

    </div>
  );
}