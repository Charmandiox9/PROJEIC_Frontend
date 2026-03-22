'use client';

import { useAuth } from '@/context/AuthProvider';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <main className="flex-1 bg-zinc-50 dark:bg-black min-h-[calc(100vh-73px)]" />;
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-73px)]">
      {/* Si está logueado, inyectamos el Sidebar a la izquierda */}
      {isAuthenticated && <Sidebar />}
      
      {/* El contenido de la página se acomoda a la derecha */}
      <main className="flex-1 bg-zinc-50 dark:bg-black overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}