'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Self-Assessment', href: '/assessments', icon: ClipboardCheck },
  { name: 'Non-Conformities', href: '/non-conformities', icon: AlertTriangle, badge: 'count' },
  { name: 'Corrective Actions', href: '/actions', icon: FileText },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Standards', href: '/standards', icon: BookOpen },
];

const settingsNavigation = [
  { name: 'Team Access', href: '/admin/users', icon: Users, admin: true },
  { name: 'Organization Profile', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, mobileMenuOpen, toggleSidebar, closeMobileMenu } = useUIStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'QUALITY_MANAGER';

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const NavLink = ({ item, isMobile = false }: { item: typeof mainNavigation[0] & { badge?: string; admin?: boolean }; isMobile?: boolean }) => {
    const isActive = pathname.startsWith(item.href);
    const showLabel = sidebarOpen || isMobile;

    return (
      <Link
        href={item.href}
        className={clsx(
          'flex items-center py-3 rounded-2xl transition-all duration-200 group relative',
          showLabel ? 'gap-3 px-4' : 'justify-center px-2',
          isActive
            ? 'bg-white shadow-soft-1 text-mint-600'
            : 'text-slate-500 hover:bg-white hover:shadow-soft-1 hover:text-navy-800'
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-mint-500 rounded-r-full" />
        )}
        <item.icon
          size={20}
          className={clsx(
            'flex-shrink-0 transition-colors',
            isActive ? 'text-mint-500' : 'group-hover:text-mint-500'
          )}
        />
        {showLabel && (
          <>
            <span className={clsx(
              'text-sm font-semibold',
              isActive ? 'text-navy-900' : ''
            )}>
              {item.name}
            </span>
            {isActive && item.badge === 'count' && (
              <span className="ml-auto bg-mint-100 text-mint-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                ACTIVE
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex h-full flex-col bg-surface border-r border-slate-200/60 pt-8 pb-6 ${sidebarOpen || isMobile ? 'px-5' : 'px-2'}`}>
      {/* Logo */}
      <div className={`flex px-3 mb-12 ${sidebarOpen || isMobile ? 'items-center justify-between' : 'flex-col items-center gap-3 px-0'}`}>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 shadow-soft-2 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          {(sidebarOpen || isMobile) && (
            <div>
              <h1 className="font-bold text-lg tracking-tight text-navy-900 leading-tight">IsoForma</h1>
              <p className="text-xs text-slate-500 font-medium">Compliance Platform</p>
            </div>
          )}
        </div>
        {isMobile ? (
          <button
            onClick={closeMobileMenu}
            className="p-2 text-slate-400 hover:text-navy-800 hover:bg-white rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:text-navy-800 hover:bg-white rounded-xl transition-colors hidden md:flex"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {(sidebarOpen || isMobile) && (
          <div className="px-3 mb-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Main Menu</p>
          </div>
        )}
        {mainNavigation.map((item) => (
          <NavLink key={item.name} item={item} isMobile={isMobile} />
        ))}

        {/* Settings section */}
        {(sidebarOpen || isMobile) && (
          <div className="px-3 mb-2 mt-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Settings</p>
          </div>
        )}
        {!sidebarOpen && !isMobile && <div className="mt-6" />}
        {settingsNavigation
          .filter((item) => !item.admin || isAdmin)
          .map((item) => (
            <NavLink key={item.name} item={item} isMobile={isMobile} />
          ))}
      </nav>

      {/* User card */}
      {user && (sidebarOpen || isMobile) && (
        <div className="mt-auto bg-white rounded-3xl p-4 shadow-soft-1 border border-slate-100 flex items-center gap-3 cursor-pointer hover:shadow-soft-2 transition-shadow">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-mint-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 border-2 border-white shadow-sm">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
          <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
        </div>
      )}

      {/* Collapsed user avatar */}
      {user && !sidebarOpen && !isMobile && (
        <div className="mt-auto flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-300 to-mint-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 h-screen transition-all duration-300',
          'hidden md:block',
          sidebarOpen ? 'md:w-72' : 'md:w-16'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 h-screen w-72 transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent isMobile />
      </aside>
    </>
  );
}
