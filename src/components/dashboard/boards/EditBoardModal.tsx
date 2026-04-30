'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Palette, Hash } from 'lucide-react';
import Input from '@/components/ui/Input';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { UPDATE_BOARD } from '@/graphql/boards/operations';
import { useT } from '@/hooks/useT';

interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  board: any;
}

const PRESET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function EditBoardModal({ isOpen, onClose, onSuccess, board }: EditBoardModalProps) {
  const { t } = useT();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [wipLimit, setWipLimit] = useState<number | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && board) {
      setName(board.name || '');
      setColor(board.color || '#3B82F6');
      setWipLimit(board.wipLimit || '');
    }
  }, [isOpen, board]);

  if (!isOpen || !board) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const input: any = {
        id: board.id,
        name: name.trim(),
        color: color,
        wipLimit: wipLimit === '' ? null : Number(wipLimit) 
      };

      await fetchGraphQL({
        query: UPDATE_BOARD,
        variables: { input }
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error actualizando columna:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-surface-primary">
          <h2 className="text-lg font-bold text-text-primary">{t('editBoard.title')}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-text-primary hover:bg-surface-tertiary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input id="board-name" label={t('editBoard.fieldName')} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <Hash className="w-4 h-4" /> {t('editBoard.fieldWip')}
            </label>
            <Input 
              id="board-wip" 
              type="number" 
              min="1"
              placeholder="Ej: 5 (Vacío para sin límite)"
              value={wipLimit} 
              onChange={(e) => setWipLimit(e.target.value ? Number(e.target.value) : '')} 
            />
            <p className="text-xs text-text-muted">{t('editBoard.wipDesc')}</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <Palette className="w-4 h-4" /> {t('editBoard.fieldColor')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-text-primary scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden"
                title="Color personalizado"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-primary flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-text-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary">
              {t('modal.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-dark flex items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('modal.saving')}</> : t('editBoard.saveBtn')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}