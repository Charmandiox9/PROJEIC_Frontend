'use client';

import { useState } from 'react';
import { X, Target, ListTodo, ShieldCheck, History, ExternalLink, Download, Plus, AlertCircle, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_TASK, UPDATE_TASK, REMOVE_TASK } from '@/graphql/tasks/operations';

interface ResultDetailsModalProps {
  isOpen: boolean;
  result: any;
  onClose: () => void;
  onRefresh: () => void;
}

type TabType = 'tasks' | 'evidences' | 'history';

export default function ResultDetailsModal({ isOpen, result, onClose, onRefresh }: ResultDetailsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      await fetchGraphQL({
        query: CREATE_TASK,
        variables: {
          input: {
            title: newTaskTitle,
            projectId: result.projectId,
            expectedResultId: result.id,
            creatorId: user?.userId,
          }
        }
      });
      setNewTaskTitle('');
      onRefresh();
    } catch (error) {
      console.error("Error al crear tarea:", error);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    
    setLoadingTasks(prev => ({ ...prev, [task.id]: true }));
    try {
      await fetchGraphQL({
        query: UPDATE_TASK,
        variables: {
          input: {
            id: task.id,
            status: newStatus
          }
        }
      });
      onRefresh();
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    } finally {
      setLoadingTasks(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea definitivamente?')) return;
    
    setLoadingTasks(prev => ({ ...prev, [taskId]: true }));
    try {
      await fetchGraphQL({
        query: REMOVE_TASK,
        variables: { id: taskId }
      });
      onRefresh();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      setLoadingTasks(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const safeFormatDate = (dateSource: any, formatStr: string) => {
    try {
      if (!dateSource) return 'Fecha no disponible';
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return format(date, formatStr, { locale: es });
    } catch (error) {
      return 'Error en fecha';
    }
  };

  const getFileUrl = (fileKey: string) => {
    if (!fileKey) return '/placeholder-error.png';
    
    if (fileKey.startsWith('http')) return fileKey;

    const baseUrl = process.env.NEXT_PUBLIC_BUCKET_URL; 
    
    const cleanKey = fileKey.startsWith('/') ? fileKey.slice(1) : fileKey;
    
    return `${baseUrl}/${cleanKey}`;
  };

  const isImageFile = (fileKey: string) => {
    if (!fileKey) return false;
    const ext = fileKey.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };
  
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          {/* HEADER */}
          <div className="px-6 py-5 border-b border-gray-100 shrink-0 bg-gray-50/50">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-brand" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                    Resultado Esperado
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700">
                    {result.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{result.title}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{result.description}</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TABS NAVEGACIÓN */}
          <div className="flex border-b border-gray-100 px-6 shrink-0">
            <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              <ListTodo className="w-4 h-4" /> Tareas ({result.tasks?.length || 0})
            </button>
            <button onClick={() => setActiveTab('evidences')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'evidences' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              <ShieldCheck className="w-4 h-4" /> Evidencias ({result.evidences?.length || 0})
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              <History className="w-4 h-4" /> Historial de Cambios
            </button>
          </div>

          {/* CONTENIDO DEL TAB */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
            
            {/* TAB: TAREAS */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <form onSubmit={handleCreateTask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="¿Qué tarea necesitas hacer para lograr este resultado?"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    disabled={isAddingTask}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow disabled:bg-gray-50"
                  />
                  <button 
                    type="submit" 
                    disabled={!newTaskTitle.trim() || isAddingTask}
                    className="flex items-center justify-center px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </form>

                {!result.tasks || result.tasks.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl">
                    <ListTodo className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Aún no hay subtareas.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.tasks.map((task: any) => {
                      const isDone = task.status === 'DONE';
                      const isLoading = loadingTasks[task.id];

                      return (
                        <div key={task.id} className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-brand/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => !isLoading && handleToggleTask(task)}>
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 text-brand animate-spin" />
                            ) : (
                              <input 
                                type="checkbox" 
                                checked={isDone} 
                                readOnly 
                                className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer" 
                              />
                            )}
                            <span className={`text-sm font-medium transition-all ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              {task.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 rounded text-gray-600">
                              {task.status}
                            </span>
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={isLoading}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                              title="Eliminar tarea"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: EVIDENCIAS */}
            {activeTab === 'evidences' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {!result.evidences || result.evidences.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl">
                    <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Aún no se han subido evidencias.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.evidences.map((ev: any) => (
                      <div key={ev.id} className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-2 py-1 rounded">
                            {ev.type === 'URL' ? 'Enlace Web' : 'Archivo Adjunto'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {safeFormatDate(ev.createdAt, "d MMM yyyy")}
                          </span>
                        </div>
                        
                        {/* RENDERIZADO CONDICIONAL DE EVIDENCIA */}
                        {ev.type === 'URL' ? (
                          <a 
                            href={ev.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 break-all bg-blue-50/50 p-3 rounded-lg border border-blue-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" /> {ev.url}
                          </a>
                        ) : isImageFile(ev.fileKey) ? (
                          <div 
                            onClick={() => setSelectedImage(ev.url)} // Usamos ev.url directamente
                            className="relative w-full h-32 mt-2 rounded-lg border border-gray-200 overflow-hidden cursor-zoom-in group bg-gray-100"
                          >
                            <img 
                              src={ev.url} // Usamos ev.url directamente
                              alt="Evidencia adjunta" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                            </div>
                          </div>
                        ) : (
                          <a 
                            href={ev.url} // Usamos ev.url directamente
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-brand bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-brand/30 transition-colors mt-2"
                          >
                            <Download className="w-4 h-4 shrink-0" /> Ver / Descargar Archivo
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: HISTORIAL */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {!result.history || result.history.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl">
                    <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No hay registros de cambios aún.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-4 mt-2">
                    {result.history.map((log: any) => (
                      <div key={log.id} className="relative pl-6 group">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-brand shadow-sm group-hover:scale-125 transition-transform"></div>
                        
                        <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-sm hover:border-brand/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-900 font-medium">
                              Cambió de <span className="font-bold text-gray-500">{log.previousStatus}</span> a <span className="font-bold text-brand">{log.newStatus}</span>
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                              {safeFormatDate(log.createdAt, "d MMM, HH:mm")}
                            </span>
                          </div>
                          
                          {log.reason && (
                            <div className="mt-3 bg-orange-50/80 border border-orange-100 p-3 rounded-lg flex gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-orange-800 italic">"{log.reason}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* MODAL DEL VISOR DE IMÁGENES (SUPERPUESTO) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Evidencia expandida" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-800"
            />
          </div>
        </div>
      )}
    </>
  );
}