'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MotionProvider } from '@/components/providers/motion-provider';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  useSessionTimeout({ enabled: isAuthenticated });

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <Sidebar />
      <Header />
      <main
        className={`pt-24 transition-all duration-300 ml-0 ${
          sidebarOpen ? 'md:ml-72' : 'md:ml-16'
        }`}
      >
        {/* keyed on the route so every navigation replays the entrance */}
        <div key={pathname} className="p-4 md:p-8 page-enter">
          {children}
        </div>
        <MotionProvider />
      </main>
    </div>
  );
}
