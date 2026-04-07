'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Service {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly isVisible: boolean;
}

interface ServiceFormData {
  title: string;
  description: string;
  order: string;
}

const EMPTY_FORM: ServiceFormData = {
  title: '',
  description: '',
  order: '0',
};

export default function ServicesPage() {
  const [services, setServices] = useState<readonly Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data.data ?? []);
    } catch {
      setError('Failed to load services.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  function handleEdit(service: Service) {
    setForm({
      title: service.title,
      description: service.description,
      order: String(service.order),
    });
    setEditingId(service.id);
    setShowForm(true);
    setError('');
  }

  function handleAdd() {
    setForm(EMPTY_FORM);
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

    const payload = {
      title: form.title,
      description: form.description,
      order: Number(form.order),
    };

    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save service.');

      handleCancel();
      await fetchServices();
    } catch {
      setError('Failed to save service. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchServices();
    } catch {
      setError('Failed to delete service.');
    }
  }

  async function handleToggleVisibility(service: Service) {
    try {
      await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !service.isVisible }),
      });
      await fetchServices();
    } catch {
      setError('Failed to update visibility.');
    }
  }

  function updateField(field: keyof ServiceFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <p className="text-text-secondary">Loading services...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Services</h1>
        <button
          onClick={handleAdd}
          className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
        >
          Add Service
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-bg-card rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Service' : 'Add New Service'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => updateField('order', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none resize-none"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
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

      {/* Table */}
      <div className="bg-bg-card rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-text-secondary text-sm font-medium p-4">Order</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Title</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Description</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Visible</th>
                <th className="text-right text-text-secondary text-sm font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-text-muted p-8">
                    No services found. Add your first service.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="border-b border-gray-700/50 hover:bg-bg-card-alt/50 transition-colors">
                    <td className="p-4 text-text-secondary text-sm">{service.order}</td>
                    <td className="p-4 text-white text-sm">{service.title}</td>
                    <td className="p-4 text-text-secondary text-sm max-w-xs truncate">
                      {service.description}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(service)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          service.isVisible ? 'bg-accent-green' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            service.isVisible ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-accent-green hover:text-accent-green/80 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
