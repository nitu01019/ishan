'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  MessageSquare,
  Mail,
  CreditCard,
  Plus,
  Inbox,
  Palette,
  Settings,
  Database,
  HardDrive,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  readonly label: string;
  readonly value: number | null;
  readonly icon: React.ComponentType<{ className?: string }>;
}

type DatabaseStatus = 'checking' | 'connected' | 'not-configured' | 'error';

interface DashboardState {
  readonly totalVideos: number | null;
  readonly totalTestimonials: number | null;
  readonly unreadInquiries: number | null;
  readonly activePlans: number | null;
  readonly databaseStatus: DatabaseStatus;
  readonly loading: boolean;
}

interface QuickAction {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_STATE: DashboardState = {
  totalVideos: null,
  totalTestimonials: null,
  unreadInquiries: null,
  activePlans: null,
  databaseStatus: 'checking',
  loading: true,
};

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Add Video', href: '/admin/dashboard/videos?action=add', icon: Plus },
  { label: 'View Inquiries', href: '/admin/dashboard/inquiries', icon: Inbox },
  { label: 'Edit Theme', href: '/admin/dashboard/settings', icon: Palette },
  { label: 'Site Settings', href: '/admin/dashboard/settings', icon: Settings },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchCount(url: string): Promise<number> {
  const res = await fetch(url);
  const json = await res.json();
  const data = json.data;
  return Array.isArray(data) ? data.length : 0;
}

async function fetchUnreadCount(url: string): Promise<number> {
  const res = await fetch(url);
  const json = await res.json();
  const data = json.data;
  if (!Array.isArray(data)) return 0;
  return data.filter(
    (item: { isRead?: boolean }) => item.isRead === false,
  ).length;
}

async function checkDatabase(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/site-config');
    const json = await res.json();
    if (json.success && json.data) {
      return 'connected';
    }
    return 'not-configured';
  } catch {
    return 'error';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <div className="bg-[#111827] rounded-2xl border border-gray-700 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-8 w-16 bg-gray-700 rounded" />
          <div className="h-4 w-24 bg-gray-700/60 rounded" />
        </div>
        <div className="h-10 w-10 bg-gray-700/40 rounded-xl" />
      </div>
    </div>
  );
}

function StatCardItem({ card }: { readonly card: StatCard }) {
  const Icon = card.icon;
  const isLoading = card.value === null;

  return (
    <div className="bg-[#111827] rounded-2xl border border-gray-700 p-6 transition-colors hover:border-gray-600">
      <div className="flex items-start justify-between">
        <div>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white transition-opacity duration-500 opacity-100">
              {card.value}
            </p>
          )}
          <p className="text-text-secondary text-sm mt-1">{card.label}</p>
        </div>
        <div className="p-2.5 bg-gray-800 rounded-xl">
          <Icon className="h-5 w-5 text-text-secondary" />
        </div>
      </div>
    </div>
  );
}

function DatabaseStatusBadge({
  status,
}: {
  readonly status: DatabaseStatus;
}) {
  const config: Record<
    DatabaseStatus,
    { color: string; bg: string; text: string }
  > = {
    checking: {
      color: 'text-gray-400',
      bg: 'bg-gray-400/10',
      text: 'Checking...',
    },
    connected: {
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      text: 'Connected',
    },
    'not-configured': {
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      text: 'Not Configured',
    },
    error: {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      text: 'Error',
    },
  };

  const { color, bg, text } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color} ${bg}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'connected'
            ? 'bg-green-400'
            : status === 'not-configured'
              ? 'bg-yellow-400'
              : status === 'error'
                ? 'bg-red-400'
                : 'bg-gray-400 animate-pulse'
        }`}
      />
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const [portfolioName, setPortfolioName] = useState("Neal");

  useEffect(() => {
    async function loadStats() {
      const [videos, testimonials, unread, plans, database] =
        await Promise.allSettled([
          fetchCount('/api/videos'),
          fetchCount('/api/testimonials'),
          fetchUnreadCount('/api/inquiries'),
          fetchCount('/api/pricing'),
          checkDatabase(),
        ]);

      setState({
        totalVideos:
          videos.status === 'fulfilled' ? videos.value : 0,
        totalTestimonials:
          testimonials.status === 'fulfilled' ? testimonials.value : 0,
        unreadInquiries:
          unread.status === 'fulfilled' ? unread.value : 0,
        activePlans:
          plans.status === 'fulfilled' ? plans.value : 0,
        databaseStatus:
          database.status === 'fulfilled'
            ? database.value
            : 'error',
        loading: false,
      });
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
            "Neal";
          setPortfolioName(name);
        }
      } catch {
        // Keep default on error
      }
    }

    loadStats();
    fetchPortfolioName();
  }, []);

  const statCards: readonly StatCard[] = [
    {
      label: 'Total Videos',
      value: state.totalVideos,
      icon: Film,
    },
    {
      label: 'Total Testimonials',
      value: state.totalTestimonials,
      icon: MessageSquare,
    },
    {
      label: 'Unread Inquiries',
      value: state.unreadInquiries,
      icon: Mail,
    },
    {
      label: 'Active Plans',
      value: state.activePlans,
      icon: CreditCard,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-text-secondary text-sm mt-1">
          Welcome back, {portfolioName}. Here is a summary of your portfolio.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {state.loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((card) => (
              <StatCardItem key={card.label} card={card} />
            ))}
      </div>

      {/* Database Status Card */}
      <div className="bg-bg-card rounded-2xl border border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          System Status
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Database className="h-4 w-4 text-text-secondary" />
              </div>
              <span className="text-sm text-white">Supabase Database</span>
            </div>
            <DatabaseStatusBadge status={state.databaseStatus} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <HardDrive className="h-4 w-4 text-text-secondary" />
              </div>
              <span className="text-sm text-white">Supabase Storage</span>
            </div>
            <DatabaseStatusBadge status={state.databaseStatus} />
          </div>

          {state.databaseStatus === 'not-configured' && (
            <p className="text-yellow-400/80 text-xs mt-2 pl-11">
              Add your Supabase credentials in{' '}
              <code className="bg-yellow-400/10 px-1.5 py-0.5 rounded text-yellow-300">
                .env.local
              </code>{' '}
              to enable database and file storage.
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 bg-bg-card rounded-xl border border-gray-700 px-4 py-3.5 text-sm font-medium text-white hover:border-accent-green hover:text-accent-green transition-colors"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Info Box */}
      <div className="bg-bg-card rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-text-secondary" />
          <h2 className="text-sm font-semibold text-white">
            Admin Information
          </h2>
        </div>
        <div className="space-y-2.5 text-sm text-text-secondary">
          <p>
            <span className="text-text-secondary">Admin Password:</span>{' '}
            <span className="text-white">
              Set in{' '}
              <code className="bg-bg-card-alt px-1.5 py-0.5 rounded text-accent-green text-xs">
                .env.local
              </code>{' '}
              (ADMIN_PASSWORD)
            </span>
          </p>
          <p>
            <span className="text-text-secondary">Supabase:</span>{' '}
            <span className="text-white">
              Configure in{' '}
              <code className="bg-bg-card-alt px-1.5 py-0.5 rounded text-accent-green text-xs">
                .env.local
              </code>
            </span>
          </p>
          <p>
            <span className="text-text-secondary">Upload Guide:</span>{' '}
            <span className="text-white">
              See{' '}
              <code className="bg-bg-card-alt px-1.5 py-0.5 rounded text-accent-green text-xs">
                VIDEO-UPLOAD-GUIDE.md
              </code>{' '}
              for setup instructions
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
