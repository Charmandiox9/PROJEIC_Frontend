import Sidebar from '@/components/dashboard/Sidebar';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}