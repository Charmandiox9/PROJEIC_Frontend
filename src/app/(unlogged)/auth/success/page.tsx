'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { fetchGraphQL } from '@/lib/graphQLClient';

interface GoogleUserPayload {
  email: string;
  sub: string;
  name: string;
  avatar?: string;
}

const REDEEM_INVITATION_MUTATION = `
  mutation RedeemProjectInvitation($token: String!) {
    redeemProjectInvitation(token: $token) {
      id
      projectId
    }
  }
`;

function AuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');

      if (token) {
        localStorage.setItem('projeic_accessToken', token);

        try {
          const decoded = jwtDecode<GoogleUserPayload>(token);
          const userData = {
            userId: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            avatarUrl: decoded.avatar
          };
          localStorage.setItem('projeic_user', JSON.stringify(userData));
        } catch (error) {
          console.error("Error al decodificar JWT", error);
        }

        const pendingInviteToken = localStorage.getItem('pending_invite_token');
        
        if (pendingInviteToken) {
          try {
            const response = await fetchGraphQL({
              query: REDEEM_INVITATION_MUTATION,
              variables: { token: pendingInviteToken }
            });

            localStorage.removeItem('pending_invite_token');

            if (!response.errors) {
              const projectId = response.redeemProjectInvitation.projectId;
              window.location.href = `/projeic/misc/proyectos/${projectId}`;
              return;
            }
          } catch (error) {
            console.error("Error al redimir la invitación:", error);
            localStorage.removeItem('pending_invite_token');
          }
        }

        window.location.href = '/projeic/misc/profile';
      } else {
        window.location.href = '/projeic/auth/login';
      }
    };

    processAuth();
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center h-screen bg-surface-secondary">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-surface-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      }
    >
      <AuthSuccessInner />
    </Suspense>
  );
}
