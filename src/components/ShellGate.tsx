'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

/** Login sahifasi qobiqsiz (sidebar/topbar'siz) ko'rsatiladi. */
export const ShellGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  if (pathname.startsWith('/login')) return <>{children}</>;
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
};
