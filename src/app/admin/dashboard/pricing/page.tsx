'use client';

import { useState, useEffect, FormEvent } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface PricingPlan {
  readonly id: string;
  readonly planName: string;
  readonly price: number;
  readonly period: string;
  readonly features: readonly string[];
  readonly isHighlighted: boolean;
  readonly order: number;
  readonly isVisible: boolean;
}

interface PricingFormData {
  planName: string;
  price: string;
  period: string;
  features: string;
  isHighlighted: boolean;
  order: string;
}

const EMPTY_FORM: PricingFormData = {
  planName: '',
  price: '0',
  period: 'month',
  features: '',
  isHighlighted: false,
  order: '0',
};

export default function PricingPage() {
  const [plans, setPlans] = useState<readonly PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PricingFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchPlans() {
    try {
      const res = await fetch('/api/pricing');
      const data = await res.json();
      setPlans(data.data ?? []);
    } catch {
      setError('Failed to load pricing plans.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  function handleEdit(plan: PricingPlan) {
    setForm({
      planName: plan.planName,
      price: String(plan.price),
      period: plan.period,
      features: plan.features.join(', '),
      isHighlighted: plan.isHighlighted,
      order: String(plan.order ?? 0),
    });
    setEditingId(plan.id);
    setShowForm(true);
    setError('');
  }

  function handleAdd() {
    const nextOrder = plans.length > 0
      ? Math.max(...plans.map((p) => p.order ?? 0)) + 1
      : 0;
    setForm({ ...EMPTY_FORM, order: String(nextOrder) });
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const featuresArray = form.features
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      planName: form.planName,
      price: Number(form.price),
      period: form.period,
      features: featuresArray,
      isHighlighted: form.isHighlighted,
      order: Number(form.order),
    };

    try {
      const url = editingId ? `/api/pricing/${editingId}` : '/api/pricing';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save plan.');

      handleCancel();
      await fetchPlans();
    } catch {
      setError('Failed to save pricing plan. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setDeleteId(id);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/pricing/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchPlans();
    } catch {
      setError('Failed to delete pricing plan.');
    } finally {
      setDeleteId(null);
    }
  }

  async function handleToggleVisibility(plan: PricingPlan) {
    try {
      await fetch(`/api/pricing/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !plan.isVisible }),
      });
      await fetchPlans();
    } catch {
      setError('Failed to update visibility.');
    }
  }

  function updateField(field: keyof PricingFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <p className="text-text-secondary">Loading pricing plans...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Pricing</h1>
        <button
          onClick={handleAdd}
          className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
        >
          Add Plan
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-bg-card rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Plan' : 'Add New Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Plan Name</label>
              <input
                type="text"
                value={form.planName}
                onChange={(e) => updateField('planName', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">Period</label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => updateField('period', e.target.value)}
                placeholder="e.g. month, year, project"
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => updateField('order', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                min="0"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isHighlighted}
                  onChange={(e) => updateField('isHighlighted', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-600 peer-checked:bg-accent-green rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] peer-checked:after:translate-x-4 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
              <span className="text-text-secondary text-sm">Highlighted Plan</span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">
                Features (comma-separated)
              </label>
              <input
                type="text"
                value={form.features}
                onChange={(e) => updateField('features', e.target.value)}
                placeholder="e.g. 5 videos per month, Color grading, Sound design"
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-bg-card-alt text-text-secondary px-4 py-2 rounded-xl hover:text-white transition-colors border border-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full bg-bg-card rounded-2xl border border-gray-700 p-8 text-center text-text-muted">
            No pricing plans found. Add your first plan.
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-bg-card rounded-2xl border p-6 flex flex-col ${
                plan.isHighlighted
                  ? 'border-accent-green shadow-green'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{plan.planName}</h3>
                  {plan.isHighlighted && (
                    <span className="inline-block bg-accent-green/10 text-accent-green text-xs font-medium px-2 py-0.5 rounded-lg mt-1">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">${plan.price}</span>
                  <span className="text-text-muted text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                    <span className="text-accent-green mt-0.5">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 pt-2 border-t border-gray-700/50">
                <button
                  onClick={() => handleToggleVisibility(plan)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    plan.isVisible
                      ? 'text-accent-green hover:bg-accent-green/10'
                      : 'text-gray-500 hover:bg-gray-500/10'
                  }`}
                >
                  {plan.isVisible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 text-accent-green hover:text-accent-green/80 text-sm font-medium py-2 rounded-lg hover:bg-accent-green/10 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="flex-1 text-red-400 hover:text-red-300 text-sm font-medium py-2 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Pricing Plan"
        message="Are you sure you want to delete this pricing plan? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
