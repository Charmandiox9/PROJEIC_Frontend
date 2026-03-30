'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { CREATE_PROJECT } from '@/graphql/misc/operations';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    status: 'ACTIVE',
    methodology: 'KANBAN',
    isPublic: false
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Type narrowing to safely access 'checked' on inputs
    const isCheckbox = type === 'checkbox';
    const checkedInfo = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checkedInfo : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchGraphQL({
        query: CREATE_PROJECT,
        variables: {
          input: {
            name: formData.name,
            description: formData.description || undefined,
            color: formData.color,
            status: formData.status,
            methodology: formData.methodology,
            isPublic: formData.isPublic,
          }
        }
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Error al crear el proyecto');
      }

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        status: 'ACTIVE',
        methodology: 'KANBAN',
        isPublic: false
      });
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Crear un nuevo proyecto</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del proyecto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              minLength={3}
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow"
              placeholder="Ej: Plataforma de Trazabilidad UCN"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow resize-none"
              placeholder="Un breve resumen de la meta del proyecto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado Inicial
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-white"
              >
                <option value="STARTING">Iniciando</option>
                <option value="ACTIVE">Activo</option>
                <option value="ON_HOLD">En pausa</option>
              </select>
            </div>
            <div>
              <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-1">
                Metodología
              </label>
              <select
                id="methodology"
                name="methodology"
                value={formData.methodology}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-white"
              >
                <option value="KANBAN">Kanban</option>
                <option value="SCRUM">Scrum</option>
                <option value="SCRUMBAN">Scrumban</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color de etiqueta:
              </label>
              <div className="relative">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden color-input appearance-none bg-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
              />
              <span className="text-sm font-medium text-gray-700">Proyecto público</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Proyecto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
