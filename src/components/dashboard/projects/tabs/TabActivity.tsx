'use client';

import { useEffect, useState } from 'react';
import { Loader2, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_ACTIVITY_LOGS } from '@/graphql/projects/operations';

const fieldDictionary: Record<string, string> = {
  title: 'title',
  name: 'name',
  description: 'desc',
  status: 'status',
  color: 'color',
  mode: 'mode',
  isPublic: 'public',
  isInstitutional: 'institutional',
};

const getActionText = (action: string, entity: string, meta: any) => {
  const entityName = meta?.title ? `"${meta.title}"` : 'obj';

  const dict: Record<string, Record<string, string>> = {
    CREATED: {
      TASK: `created task ${entityName}`,
      PROJECT: `initialized project`,
      SPRINT: `created sprint`,
      BOARD: `added board`,
      MEMBER: `invited ${entityName}`,
      EXPECTED_RESULT: `defined expected_result ${entityName}`,
    },
    UPDATED: {
      TASK: `updated task ${entityName}`,
      PROJECT: `modified project_config`,
      MEMBER: `modified role for ${entityName}`,
      EXPECTED_RESULT: meta?.addedEvidence 
        ? `uploaded evidence to ${entityName}` 
        : `updated result ${entityName}`,
    },
    DELETED: {
      TASK: `dropped task ${entityName}`,
      MEMBER: `kicked ${entityName}`,
    },
    JOINED: {
      MEMBER: `joined the project`,
    },
    LEFT: {
      MEMBER: `left the project`,
    },
    ASSIGNED: {
      TASK: `was assigned to ${entityName}`,
    },
    MOVED: {
      TASK: `moved task ${entityName}`,
    },
    COMMENTED: {
      TASK: `added comment to ${entityName}`,
    }
  };

  return dict[action]?.[entity] || `executed ${action} on ${entity}`;
};

const getTerminalPrefix = (action: string) => {
  switch(action) {
    case 'CREATED': return <span className="text-green-500">[+]</span>;
    case 'DELETED': return <span className="text-red-500">[-]</span>;
    case 'LEFT': return <span className="text-red-500">[{'<'}]</span>;
    case 'UPDATED': return <span className="text-yellow-500">[~]</span>;
    case 'MOVED': return <span className="text-blue-500">[→]</span>;
    case 'JOINED': return <span className="text-blue-500">[{'>'}]</span>;
    case 'ASSIGNED': return <span className="text-purple-500">[@]</span>;
    case 'COMMENTED': return <span className="text-cyan-500">[#]</span>;
    default: return <span className="text-gray-500">[*]</span>;
  }
};

const renderActionDetails = (action: string, entity: string, meta: any) => {
  if (!meta) return null;

  if (meta.previousStatus && meta.newStatus) {
    return (
      <div className="pl-6 mt-1 text-gray-500">
        <span className="text-gray-600">↳</span> status: <span className="line-through text-gray-600">{meta.previousStatus}</span> <span className="text-green-400">→</span> <span className="text-green-300">{meta.newStatus}</span>
      </div>
    );
  }

  if (meta.newRole) {
    return (
      <div className="pl-6 mt-1 text-gray-500">
        <span className="text-gray-600">↳</span> role: {meta.previousRole && <><span className="line-through text-gray-600">{meta.previousRole}</span> <span className="text-green-400">→</span></>} <span className="text-green-300">{meta.newRole}</span>
      </div>
    );
  }

  if (meta.addedEvidence) {
    return (
      <div className="pl-6 mt-1 text-green-600/80">
        <span className="text-gray-600">↳</span> payload: [attached_evidence_file]
      </div>
    );
  }

  if (meta.changes && Object.keys(meta.changes).length > 0) {
    return (
      <div className="pl-6 mt-1 flex flex-col">
        {Object.entries(meta.changes).map(([key, changeData]: [string, any]) => {
          const fieldName = fieldDictionary[key] || key;
          const formatValue = (val: any) => typeof val === 'boolean' ? (val ? 'true' : 'false') : `"${String(val)}"`;

          if (changeData && typeof changeData === 'object' && 'from' in changeData) {
            return (
              <div key={key} className="text-gray-500">
                <span className="text-gray-600">↳</span> {fieldName}: <span className="line-through text-gray-600">{formatValue(changeData.from)}</span> <span className="text-yellow-500">→</span> <span className="text-yellow-200">{formatValue(changeData.to)}</span>
              </div>
            );
          } 
          
          return (
            <div key={key} className="text-gray-500">
              <span className="text-gray-600">↳</span> set {fieldName} = <span className="text-yellow-200">{formatValue(changeData)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchGraphQL({
          query: GET_ACTIVITY_LOGS,
          variables: { projectId }
        });
        setLogs(data.activityLogsByProject);
      } catch (error) {
        console.error("Error cargando actividad", error);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-green-500 bg-gray-950 rounded-lg border border-gray-800">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm blinking-cursor">executing fetch_logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center font-mono bg-gray-950 rounded-lg border border-gray-800 shadow-xl">
        <Terminal className="w-10 h-10 text-gray-700 mb-4" />
        <p className="text-sm font-bold text-green-500">/var/log/projeic/activity.log</p>
        <p className="text-xs text-gray-500 mt-2">EOF (No activity recorded yet)</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto py-8 px-4 w-full">
      {/* VENTANA DE TERMINAL */}
<div className="bg-brand-dark rounded-lg border border-gray-800 shadow-2xl overflow-hidden font-mono text-sm">

        {/* HEADER FALSO TIPO MACOS/LINUX */}
        <div className="bg-ui-dark-hover px-4 py-2 border-b border-gray-800 flex items-center gap-2 select-none">
          <div className="w-3 h-3 rounded-full bg-error"></div>
          <div className="w-3 h-3 rounded-full bg-warning"></div>
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span className="ml-4 text-xs text-gray-500">root@projeic:~/project/{projectId.slice(0,8)}</span>
        </div>

        {/* CUERPO DEL LOG */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          <ul className="flex flex-col gap-3 min-w-max">
            {logs.map((log) => {
              let parsedMeta = null;
              try { if (log.meta) parsedMeta = JSON.parse(log.meta); } catch (e) {}

              const prefix = getTerminalPrefix(log.action);
              const actionText = getActionText(log.action, log.entity, parsedMeta);
              const detailsNode = renderActionDetails(log.action, log.entity, parsedMeta);
              
              const timestamp = format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss');
              
              const username = log.user.name.split(' ')[0].toLowerCase();

              return (
                <li key={log.id} className="group hover:bg-white/[0.02] p-1 -mx-1 rounded transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="text-gray-600 shrink-0 select-none">[{timestamp}]</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="select-none">{prefix}</span>
                        <span className="text-gray-300">
                          <span className="text-blue-400 font-bold">{username}</span>{' '}
                          {actionText}
                        </span>
                      </div>
                      {detailsNode}
                    </div>
                  </div>
                </li>
              );
            })}
            
            {/* Línea final interactiva falsa */}
            <li className="mt-4 flex gap-4 text-gray-500">
              <span className="shrink-0 select-none">[{format(new Date(), 'yyyy-MM-dd HH:mm:ss')}]</span>
              <div className="flex gap-2 items-center">
                <span className="text-green-500 font-bold">root@projeic:~$</span>
                <span className="w-2 h-4 bg-gray-400 animate-pulse"></span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}