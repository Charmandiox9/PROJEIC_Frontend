'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import PublicFooter from './layout/PublicFooter';

const PRIVATE_ROUTES = ['/misc', '/admin'];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some(route => pathname.startsWith(route)) || pathname.startsWith('/auth');
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
      <main className="flex-1 dark:bg-brand-dark">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}