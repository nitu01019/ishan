'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';

interface Testimonial {
  readonly id: string;
  readonly clientName: string;
  readonly clientRole: string;
  readonly clientAvatar: string;
  readonly quote: string;
  readonly rating: number;
  readonly isVisible: boolean;
}

interface TestimonialFormData {
  clientName: string;
  clientRole: string;
  clientAvatar: string;
  quote: string;
  rating: string;
}

type AvatarSourceMode = 'upload' | 'url';

interface AvatarUploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  fileName: string;
  errorMessage: string;
}

const EMPTY_FORM: TestimonialFormData = {
  clientName: '',
  clientRole: '',
  clientAvatar: '',
  quote: '',
  rating: '5',
};

const INITIAL_AVATAR_UPLOAD: AvatarUploadState = {
  status: 'idle',
  fileName: '',
  errorMessage: '',
};

const RATINGS = [1, 2, 3, 4, 5] as const;

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<readonly Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Avatar upload state
  const [avatarSourceMode, setAvatarSourceMode] = useState<AvatarSourceMode>('url');
  const [avatarUpload, setAvatarUpload] = useState<AvatarUploadState>(INITIAL_AVATAR_UPLOAD);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUpload({ status: 'uploading', fileName: file.name, errorMessage: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.error ?? 'Upload failed';
        setAvatarUpload({ status: 'error', fileName: file.name, errorMessage: msg });
        return;
      }

      const url: string = json.data?.url ?? '';

      if (!url) {
        setAvatarUpload({
          status: 'error',
          fileName: file.name,
          errorMessage: 'Firebase not configured — file was not stored. Add Firebase credentials in .env.local',
        });
        return;
      }

      updateField('clientAvatar', url);
      setAvatarUpload({ status: 'success', fileName: file.name, errorMessage: '' });
    } catch {
      setAvatarUpload({
        status: 'error',
        fileName: file.name,
        errorMessage: 'Upload request failed. Check your connection.',
      });
    }
  }

  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(data.data ?? []);
    } catch {
      setError('Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  function handleEdit(testimonial: Testimonial) {
    setForm({
      clientName: testimonial.clientName,
      clientRole: testimonial.clientRole,
      clientAvatar: testimonial.clientAvatar ?? '',
      quote: testimonial.quote,
      rating: String(testimonial.rating),
    });
    setEditingId(testimonial.id);
    setAvatarSourceMode('url');
    setAvatarUpload(INITIAL_AVATAR_UPLOAD);
    setShowForm(true);
    setError('');
  }

  function handleAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAvatarSourceMode('url');
    setAvatarUpload(INITIAL_AVATAR_UPLOAD);
    if (avatarFileRef.current) avatarFileRef.current.value = '';
    setShowForm(true);
    setError('');
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setAvatarSourceMode('url');
    setAvatarUpload(INITIAL_AVATAR_UPLOAD);
    if (avatarFileRef.current) avatarFileRef.current.value = '';
    setError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      clientName: form.clientName,
      clientRole: form.clientRole,
      clientAvatar: form.clientAvatar,
      quote: form.quote,
      rating: Number(form.rating),
    };

    try {
      const url = editingId ? `/api/testimonials/${editingId}` : '/api/testimonials';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save testimonial.');

      handleCancel();
      await fetchTestimonials();
    } catch {
      setError('Failed to save testimonial. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchTestimonials();
    } catch {
      setError('Failed to delete testimonial.');
    }
  }

  async function handleToggleVisibility(testimonial: Testimonial) {
    try {
      await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !testimonial.isVisible }),
      });
      await fetchTestimonials();
    } catch {
      setError('Failed to update visibility.');
    }
  }

  function updateField(field: keyof TestimonialFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-star-orange' : 'text-gray-600'}>
        &#9733;
      </span>
    ));
  }

  if (loading) {
    return <p className="text-text-secondary">Loading testimonials...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Testimonials</h1>
        <button
          onClick={handleAdd}
          className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
        >
          Add Testimonial
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-bg-card rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Client Name</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">Client Role</label>
              <input
                type="text"
                value={form.clientRole}
                onChange={(e) => updateField('clientRole', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">Quote</label>
              <textarea
                value={form.quote}
                onChange={(e) => updateField('quote', e.target.value)}
                rows={3}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-1">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => updateField('rating', e.target.value)}
                className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
              >
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Avatar */}
            <div className="md:col-span-2 rounded-xl border border-gray-700 p-4 bg-bg-card-alt/30">
              <div className="flex items-center gap-4 mb-2">
                <span className="block text-text-secondary text-sm">Client Avatar:</span>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="avatar-source"
                    checked={avatarSourceMode === 'upload'}
                    onChange={() => setAvatarSourceMode('upload')}
                    className="accent-accent-green"
                  />
                  <span className={avatarSourceMode === 'upload' ? 'text-white' : 'text-text-muted'}>
                    Upload Image
                  </span>
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="avatar-source"
                    checked={avatarSourceMode === 'url'}
                    onChange={() => setAvatarSourceMode('url')}
                    className="accent-accent-green"
                  />
                  <span className={avatarSourceMode === 'url' ? 'text-white' : 'text-text-muted'}>
                    Paste URL
                  </span>
                </label>
              </div>

              {avatarSourceMode === 'upload' ? (
                <div>
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-green/10 file:text-accent-green hover:file:bg-accent-green/20 file:cursor-pointer cursor-pointer"
                  />
                  {avatarUpload.status !== 'idle' && (
                    <div className={`flex items-center gap-2 mt-1.5 text-xs ${
                      avatarUpload.status === 'uploading' ? 'text-yellow-400' :
                      avatarUpload.status === 'success' ? 'text-accent-green' : 'text-red-400'
                    }`}>
                      <span>
                        {avatarUpload.fileName} —{' '}
                        {avatarUpload.status === 'uploading' ? 'Uploading...' :
                         avatarUpload.status === 'success' ? 'Uploaded' : 'Failed'}
                      </span>
                      {avatarUpload.errorMessage && (
                        <span className="text-red-400 ml-1">({avatarUpload.errorMessage})</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  value={form.clientAvatar}
                  onChange={(e) => updateField('clientAvatar', e.target.value)}
                  className="w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white focus:border-accent-green focus:outline-none"
                  placeholder="https://example.com/avatar.jpg"
                />
              )}

              {/* Circular avatar preview */}
              {form.clientAvatar && (
                <div className="mt-3">
                  <span className="text-text-muted text-xs block mb-1">Preview</span>
                  <img
                    src={form.clientAvatar}
                    alt="Client avatar preview"
                    className="w-16 h-16 rounded-full object-cover border border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}
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
                <th className="text-left text-text-secondary text-sm font-medium p-4">Client</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Role</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Quote</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Rating</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Visible</th>
                <th className="text-right text-text-secondary text-sm font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-text-muted p-8">
                    No testimonials found. Add your first testimonial.
                  </td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t.id} className="border-b border-gray-700/50 hover:bg-bg-card-alt/50 transition-colors">
                    <td className="p-4 text-white text-sm">{t.clientName}</td>
                    <td className="p-4 text-text-secondary text-sm">{t.clientRole}</td>
                    <td className="p-4 text-text-secondary text-sm max-w-xs truncate">{t.quote}</td>
                    <td className="p-4 text-sm">{renderStars(t.rating)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(t)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          t.isVisible ? 'bg-accent-green' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            t.isVisible ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-accent-green hover:text-accent-green/80 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
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
