'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  useSessionTimeout({ enabled: isAuthenticated });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-navy-800">
      <Sidebar />
      <Header />
      <main
        className={`pt-24 transition-all duration-300 ml-0 ${
          sidebarOpen ? 'md:ml-72' : 'md:ml-16'
        }`}
      >
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
