'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, UploadCloud, Link as LinkIcon, FileCheck } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { UPDATE_RESULT_STATUS } from '@/graphql/hybrid/operations';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

interface UpdateResultStatusModalProps {
  isOpen: boolean;
  result: any;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Iniciado (Sin avance)' },
  { value: 'STARTED', label: 'En Progreso (10%)' },
  { value: 'IN_REVIEW', label: 'En Revisión (50%)' },
  { value: 'VALIDATED', label: 'Testeado (80%)' },
  { value: 'COMPLETED', label: 'Completado Real (100%)' },
];

const REQUIRES_EVIDENCE = ['IN_REVIEW', 'VALIDATED', 'COMPLETED'];

const STATUS_WEIGHT: Record<string, number> = {
  NOT_STARTED: 0,
  STARTED: 1,
  IN_REVIEW: 2,
  VALIDATED: 3,
  COMPLETED: 4,
};

export default function UpdateResultStatusModal({ isOpen, result, onClose, onSuccess }: UpdateResultStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [status, setStatus] = useState(result?.status || 'NOT_STARTED');
  const [reason, setReason] = useState('');
  const [evidenceType, setEvidenceType] = useState<'NONE' | 'URL' | 'FILE'>('NONE');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && result) {
      setStatus(result.status);
      setReason('');
      setEvidenceType('NONE');
      setEvidenceUrl('');
      setEvidenceFile(null);
      setError(null);
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const currentWeight = STATUS_WEIGHT[result.status];
  const selectedWeight = STATUS_WEIGHT[status];
  
  const isAdvancing = selectedWeight > currentWeight;
  const isRegressing = selectedWeight < currentWeight;
  
  const isEvidenceRequired = isAdvancing && REQUIRES_EVIDENCE.includes(status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (isEvidenceRequired && evidenceType === 'NONE') {
      setError('Debes adjuntar una nueva evidencia (Link o Archivo) para poder avanzar a este estado.');
      setIsSubmitting(false);
      return;
    }

    if (isRegressing && !reason.trim()) {
      setError('Debes explicar el motivo por el cual retrocedes el estado.');
      setIsSubmitting(false);
      return;
    }

    if (evidenceType === 'URL' && !evidenceUrl) {
      setError('Debes ingresar una URL válida.');
      setIsSubmitting(false);
      return;
    }

    if (evidenceType === 'FILE' && !evidenceFile) {
      setError('Debes seleccionar un archivo de tu computadora.');
      setIsSubmitting(false);
      return;
    }

    try {
      let uploadedFileKey = null;

      if (evidenceType === 'FILE' && evidenceFile) {
        const formData = new FormData();
        formData.append('file', evidenceFile);

        const uploadRes = await fetch(`/projeic/api/uploads/evidence`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Error al subir el archivo al servidor');
        
        const uploadData = await uploadRes.json();
        uploadedFileKey = uploadData.fileKey;
      }

      const response = await fetchGraphQL({
        query: UPDATE_RESULT_STATUS,
        variables: {
          input: {
            resultId: result.id,
            status: status,
            reason: isRegressing ? reason : undefined,
            evidenceType: evidenceType === 'NONE' ? undefined : evidenceType,
            evidenceUrl: evidenceType === 'URL' ? evidenceUrl : undefined,
            evidenceFileKey: uploadedFileKey || undefined,
          }
        }
      });

      if (response.errors) throw new Error(response.errors[0].message);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-bold text-gray-900">Actualizar Progreso</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Resultado Seleccionado</p>
            <p className="font-medium text-gray-900 line-clamp-2">{result.title}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2 items-start border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <Select 
              id="status" 
              label="Nuevo Estado" 
              name="status" 
              value={status} 
              onChange={(e) => {
                setStatus(e.target.value);
                setError(null);
              }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>

          {/* SECCIÓN DE RETROCESO: Aparece dinámicamente si el estado baja */}
          {isRegressing && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3 animate-in slide-in-from-top-1">
              <div className="flex gap-2 text-orange-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm font-bold leading-snug">Se requiere justificación</p>
              </div>
              <p className="text-xs text-orange-600/80 mb-2">Por favor, explica por qué este resultado retrocede de estado.</p>
              <textarea
                required
                placeholder="Ej: El profesor solicitó correcciones en la arquitectura o los tests fallaron..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow bg-white resize-none"
                rows={3}
              />
            </div>
          )}

          {/* ZONA DE EVIDENCIA SIEMPRE VISIBLE */}
          <div className={`p-4 rounded-xl space-y-4 transition-colors ${isEvidenceRequired ? 'border-2 border-brand/40 bg-brand/5' : 'border border-gray-200 bg-gray-50'}`}>
            <div className="flex items-start gap-2">
              {isEvidenceRequired ? (
                <>
                  <AlertCircle className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <p className="text-sm text-brand-dark font-medium leading-snug">
                    <strong className="uppercase text-[10px] tracking-wider bg-brand text-white px-1.5 py-0.5 rounded mr-1">Obligatorio</strong><br/>
                    Este avance es un hito clave. Debes respaldarlo adjuntando una evidencia.
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 font-medium leading-snug">
                    <strong className="uppercase text-[10px] tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mr-1">Opcional</strong><br/>
                    ¿Quieres adjuntar algún respaldo a tu estado actual?
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEvidenceType('NONE');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${evidenceType === 'NONE' ? 'border-brand bg-white text-brand' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
              >
                <X className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Ninguna</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvidenceType('URL');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${evidenceType === 'URL' ? 'border-brand bg-white text-brand' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
              >
                <LinkIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Link (URL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvidenceType('FILE');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${evidenceType === 'FILE' ? 'border-brand bg-white text-brand' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
              >
                <UploadCloud className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Archivo</span>
              </button>
            </div>

            {evidenceType === 'URL' && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <Input
                  id="evidenceUrl"
                  name="evidenceUrl"
                  type="url"
                  placeholder="Ej: https://github.com/... o https://figma.com/..."
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {evidenceType === 'FILE' && (
              <div className="relative animate-in fade-in slide-in-from-top-1">
                <input
                  type="file"
                  id="evidenceFile"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer border border-gray-300 rounded-lg p-2 bg-white transition-colors"
                  required
                />
                {evidenceFile && <p className="text-xs text-green-600 mt-2 font-medium">✓ Archivo listo: {evidenceFile.name}</p>}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || (isEvidenceRequired && evidenceType === 'NONE') || (isRegressing && !reason.trim())} 
              className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              ) : isRegressing ? (
                'Confirmar Retroceso'
              ) : (
                'Confirmar Avance'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}