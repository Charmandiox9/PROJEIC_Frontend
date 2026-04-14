'use client';

import { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { ADD_PROJECT_MEMBER } from '@/graphql/misc/operations';

interface AddMemberModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, projectId, onClose, onSuccess }: AddMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    role: 'STUDENT',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) {
    if (showSuccess) setShowSuccess(false);
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchGraphQL({
        query: ADD_PROJECT_MEMBER,
        variables: {
          input: {
            projectId,
            email: formData.email,
            role: formData.role
          }
        }
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Error al agregar al miembro.');
      }

      onSuccess(); // Trigger parent reload if needed
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al invitar al usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteAnother = () => {
    setShowSuccess(false);
    setFormData({ email: '', role: 'STUDENT' });
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand" /> Añadir Equipo
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-text-primary hover:bg-surface-tertiary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-8 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Invitacion enviada!</h3>
              <p className="text-sm text-text-muted mt-2">
                El usuario ha sido invitado al proyecto exitosamente.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-text-primary bg-surface-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                Cerrar ventana
              </button>
              <button
                type="button"
                onClick={handleInviteAnother}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
              >
                Invitar a otro
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Correo Institucional del usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-shadow bg-surface-primary text-text-primary placeholder:text-text-muted"
                placeholder="ejemplo@alumnos.ucn.cl"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">
                Rol en el proyecto <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-surface-primary text-text-primary"
              >
                <option value="STUDENT">Estudiante</option>
                <option value="LEADER">Líder de Proyecto</option>
                <option value="SUPERVISOR">Supervisor (Académico)</option>
                <option value="EXTERNAL">Colaborador Externo</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border-primary flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-primary border border-border-secondary rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
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
                    Invitando...
                  </>
                ) : (
                  'Agregar Miembro'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
