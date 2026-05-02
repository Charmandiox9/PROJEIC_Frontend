'use client';

import { useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_DOCUMENT_UPLOAD_URL, SAVE_DOCUMENT_RECORD, GET_DOCUMENT_DOWNLOAD_URL } from '@/graphql/misc/operations';
import { UploadCloud, Loader2, FileText, Download, File } from 'lucide-react';
import { toast } from 'sonner';
import { useT } from '@/hooks/useT';

interface ProjectDocument {
  id: string;
  name: string;
  r2Key: string;
  size: number;
  createdAt: string;
  uploadedBy: {
    name: string;
  };
}

interface TabDocumentosProps {
  projectId: string;
  isLeader: boolean;
  documents: ProjectDocument[];
  onRefresh: () => void;
}

export default function TabDocumentos({ projectId, isLeader, documents, onRefresh }: TabDocumentosProps) {
  const { t } = useT();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(t('tabDocumentos.errorTooLarge'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(t('tabDocumentos.statusRequesting'));

    try {
      const uploadUrlResponse = await fetchGraphQL({
        query: GET_DOCUMENT_UPLOAD_URL,
        variables: { projectId, fileName: file.name, fileType: file.type || 'application/octet-stream' }
      });

      const responseData = uploadUrlResponse.data || uploadUrlResponse;
      if (!responseData || !responseData.getDocumentUploadUrl) throw new Error(t('tabDocumentos.errorNoPermission'));

      const { uploadUrl, r2Key } = responseData.getDocumentUploadUrl;
      setUploadProgress(t('tabDocumentos.statusUploading'));
      const r2Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      if (!r2Response.ok) throw new Error(t('tabDocumentos.errorCloudflare'));

      setUploadProgress(t('tabDocumentos.statusSaving'));
      const saveResponse = await fetchGraphQL({
        query: SAVE_DOCUMENT_RECORD,
        variables: {
          input: { projectId, name: file.name, r2Key, fileType: file.type || 'application/octet-stream', size: file.size }
        }
      });

      const saveData = saveResponse.data || saveResponse;
      if (!saveData || !saveData.saveDocumentRecord) throw new Error(t('tabDocumentos.errorSaving'));

      toast.success(t('tabDocumentos.successUpload'));
      
      onRefresh(); 

    } catch (error: any) {
      toast.error(error.message || t('tabDocumentos.errorUnexpected'));
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      e.target.value = ''; 
    }
  };

  const handleDownload = async (r2Key: string, fileName: string) => {
    try {
      const response = await fetchGraphQL({
        query: GET_DOCUMENT_DOWNLOAD_URL,
        variables: { r2Key }
      });

      const data = response.data || response;
      if (!data || !data.getDocumentDownloadUrl) {
        throw new Error(t('tabDocumentos.errorDownloadUrl'));
      }

      const downloadUrl = data.getDocumentDownloadUrl;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = fileName; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      toast.error(error.message || t('tabDocumentos.errorDownload'));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-primary p-6 rounded-2xl border border-border-primary shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{t('tabDocumentos.title')}</h3>
          <p className="text-sm text-text-muted mt-1">
            {t('tabDocumentos.description')}
          </p>
        </div>

        {isLeader && (
          <div>
            <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            <label htmlFor="doc-upload" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer ${isUploading ? 'bg-surface-secondary text-text-muted border border-border-primary cursor-not-allowed' : 'bg-brand hover:bg-brand-hover text-white'}`}>
              {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress}</> : <><UploadCloud className="w-4 h-4" /> {t('tabDocumentos.uploadBtn')}</>}
            </label>
          </div>
        )}
      </div>

      <div className="bg-surface-primary rounded-2xl border border-border-primary overflow-hidden">
        {!documents || documents.length === 0 ? (
          <div className="p-8 text-center text-text-muted flex flex-col items-center">
            <File className="w-12 h-12 mb-3 text-border-secondary" strokeWidth={1} />
            <p>{t('tabDocumentos.noDocuments')}</p>
            <p className="text-xs mt-1">{t('tabDocumentos.uploadFirst')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-primary">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-secondary/50 transition-colors">
                <div className="flex items-start gap-4 overflow-hidden">
                  <div className="bg-brand/10 p-3 rounded-xl shrink-0 text-brand">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
                      <span>{formatBytes(doc.size)}</span>
                      <span>•</span>
                      <span>{t('tabDocumentos.uploadedBy').replace('{name}', doc.uploadedBy?.name || t('tabDocumentos.defaultUser'))}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDownload(doc.r2Key, doc.name)}
                  className="p-2.5 text-text-muted hover:text-brand hover:bg-brand/10 rounded-xl transition-colors shrink-0"
                  title={t('tabDocumentos.downloadTitle')}
                >
                  <Download className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}