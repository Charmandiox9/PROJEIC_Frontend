import Sidebar from '@/components/dashboard/Sidebar';

export default function LoggedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 w-full overflow-x-hidden dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
