'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface GoogleUserPayload {
  email: string;
  sub: string;
  name: string;
  avatar?: string;
}

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('projeic_accessToken', token);

      try {
        const decoded = jwtDecode<GoogleUserPayload>(token);

        const userData = {
          id: decoded.sub,
          email: decoded.email,
          nombre: decoded.name,
          avatarUrl: decoded.avatar
        };

        localStorage.setItem('projeic_user', JSON.stringify(userData));
      } catch (error) {
        // Falló en la decodificación
      }

      window.location.href = '/projeic/profile';
    } else {
      window.location.href = '/projeic/auth/login';
    }
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
