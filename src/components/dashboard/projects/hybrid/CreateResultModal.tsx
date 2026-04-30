'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle, Target } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_EXPECTED_RESULT } from '@/graphql/hybrid/operations';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { AVATAR_FALLBACK_URL } from '@/lib/constants';
import { useT } from '@/hooks/useT';

interface CreateResultModalProps {
  isOpen: boolean;
  projectId: string;
  members: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateResultModal({ isOpen, projectId, members, onClose, onSuccess }: CreateResultModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ownerId: '',
  });

  if (!isOpen) return null;

  const activeMembers = members?.filter((m: any) => m.status === 'ACTIVE') || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.ownerId) {
      setError(t('createResult.errorOwner'));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchGraphQL({
        query: CREATE_EXPECTED_RESULT,
        variables: {
          input: {
            title: formData.title,
            description: formData.description,
            projectId: projectId,
            ownerId: formData.ownerId,
          }
        }
      });

      if (response.errors) throw new Error(response.errors[0].message);

      setFormData({ title: '', description: '', ownerId: '' });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('createResult.errorCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('createResult.title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Input id="title" label={t('createResult.fieldTitle')} name="title" required placeholder="Ej: Base de datos conectada y funcional" value={formData.title} onChange={handleChange} />

          <Textarea id="description" label={t('createResult.fieldDescription')} name="description" rows={3} placeholder="¿Qué debe ocurrir para considerar esto como completado?" value={formData.description} onChange={handleChange} />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('createResult.fieldOwner')}
            </label>
            <div className="relative">
              <Select id="ownerId" name="ownerId" value={formData.ownerId} onChange={handleChange} required>
                <option value="">{t('createResult.selectOwner')}</option>
                {activeMembers.map((member: any) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name} ({member.role})
                  </option>
                ))}
              </Select>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">{t('createResult.ownerHint')}</p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
              {t('modal.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover flex items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('modal.saving')}</> : t('createResult.createBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}