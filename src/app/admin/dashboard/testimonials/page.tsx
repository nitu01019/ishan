'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { uploadFile, formatFileSize } from '@/lib/upload-manager';

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
  fileSize: number;
  errorMessage: string;
  progress: number;
  abortController: AbortController | null;
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
  fileSize: 0,
  errorMessage: '',
  progress: 0,
  abortController: null,
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Avatar upload state
  const [avatarSourceMode, setAvatarSourceMode] = useState<AvatarSourceMode>('url');
  const [avatarUpload, setAvatarUpload] = useState<AvatarUploadState>(INITIAL_AVATAR_UPLOAD);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    const abortController = new AbortController();

    setAvatarUpload({
      status: 'uploading',
      fileName: file.name,
      fileSize: file.size,
      errorMessage: '',
      progress: 0,
      abortController,
    });

    try {
      const result = await uploadFile(file, {
        onProgress: (p) => {
          setAvatarUpload((prev) => ({ ...prev, progress: p.percentage }));
        },
        signal: abortController.signal,
      });

      updateField('clientAvatar', result.url);
      setAvatarUpload({
        status: 'success',
        fileName: file.name,
        fileSize: file.size,
        errorMessage: '',
        progress: 100,
        abortController: null,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setAvatarUpload(INITIAL_AVATAR_UPLOAD);
        return;
      }
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setAvatarUpload({
        status: 'error',
        fileName: file.name,
        fileSize: file.size,
        errorMessage: msg,
        progress: 0,
        abortController: null,
      });
    }
  }

  async function fetchTestimonials(signal?: AbortSignal) {
    try {
      const res = await fetch('/api/testimonials', signal ? { signal } : undefined);
      if (signal?.aborted) return;
      const data = await res.json();
      if (signal?.aborted) return;
      setTestimonials(data.data ?? []);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Failed to load testimonials.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchTestimonials(controller.signal);
    return () => controller.abort();
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
    avatarUpload.abortController?.abort();
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

    // Validate rating is within range
    const ratingNum = Number(form.rating);
    if (ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
      setError('Rating must be an integer between 1 and 5.');
      setSaving(false);
      return;
    }

    const payload = {
      clientName: form.clientName,
      clientRole: form.clientRole,
      clientAvatar: form.clientAvatar,
      quote: form.quote,
      rating: ratingNum,
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

  async function handleDelete(id: string): Promise<void> {
    setDeleteId(id);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/testimonials/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchTestimonials();
    } catch {
      setError('Failed to delete testimonial.');
    } finally {
      setDeleteId(null);
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
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted truncate max-w-[200px]">
                          {avatarUpload.fileName}
                          {avatarUpload.fileSize > 0 && (
                            <span className="ml-1 text-text-muted/60">
                              ({formatFileSize(avatarUpload.fileSize)})
                            </span>
                          )}
                        </span>
                        {avatarUpload.status === 'uploading' && avatarUpload.abortController && (
                          <button
                            type="button"
                            onClick={() => avatarUpload.abortController?.abort()}
                            className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-0.5 rounded hover:bg-red-400/10 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {avatarUpload.status === 'uploading' && (
                        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-accent-green h-1.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${avatarUpload.progress}%` }}
                          />
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 text-xs ${
                        avatarUpload.status === 'uploading' ? 'text-yellow-400' :
                        avatarUpload.status === 'success' ? 'text-accent-green' : 'text-red-400'
                      }`}>
                        <span>
                          {avatarUpload.status === 'uploading' ? `Uploading... ${avatarUpload.progress}%` :
                           avatarUpload.status === 'success' ? 'Uploaded' : 'Failed'}
                        </span>
                        {avatarUpload.errorMessage && (
                          <span className="text-red-400 ml-1">({avatarUpload.errorMessage})</span>
                        )}
                      </div>
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

      {/* Mobile: Card layout */}
      <div className="lg:hidden flex flex-col gap-3">
        {testimonials.length === 0 ? (
          <div className="text-center text-text-muted p-8 bg-bg-card rounded-2xl border border-gray-700">
            No testimonials found. Add your first testimonial.
          </div>
        ) : (
          testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-bg-card rounded-xl border border-gray-700 p-4"
            >
              <div className="flex items-start gap-3">
                {t.clientAvatar ? (
                  <img
                    src={t.clientAvatar}
                    alt={t.clientName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-text-muted text-sm">
                    {t.clientName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{t.clientName}</p>
                  <p className="text-text-muted text-xs">{t.clientRole}</p>
                  <div className="mt-1 text-sm">{renderStars(t.rating)}</div>
                </div>
              </div>
              <p className="text-text-secondary text-sm mt-2 line-clamp-2">{t.quote}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                <button
                  onClick={() => handleToggleVisibility(t)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${t.isVisible ? 'bg-accent-green' : 'bg-gray-600'}`}
                  role="switch"
                  aria-checked={t.isVisible}
                  aria-label={`Toggle visibility for ${t.clientName}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${t.isVisible ? 'left-5' : 'left-1'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-accent-green text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors min-h-[44px] flex items-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors min-h-[44px] flex items-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden lg:block bg-bg-card rounded-2xl border border-gray-700 overflow-hidden">
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
                        role="switch"
                        aria-checked={t.isVisible}
                        aria-label={`Toggle visibility for ${t.clientName}`}
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
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
