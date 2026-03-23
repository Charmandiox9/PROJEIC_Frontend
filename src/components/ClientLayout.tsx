'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const PRIVATE_ROUTES = ['/profile'];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some(route => pathname.startsWith(route));
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  console.log('PATHNAME:', pathname);

  if (isPrivateRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}