'use client';

import { useState } from 'react';
import { Github, Info } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_GITHUB_DATA, DISPATCH_WORKFLOW } from '@/graphql/misc/operations';
import Input from '@/components/ui/Input';

import TeamRanking from '../../github/TeamRanking';
import PullRequests from '../../github/PullRequests';
import SecurityAudit from '../../github/SecurityAudit';
import WorkflowPanel from '../../github/WorkflowPanel';
import EnvironmentsPanel from '../../github/EnvironmentsPanel';
import ArtifactsPanel from '../../github/ArtifactsPanel';
import CommitTimeline from '../../github/CommitTimeline';
import AuthorModal from '../../github/AuthorModal';

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
        variables: { token, owner: project.githubOwner, repo: project.githubRepo, branch }
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
        variables: { token, owner: project.githubOwner, repo: project.githubRepo, workflowId: workflowFile, ref: branch }
      });
      if (result.dispatchWorkflow?.success) {
        alert("¡Éxito! El workflow se ha solicitado.");
        setTimeout(syncData, 3000);
      }
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setDispatching(false); }
  };

  const handleDownloadArtifact = async (artifactId: string, artifactName: string) => {
    setDownloadingId(artifactId);
    try {
      // 1. Inferir la URL base usando nuestra estrategia multi-entorno
      let baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";

      if (!baseUrl) {
        if (window.location.hostname.includes('development.up.railway.app')) {
          baseUrl = 'https://projeicbackend-development.up.railway.app';
        } else if (window.location.hostname.includes('production.up.railway.app')) {
          baseUrl = 'https://projeicbackend-production.up.railway.app';
        } else if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          baseUrl = 'http://localhost:4000';
        } else {
          // PRODUCCIÓN DOCKER: Ruta relativa para que pase por Nginx
          baseUrl = '';
        }
      }

      // 2. Limpiar slashes extra y armar el endpoint
      const cleanBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : '';
      const endpoint = `${cleanBaseUrl}/projeic/api/github/artifacts/${project.githubOwner}/${project.githubRepo}/${artifactId}/download`;

      // 3. Hacer el fetch al endpoint dinámico
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Falló la descarga');

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
      console.error(err);
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
    <div className="space-y-6 relative">
      
      {/* PANEL DE CONTROL SUPERIOR */}
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

        {/* CAJA DE INFORMACIÓN DEL TOKEN */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-text-primary">
            <p className="font-bold mb-1 text-blue-600 dark:text-blue-400">Requisitos de Conexión</p>
            <p className="text-text-muted text-xs mb-2">Para acceder a los datos privados y ejecutar despliegues, necesitas un <strong>Personal Access Token (Classic)</strong> de GitHub con los siguientes permisos (scopes) activados:</p>
            <ul className="flex flex-wrap gap-2 text-[10px] font-mono">
              <li className="bg-surface-secondary border border-border-secondary px-2 py-1 rounded">
                <span className="text-brand font-bold">repo</span> (Commits y Pull Requests)
              </li>
              <li className="bg-surface-secondary border border-border-secondary px-2 py-1 rounded">
                <span className="text-brand font-bold">workflow</span> (CI/CD y Artefactos)
              </li>
              <li className="bg-surface-secondary border border-border-secondary px-2 py-1 rounded">
                <span className="text-brand font-bold">security_events</span> (Auditoría)
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end pt-4 border-t border-border-primary">
          <div className="flex-[2]">
            <Input label="GitHub Personal Access Token" type="password" placeholder="ghp_xxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Rama (Branch)" type="text" placeholder="Ej: main, develop..." value={branch} onChange={(e) => setBranch(e.target.value)} />
          </div>
          <button onClick={syncData} disabled={!token || !branch.trim() || loading} className="w-full md:w-auto px-6 py-[10px] bg-brand text-white rounded-lg font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors">
            {loading ? 'Sincronizando...' : 'Actualizar Datos'}
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL DE DATOS */}
      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: Personas y Seguridad */}
            <div className="flex flex-col gap-6 h-full">
              <TeamRanking data={data} onSelectAuthor={setSelectedAuthor} />
              <PullRequests pullRequests={data.getPullRequests} />
              <SecurityAudit alerts={data.getSecurityAlerts} />
            </div>

            {/* COLUMNA DERECHA: Operaciones DevOps */}
            <div className="space-y-6 h-full flex flex-col">
              <WorkflowPanel 
                workflows={data.getWorkflowRuns} 
                workflowFile={workflowFile} 
                setWorkflowFile={setWorkflowFile} 
                handleDispatch={handleDispatch} 
                dispatching={dispatching} 
                token={token} 
              />
              <EnvironmentsPanel deployments={data.getDeployments} />
              <ArtifactsPanel 
                artifacts={data.getArtifacts} 
                handleDownloadArtifact={handleDownloadArtifact} 
                downloadingId={downloadingId} 
              />
            </div>
          </div>

          {/* 3. TIMELINE INFERIOR */}
          <CommitTimeline 
            commits={data.getGithubCommits.commits} 
            totalCommits={data.getGithubCommits.totalCommits} 
            branch={branch} 
            show={showFullTimeline} 
            onToggle={() => setShowFullTimeline(!showFullTimeline)} 
          />
        </>
      )}

      {/* 4. MODAL FLOTANTE */}
      <AuthorModal author={selectedAuthor} onClose={() => setSelectedAuthor(null)} />
      
    </div>
  );
}