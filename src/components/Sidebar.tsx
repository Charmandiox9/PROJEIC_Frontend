'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Panel Central', href: '/dashboard', icon: '📊' },
    { name: 'Mis Proyectos', href: '/proyectos', icon: '📁' },
    { name: 'Ayudantías', href: '/ayudantias', icon: '👨‍🏫' },
    { name: 'Configuración', href: '/configuracion', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col h-[calc(100vh-73px)] sticky top-[73px]">
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
          Menú Principal
        </p>
        
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Tarjeta de información en la parte inferior */}
      <div className="p-4 m-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1">PROJEIC v1.0</p>
        <p className="text-[10px] text-zinc-500">Entorno de desarrollo</p>
      </div>
    </aside>
  );
}