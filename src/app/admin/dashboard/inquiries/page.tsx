'use client';

import { useState, useEffect } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Inquiry {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly projectType: string;
  readonly budget: string;
  readonly message: string;
  readonly selectedPlan: string;
  readonly createdAt: string;
  readonly isRead: boolean;
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'short-form': 'Short Form',
  'long-form': 'Long Form',
  'thumbnail': 'Thumbnail',
  'seo': 'SEO',
  'consulting': 'Consulting',
  'other': 'Other',
};

const BUDGET_LABELS: Record<string, string> = {
  'under-500': 'Under $500',
  '500-1000': '$500 - $1,000',
  '1000-2000': '$1,000 - $2,000',
  '2000-5000': '$2,000 - $5,000',
  '5000+': '$5,000+',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<readonly Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const unreadCount = inquiries.filter((inq) => !inq.isRead).length;

  async function fetchInquiries() {
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to load inquiries.');
      }
      setInquiries(data.data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load inquiries.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function handleMarkAsRead(id: string) {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchInquiries();
    } catch {
      setError('Failed to mark inquiry as read.');
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setDeleteId(id);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/inquiries/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchInquiries();
    } catch {
      setError('Failed to delete inquiry.');
    } finally {
      setDeleteId(null);
    }
  }

  function handleRowClick(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return <p className="text-text-secondary">Loading inquiries...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Inquiries</h1>
          <p className="text-text-secondary text-sm mt-1">
            {inquiries.length} total &middot;{' '}
            <span className="text-accent-green">{unreadCount} unread</span>
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Table */}
      <div className="bg-bg-card rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-text-secondary text-sm font-medium p-4 w-8"></th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Name</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Email</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Project Type</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Budget</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Plan</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Date</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Status</th>
                <th className="text-right text-text-secondary text-sm font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-text-muted p-8">
                    No inquiries yet.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => {
                  const isExpanded = expandedId === inquiry.id;
                  return (
                    <tr key={inquiry.id} className="group">
                      {/* Main row */}
                      <td
                        className="p-4 cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        {!inquiry.isRead && (
                          <span className="inline-block w-2.5 h-2.5 bg-accent-green rounded-full" />
                        )}
                      </td>
                      <td
                        className="p-4 text-white text-sm cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        <span className={!inquiry.isRead ? 'font-semibold' : ''}>
                          {inquiry.name}
                        </span>
                      </td>
                      <td
                        className="p-4 text-text-secondary text-sm cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        {inquiry.email}
                      </td>
                      <td
                        className="p-4 cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        <span className="inline-block bg-accent-green/10 text-accent-green text-xs font-medium px-2.5 py-1 rounded-lg">
                          {PROJECT_TYPE_LABELS[inquiry.projectType] ?? inquiry.projectType}
                        </span>
                      </td>
                      <td
                        className="p-4 text-text-secondary text-sm cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        {BUDGET_LABELS[inquiry.budget] ?? (inquiry.budget || '-')}
                      </td>
                      <td
                        className="p-4 text-text-secondary text-sm cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        {inquiry.selectedPlan || '-'}
                      </td>
                      <td
                        className="p-4 text-text-secondary text-sm cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        {formatDate(inquiry.createdAt)}
                      </td>
                      <td
                        className="p-4 cursor-pointer border-b border-gray-700/50"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        <span
                          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg ${
                            inquiry.isRead
                              ? 'bg-gray-600/30 text-gray-400'
                              : 'bg-accent-green/10 text-accent-green'
                          }`}
                        >
                          {inquiry.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="p-4 text-right border-b border-gray-700/50">
                        <div className="flex items-center justify-end gap-2">
                          {!inquiry.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(inquiry.id)}
                              className="text-accent-green hover:text-accent-green/80 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(inquiry.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded message panel */}
        {expandedId && (
          <div className="border-t border-gray-700 bg-bg-card-alt/50 p-6">
            {(() => {
              const inquiry = inquiries.find((inq) => inq.id === expandedId);
              if (!inquiry) return null;
              return (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-base">
                        Message from {inquiry.name}
                      </h3>
                      <p className="text-text-secondary text-sm mt-1">
                        {inquiry.email}
                        {inquiry.phone ? ` | ${inquiry.phone}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-text-secondary hover:text-white text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  <div className="bg-bg-card rounded-xl p-4 border border-gray-700">
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {inquiry.message}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
