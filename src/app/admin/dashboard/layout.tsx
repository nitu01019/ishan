'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, RefreshCw, ExternalLink } from 'lucide-react';

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly slug: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', slug: 'overview' },
  { label: 'Videos', href: '/admin/dashboard/videos', slug: 'videos' },
  { label: 'Testimonials', href: '/admin/dashboard/testimonials', slug: 'testimonials' },
  { label: 'Services', href: '/admin/dashboard/services', slug: 'services' },
  { label: 'Pricing', href: '/admin/dashboard/pricing', slug: 'pricing' },
  { label: 'FAQs', href: '/admin/dashboard/faqs', slug: 'faqs' },
  { label: 'Inquiries', href: '/admin/dashboard/inquiries', slug: 'inquiries' },
  { label: 'Theme', href: '/admin/dashboard/theme', slug: 'theme' },
  { label: 'Section Styles', href: '/admin/dashboard/section-styles', slug: 'section-styles' },
  { label: 'Layouts', href: '/admin/dashboard/layouts', slug: 'layouts' },
  { label: 'Animations', href: '/admin/dashboard/animations', slug: 'animations' },
  { label: 'Nav Style', href: '/admin/dashboard/nav-style', slug: 'nav-style' },
  { label: 'Settings', href: '/admin/dashboard/settings', slug: 'settings' },
] as const;

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState("Neal's Portfolio");

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();

        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          router.push('/admin');
        }
      } catch {
        router.push('/admin');
      } finally {
        setChecking(false);
      }
    }

    async function fetchPortfolioName() {
      try {
        const res = await fetch('/api/site-config');
        const json = await res.json();
        const config = json.data;
        if (config) {
          const name =
            config.brandName ||
            config.navbar?.logoText ||
            config.footer?.name ||
            "Neal's Portfolio";
          setPortfolioName(name);
        }
      } catch {
        // Keep default on error
      }
    }

    checkAuth();
    fetchPortfolioName();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin');
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const sidebarContent = (
    <>
      <div className="mb-4">
        <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{portfolioName}</p>
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
      </div>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-accent-green text-black text-sm font-semibold hover:bg-accent-green/90 transition-colors"
      >
        View Portfolio
        <ExternalLink size={16} />
      </a>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.slug}
              href={item.href}
              onClick={closeSidebar}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'text-accent-green bg-accent-green/10'
                  : 'text-text-secondary hover:text-white hover:bg-bg-card-alt'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto text-red-400 hover:text-red-300 text-sm font-medium px-4 py-3 rounded-xl hover:bg-red-400/10 transition-colors text-left"
      >
        Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-bg-card border-b border-gray-700 flex items-center px-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white p-1"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <span className="ml-3 text-white font-bold text-lg">{portfolioName}</span>
        <button
          onClick={handleRefresh}
          className="ml-auto text-text-secondary hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Refresh page"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar overlay */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-bg-card border-r border-gray-700 flex flex-col p-6 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{portfolioName}</p>
            <h2 className="text-xl font-bold text-white">Dashboard</h2>
          </div>
          <button
            onClick={closeSidebar}
            className="text-white p-1"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-accent-green text-black text-sm font-semibold hover:bg-accent-green/90 transition-colors"
        >
          View Portfolio
          <ExternalLink size={16} />
        </a>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.slug}
                href={item.href}
                onClick={closeSidebar}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent-green bg-accent-green/10'
                    : 'text-text-secondary hover:text-white hover:bg-bg-card-alt'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-red-400 hover:text-red-300 text-sm font-medium px-4 py-3 rounded-xl hover:bg-red-400/10 transition-colors text-left"
        >
          Logout
        </button>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 w-64 h-screen bg-bg-card border-r border-gray-700 flex-col p-6">
        {sidebarContent}
      </aside>

      {/* Desktop refresh button */}
      <div className="hidden lg:flex fixed top-4 right-4 z-20">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-text-secondary hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
          aria-label="Refresh page"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen">{children}</main>
    </div>
  );
}
