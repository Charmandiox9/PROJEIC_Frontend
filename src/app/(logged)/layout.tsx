import Sidebar from '@/components/dashboard/Sidebar';

export default function LoggedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-surface-page">
      <Sidebar />
      <main className="flex-1 w-full min-w-0 overflow-x-hidden pt-0">
        {children}
      </main>
    </div>
  );
}
