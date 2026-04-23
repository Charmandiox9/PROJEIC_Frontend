'use client';

import { Columns } from 'lucide-react';

export default function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-14 h-14 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
        <Columns className="w-7 h-7 text-text-secondary" />
      </div>
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <p className="text-sm text-text-muted mt-1">Esta sección estará disponible próximamente.</p>
    </div>
  );
}
