'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthProvider';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_TASK, UPDATE_TASK, ADD_COMMENT_TO_TASK } from '@/graphql/tasks/operations';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { useLocale } from '@/hooks/useLocale';
import { useT } from '@/hooks/useT';

interface ProjectMember {
  id: string;
  status: string;
  user: { id: string; name: string; avatarUrl?: string | null };
}

interface Board { id: string; name: string; }

interface TaskFormData {
  title: string;
  description: string;
  boardId: string;
  assigneeId: string;
  priority: string;
  startDate: string;
  dueDate: string;
  tags?: string[];
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBoardId?: string;
  taskToEdit?: any;
  members: ProjectMember[];
  boards: Board[];
  projectId: string;
  sprintId?: string;
  userRole?: string | null;
}

const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const getStatusFromBoardName = (boardName: string): string => {
  const name = boardName.toLowerCase();
  if (name.includes('backlog')) return 'BACKLOG';
  if (name.includes('to do') || name.includes('todo')) return 'TODO';
  if (name.includes('progress') || name.includes('progreso')) return 'IN_PROGRESS';
  if (name.includes('review') || name.includes('revisión')) return 'IN_REVIEW';
  if (name.includes('done') || name.includes('completado')) return 'DONE';
  return 'TODO';
};

export default function CreateTaskModal({
  isOpen, onClose, defaultBoardId, taskToEdit, members, boards, projectId, sprintId, userRole
}: CreateTaskModalProps) {
  const { user } = useAuth();
  const { locale } = useLocale();
  const { t } = useT();

  const dateLocale = locale === 'en' ? enUS : locale === 'pt' ? pt : es;

  const PRIORITIES = [
    { value: 'LOW', label: t('createTask.priorityLow') },
    { value: 'MEDIUM', label: t('createTask.priorityMedium') },
    { value: 'HIGH', label: t('createTask.priorityHigh') },
    { value: 'URGENT', label: t('createTask.priorityUrgent') },
  ];
  
  const isLeader = userRole === 'LEADER';
  const isSupervisor = userRole === 'SUPERVISOR';
  const isStudent = userRole === 'STUDENT';
  const isExternal = userRole === 'EXTERNAL';

  const isMyTask = taskToEdit && taskToEdit.assigneeId === user?.userId;
  const isEditing = !!taskToEdit;

  const canEditDetails = isLeader || (!isEditing && isStudent) || (isStudent && isMyTask);
  
  const canChangeStatus = isLeader || isSupervisor || (!isEditing && isStudent) || (isStudent && isMyTask);
  
  const canChangeAssignee = isLeader || (!isEditing && isStudent) || (isStudent && isMyTask);

  const isCompletelyReadOnly = !canEditDetails && !canChangeStatus;


  const buildInitialForm = (): TaskFormData => {
    if (taskToEdit) {
      return {
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        boardId: taskToEdit.boardId || '',
        assigneeId: taskToEdit.assigneeId || '',
        priority: taskToEdit.priority || 'MEDIUM',
        startDate: taskToEdit.startDate ? taskToEdit.startDate.split('T')[0] : '',
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
        tags: taskToEdit.tags || [],
      };
    }
    return {
      title: '',
      description: '',
      boardId: defaultBoardId || (boards.length > 0 ? boards[0].id : ''),
      assigneeId: '',
      priority: 'MEDIUM',
      startDate: '',
      dueDate: '',
      tags: [],
    };
  };

  const [formData, setFormData] = useState<TaskFormData>(buildInitialForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialForm());
      setIsSubmitting(false);
      setError(null);
      setNewComment('');
      setLocalComments(taskToEdit?.comments || []);
    }
  }, [isOpen, taskToEdit, defaultBoardId, boards]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompletelyReadOnly) return;

    const selectedBoard = boards.find(b => b.id === formData.boardId);
    let calculatedStatus = selectedBoard ? getStatusFromBoardName(selectedBoard.name) : 'TODO';

    if (formData.boardId && formData.boardId.startsWith('fake-')) {
      const statusMap: any = { 'fake-backlog': 'BACKLOG', 'fake-todo': 'TODO', 'fake-inprogress': 'IN_PROGRESS', 'fake-done': 'DONE' };
      calculatedStatus = statusMap[formData.boardId] || calculatedStatus;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalDueDate: string | undefined = undefined;
      if (formData.dueDate) {
        finalDueDate = `${formData.dueDate}T23:59:59.000Z`;
      }

      if (isEditing) {
        const input: any = {
          id: taskToEdit.id,
        };

        if (canChangeStatus) {
          input.boardId = (formData.boardId && formData.boardId.startsWith('fake-')) ? null : (formData.boardId || undefined);
          input.status = calculatedStatus;
        }

        if (canEditDetails) {
          input.title = formData.title;
          input.description = formData.description || undefined;
          input.priority = formData.priority;
          input.startDate = formData.startDate ? `${formData.startDate}T00:00:00.000Z` : undefined;
          input.dueDate = finalDueDate;
          input.tags = formData.tags;
        }

        if (canChangeAssignee) {
          input.assigneeId = formData.assigneeId || undefined;
        }
        await fetchGraphQL({ query: UPDATE_TASK, variables: { input } });
      } else {
        const input = {
          title: formData.title,
          projectId: projectId,
          creatorId: user?.userId || 'unknown',
          description: formData.description || undefined,
          boardId: (formData.boardId && formData.boardId.startsWith('fake-')) ? undefined : (formData.boardId || undefined),
          assigneeId: formData.assigneeId || undefined,
          priority: formData.priority,
          startDate: formData.startDate ? `${formData.startDate}T00:00:00.000Z` : undefined,
          dueDate: finalDueDate,
          sprintId: sprintId || undefined,
          tags: formData.tags,
        };
        const createdResponse = await fetchGraphQL({ query: CREATE_TASK, variables: { input } });

        if (calculatedStatus && calculatedStatus !== 'BACKLOG' && createdResponse?.createTask?.id) {
          await fetchGraphQL({ query: UPDATE_TASK, variables: { input: { id: createdResponse.createTask.id, status: calculatedStatus } } });
        }
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('createTask.errorSaving'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !taskToEdit) return;
    setIsCommenting(true);
    try {
      const response = await fetchGraphQL({
        query: ADD_COMMENT_TO_TASK,
        variables: { taskId: taskToEdit.id, content: newComment.trim() }
      });
      if (response?.addCommentToTask) {
        setLocalComments(prev => [...prev, response.addCommentToTask]);
        setNewComment('');
      }
    } catch (err: any) {
      console.error("Error al añadir comentario:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  const modalTitle = isCompletelyReadOnly ? t('createTask.titleReadOnly') : (isEditing ? t('createTask.titleEdit') : t('createTask.titleNew'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-surface-primary z-10">
          <h2 className="text-lg font-bold text-text-primary">
            {modalTitle}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-text-primary hover:bg-surface-tertiary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={isCompletelyReadOnly ? (e) => e.preventDefault() : handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border rounded-lg">{error}</div>}

          <Input id="task-title" label={t('createTask.fieldTitle')} name="title" required value={formData.title} onChange={handleChange} disabled={!canEditDetails} />
          <Textarea id="task-description" label={t('createTask.fieldDescription')} name="description" rows={3} value={formData.description} onChange={handleChange} disabled={!canEditDetails} />

          <div className="grid grid-cols-2 gap-4">
            <Select id="task-board" label={t('createTask.fieldColumn')} name="boardId" value={formData.boardId} onChange={handleChange} disabled={!canChangeStatus} required>
              <option value="" disabled>{t('createTask.selectColumn')}</option>
              {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select id="task-priority" label={t('createTask.fieldPriority')} name="priority" value={formData.priority} onChange={handleChange} disabled={!canEditDetails} required>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select id="task-assigned" label={t('createTask.fieldAssignee')} name="assigneeId" value={formData.assigneeId} onChange={handleChange} disabled={!canChangeAssignee}>
              <option value="">{t('createTask.noAssignee')}</option>
              {members.map((m) => (
                <option key={m.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="task-start-date" label={t('createTask.fieldStartDate')} name="startDate" type="date" value={formData.startDate} onChange={handleChange} disabled={!canEditDetails} max={formData.dueDate || undefined} />
            <Input id="task-due-date" label={t('createTask.fieldDueDate')} name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} disabled={!canEditDetails} min={formData.startDate || undefined} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">{t('createTask.fieldTags')}</label>
            <div className={`flex flex-wrap gap-2 p-2 border border-border-secondary rounded-lg min-h-[42px] bg-surface-primary ${!canEditDetails ? 'opacity-70 bg-surface-secondary/30' : 'focus-within:ring-2 focus-within:ring-brand'}`}>
              {formData.tags?.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-brand/10 text-brand text-xs font-bold rounded-md">
                  {tag}
                  {canEditDetails && (
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-dark">×</button>
                  )}
                </span>
              ))}
              {canEditDetails && (
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="flex-1 outline-none text-sm min-w-[100px] bg-transparent text-text-primary placeholder:text-text-muted"
                  placeholder="prio, bug, frontend..."
                />
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-6 mt-4 border-t border-border-secondary">
              <h3 className="text-sm font-bold text-text-primary mb-4">{t('createTask.comments')}</h3>
              <div className="space-y-4 mb-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {localComments.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-4">{t('createTask.noComments')}</p>
                ) : (
                  localComments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 bg-surface-secondary/30 p-3 rounded-lg border border-border-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                        {comment.author.avatarUrl ? (
                          <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-full h-full object-cover" />
                        ) : comment.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="text-sm font-bold text-text-primary truncate">{comment.author.name}</span>
                          <span className="text-[10px] text-text-muted shrink-0">
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale }) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap break-words">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!isExternal && (
                <div className="flex gap-2">
                  <Textarea 
                    id="new-comment"
                    placeholder="Escribe un comentario..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1 text-sm resize-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddComment}
                    disabled={isCommenting || !newComment.trim()}
                    className="px-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                  >
                    {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border-primary flex justify-end gap-3">
            {isCompletelyReadOnly ? (
              <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark">
                {t('modal.close')}
              </button>
            ) : (
              <>
                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-text-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary bg-surface-primary">{t('modal.cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark flex items-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('modal.saving')}</> : isEditing ? t('createTask.saveChanges') : t('createTask.createTask')}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}