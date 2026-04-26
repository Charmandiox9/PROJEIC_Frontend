'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { RESPOND_TO_INVITATION } from '@/graphql/misc/operations';
import { CheckCircle, XCircle, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectInvitePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('projeic_accessToken');
    if (!token) {
      localStorage.setItem('redirect_after_login', window.location.pathname);
      router.push('/auth/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleResponse = async (accept: boolean) => {
    setLoading(true);
    try {
      const response = await fetchGraphQL({
        query: RESPOND_TO_INVITATION,
        variables: { projectId, accept },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Error al procesar la invitación');
      }

      if (accept) {
        toast.success('¡Bienvenido al proyecto!');
        router.push(`/misc/proyectos/${projectId}`);
      } else {
        toast.info('Invitación rechazada.');
        router.push('/misc/profile');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-secondary"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="bg-surface-primary max-w-md w-full rounded-2xl shadow-xl border border-border-primary p-8 text-center animate-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Invitación a Proyecto
        </h1>
        <p className="text-text-muted mb-8">
          Has sido invitado a colaborar en un proyecto de PROJEIC. ¿Deseas unirte al equipo?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleResponse(false)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-surface-secondary border border-border-secondary hover:bg-surface-tertiary text-text-primary font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Rechazar
          </button>
          
          <button
            onClick={() => handleResponse(true)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}