'use client';

export default function RoleBadge({ role, label }: { role: string; label: string }) {
    const base =
        'inline-flex items-center justify-center min-w-[5.5rem] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap';

    if (role === 'LEADER')
        return (
            <span className={`${base} text-purple-700 bg-purple-100 border border-purple-300 dark:text-purple-300 dark:bg-purple-900/40 dark:border-purple-700`}>
                {label}
            </span>
        );

    if (role === 'SUPERVISOR')
        return (
            <span className={`${base} text-orange-700 bg-orange-100 border border-orange-300 dark:text-orange-300 dark:bg-orange-900/40 dark:border-orange-700`}>
                {label}
            </span>
        );

    if (role === 'EXTERNAL')
        return (
            <span className={`${base} text-gray-600 bg-gray-100 border border-gray-300 dark:text-gray-400 dark:bg-gray-700/40 dark:border-gray-600`}>
                {label}
            </span>
        );

    return (
        <span className={`${base} text-blue-700 bg-blue-100 border border-blue-300 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-700`}>
            {label}
        </span>
    );
}
