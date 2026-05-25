'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle, Bell, CheckCircle, Clock, Download, LogOut, Menu, Search } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';

const placeholderNotifications = [
  {
    id: '1',
    type: 'warning' as const,
    title: 'NCR requires attention',
    message: 'Non-conformity #NCR-2024-001 is overdue for resolution',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'info' as const,
    title: 'Assessment assigned',
    message: 'You have been assigned as Lead Auditor for Q1 Internal Audit',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'success' as const,
    title: 'Corrective action verified',
    message: 'CA-2024-015 has been verified and closed',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'info' as const,
    title: 'Assessment due soon',
    message: 'Surveillance Audit is due in 3 days',
    time: '1 day ago',
    read: true,
  },
];

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your compliance status' },
  '/assessments': { title: 'Self-Assessments', subtitle: 'ISO 9001:2015 Audit Readiness' },
  '/non-conformities': { title: 'Non-Conformities', subtitle: 'Track and resolve findings' },
  '/actions': { title: 'Corrective Actions', subtitle: 'Manage improvement activities' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Compliance insights and exports' },
  '/standards': { title: 'ISO Standards', subtitle: 'Requirements and clause mapping' },
  '/settings': { title: 'Settings', subtitle: 'Organization and profile settings' },
  '/admin/users': { title: 'Team Access', subtitle: 'Manage user roles and permissions' },
  '/help': { title: 'Help Center', subtitle: 'Guides, FAQ and support' },
};

function getPageInfo(pathname: string) {
  for (const [path, info] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return info;
  }
  return { title: 'IsoForma', subtitle: 'Compliance Platform' };
}

function NotificationIcon({ type }: { type: 'warning' | 'info' | 'success' }) {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={16} className="text-amber-500" />;
    case 'success':
      return <CheckCircle size={16} className="text-emerald-500" />;
    default:
      return <Clock size={16} className="text-blue-500" />;
  }
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, openMobileMenu } = useUIStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = placeholderNotifications.filter((n) => !n.read).length;
  const pageInfo = getPageInfo(pathname);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notificationsOpen]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-24 transition-all duration-300 left-0 md:left-16 ${
        sidebarOpen ? 'md:left-72' : 'md:left-16'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Left: mobile menu + page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={openMobileMenu}
            className="p-2 text-slate-500 hover:text-navy-800 hover:bg-white rounded-xl md:hidden transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
              {pageInfo.title}
            </h2>
            {pageInfo.subtitle && (
              <p className="text-sm text-slate-500 font-medium mt-0.5 hidden sm:block">
                {pageInfo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: search, notifications, export, logout */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Search */}
          <div className="relative group hidden md:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mint-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search clauses, findings..."
              className="w-56 lg:w-72 bg-white shadow-inner-soft border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500 transition-all placeholder:text-slate-400 text-navy-800"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="bg-slate-100 text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold">
                Ctrl
              </kbd>
              <kbd className="bg-slate-100 text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold">
                K
              </kbd>
            </div>
          </div>

          {/* Mobile search */}
          <button className="p-2 text-slate-500 hover:text-navy-800 hover:bg-white rounded-xl md:hidden transition-colors">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-11 h-11 rounded-full bg-white shadow-soft-1 border border-slate-100 flex items-center justify-center relative hover:bg-slate-50 transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={20} className="text-navy-700" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-3 border border-slate-200 overflow-hidden z-50 animate-enter">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-navy-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold text-mint-600 bg-mint-50 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <ul>
                    {placeholderNotifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors ${
                          !notification.read ? 'bg-mint-50/40' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <NotificationIcon type={notification.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-bold text-navy-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-500 truncate">{notification.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-mint-500 rounded-full block flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <button className="w-full text-sm text-mint-600 hover:text-mint-700 font-bold transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export button */}
          <button className="hidden md:flex bg-mint-500 hover:bg-mint-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-mint-glow hover:shadow-mint-glow-lg transition-all items-center gap-2 transform hover:-translate-y-0.5">
            <Download size={16} />
            Export Report
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-full bg-white shadow-soft-1 border border-slate-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
