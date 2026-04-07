'use client';

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import type { Video } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VideoFormData {
  title: string;
  description: string;
  category: 'recent' | 'short' | 'long';
  platform: 'youtube' | 'vimeo' | 'tiktok' | 'instagram';
  duration: string;
  creatorName: string;
  viewCount: string;
  videoUrl: string;
  thumbnailUrl: string;
  order: string;
}

type SourceMode = 'upload' | 'url';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  fileName: string;
  errorMessage: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = ['recent', 'short', 'long'] as const;
const PLATFORMS = ['youtube', 'vimeo', 'tiktok', 'instagram'] as const;

const EMPTY_FORM: VideoFormData = {
  title: '',
  description: '',
  category: 'recent',
  platform: 'youtube',
  duration: '',
  creatorName: 'Ishan',
  viewCount: '0',
  videoUrl: '',
  thumbnailUrl: '',
  order: '0',
};

const INITIAL_UPLOAD: UploadState = {
  status: 'idle',
  fileName: '',
  errorMessage: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inputClass(extra = ''): string {
  return `w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white placeholder-text-muted focus:border-accent-green focus:outline-none transition-colors ${extra}`;
}

function labelClass(): string {
  return 'block text-text-secondary text-sm mb-1';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VideosPage() {
  // Data
  const [videos, setVideos] = useState<readonly Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Source mode toggles
  const [videoSourceMode, setVideoSourceMode] = useState<SourceMode>('url');
  const [thumbSourceMode, setThumbSourceMode] = useState<SourceMode>('url');

  // Upload state
  const [videoUpload, setVideoUpload] = useState<UploadState>(INITIAL_UPLOAD);
  const [thumbUpload, setThumbUpload] = useState<UploadState>(INITIAL_UPLOAD);

  // Refs for file inputs
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  // Detail panel
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  async function fetchVideos(): Promise<void> {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data.data ?? []);
    } catch {
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  function updateField(field: keyof VideoFormData, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm(): void {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setVideoSourceMode('url');
    setThumbSourceMode('url');
    setVideoUpload(INITIAL_UPLOAD);
    setThumbUpload(INITIAL_UPLOAD);
    setSelectedVideo(null);
    if (videoFileRef.current) videoFileRef.current.value = '';
    if (thumbFileRef.current) thumbFileRef.current.value = '';
  }

  function handleAdd(): void {
    resetForm();
    const nextOrder = videos.length > 0
      ? Math.max(...videos.map((v) => v.order ?? 0)) + 1
      : 0;
    setForm({ ...EMPTY_FORM, category: 'recent', order: String(nextOrder) });
    setShowForm(true);
  }

  function handleEdit(video: Video): void {
    setForm({
      title: video.title,
      description: video.description ?? '',
      category: video.category,
      platform: video.platform ?? 'youtube',
      duration: video.duration ?? '',
      creatorName: video.creatorName,
      viewCount: String(video.viewCount),
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      order: String(video.order ?? 0),
    });
    setEditingId(video.id);
    setVideoSourceMode('url');
    setThumbSourceMode('url');
    setVideoUpload(INITIAL_UPLOAD);
    setThumbUpload(INITIAL_UPLOAD);
    setShowForm(true);
    setSelectedVideo(null);
    setError('');
  }

  // ---------------------------------------------------------------------------
  // File upload
  // ---------------------------------------------------------------------------

  async function handleFileUpload(
    e: ChangeEvent<HTMLInputElement>,
    target: 'video' | 'thumbnail',
  ): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploadState = target === 'video' ? setVideoUpload : setThumbUpload;
    const fieldKey: keyof VideoFormData = target === 'video' ? 'videoUrl' : 'thumbnailUrl';

    setUploadState({ status: 'uploading', fileName: file.name, errorMessage: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.error ?? 'Upload failed';
        setUploadState({ status: 'error', fileName: file.name, errorMessage: msg });
        return;
      }

      const url: string = json.data?.url ?? '';

      if (!url) {
        setUploadState({
          status: 'error',
          fileName: file.name,
          errorMessage: 'Firebase not configured — file was not stored. Add Firebase credentials in .env.local',
        });
        return;
      }

      updateField(fieldKey, url);
      setUploadState({ status: 'success', fileName: file.name, errorMessage: '' });
    } catch {
      setUploadState({
        status: 'error',
        fileName: file.name,
        errorMessage: 'Upload request failed. Check your connection.',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title,
      description: form.description || undefined,
      category: form.category,
      platform: form.platform,
      duration: form.duration || '',
      videoUrl: form.videoUrl,
      thumbnailUrl: form.thumbnailUrl,
      creatorName: form.creatorName,
      viewCount: form.viewCount,
      order: Number(form.order),
    };

    try {
      const url = editingId ? `/api/videos/${editingId}` : '/api/videos';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save video.');
      }

      resetForm();
      await fetchVideos();
    } catch {
      setError('Failed to save video. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete / Toggle visibility
  // ---------------------------------------------------------------------------

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      if (selectedVideo?.id === id) setSelectedVideo(null);
      await fetchVideos();
    } catch {
      setError('Failed to delete video.');
    }
  }

  async function handleToggleVisibility(video: Video): Promise<void> {
    try {
      await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !video.isVisible }),
      });
      await fetchVideos();
    } catch {
      setError('Failed to update visibility.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderSourceToggle(
    label: string,
    mode: SourceMode,
    setMode: (m: SourceMode) => void,
  ) {
    return (
      <div className="flex items-center gap-4 mb-2">
        <span className={labelClass()}>{label}:</span>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            name={`${label}-source`}
            checked={mode === 'upload'}
            onChange={() => setMode('upload')}
            className="accent-accent-green"
          />
          <span className={mode === 'upload' ? 'text-white' : 'text-text-muted'}>
            Upload File
          </span>
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            name={`${label}-source`}
            checked={mode === 'url'}
            onChange={() => setMode('url')}
            className="accent-accent-green"
          />
          <span className={mode === 'url' ? 'text-white' : 'text-text-muted'}>
            Paste URL
          </span>
        </label>
      </div>
    );
  }

  function renderUploadStatus(upload: UploadState) {
    if (upload.status === 'idle') return null;

    const colorMap = {
      uploading: 'text-yellow-400',
      success: 'text-accent-green',
      error: 'text-red-400',
    } as const;

    const iconMap = {
      uploading: 'Uploading...',
      success: 'Uploaded',
      error: 'Failed',
    } as const;

    return (
      <div className={`flex items-center gap-2 mt-1.5 text-xs ${colorMap[upload.status]}`}>
        {upload.status === 'uploading' && (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {upload.status === 'success' && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {upload.status === 'error' && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>
          {upload.fileName} — {iconMap[upload.status]}
        </span>
        {upload.errorMessage && (
          <span className="text-red-400 ml-1">({upload.errorMessage})</span>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return <p className="text-text-secondary">Loading videos...</p>;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {/* Security note banner */}
      <div className="mb-4 rounded-xl bg-bg-card border border-gray-700 px-4 py-2.5 flex items-center gap-2">
        <svg className="h-4 w-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0a2 2 0 100-4 2 2 0 000 4zm6-6V7a6 6 0 10-12 0v4" />
        </svg>
        <span className="text-text-muted text-xs">
          Admin Panel — Password: Set in .env.local (ADMIN_PASSWORD)
        </span>
      </div>

      {/* Firebase status banner */}
      <div className="mb-6 rounded-xl bg-yellow-900/20 border border-yellow-700/40 px-4 py-2.5 flex items-center gap-2">
        <svg className="h-4 w-4 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-yellow-300 text-xs">
          Firebase not configured — uploads will not persist. Add Firebase credentials in .env.local
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Videos</h1>
        <button
          onClick={handleAdd}
          className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
        >
          Add Video
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Form                                                                 */}
      {/* ------------------------------------------------------------------- */}
      {showForm && (
        <div className="bg-bg-card rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Video' : 'Add New Video'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Title */}
            <div>
              <label className={labelClass()}>Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={inputClass()}
                placeholder="Video title"
                required
              />
            </div>

            {/* Row 2: Description */}
            <div>
              <label className={labelClass()}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={inputClass('min-h-[80px] resize-y')}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            {/* Row 3: Category + Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass()}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value as VideoFormData['category'])}
                  className={inputClass()}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass()}>Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => updateField('platform', e.target.value as VideoFormData['platform'])}
                  className={inputClass()}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3b: Duration + Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass()}>Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  className={inputClass()}
                  placeholder="3:45"
                />
              </div>
              <div>
                <label className={labelClass()}>Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => updateField('order', e.target.value)}
                  className={inputClass()}
                  min="0"
                />
              </div>
            </div>

            {/* Row 4: Creator + Views */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass()}>Creator Name</label>
                <input
                  type="text"
                  value={form.creatorName}
                  onChange={(e) => updateField('creatorName', e.target.value)}
                  className={inputClass()}
                  placeholder="Ishan"
                  required
                />
              </div>
              <div>
                <label className={labelClass()}>View Count</label>
                <input
                  type="text"
                  value={form.viewCount}
                  onChange={(e) => updateField('viewCount', e.target.value)}
                  className={inputClass()}
                  placeholder="124K"
                />
              </div>
            </div>

            {/* Row 5: Video source */}
            <div className="rounded-xl border border-gray-700 p-4 bg-bg-card-alt/30">
              {renderSourceToggle('Video Source', videoSourceMode, setVideoSourceMode)}

              {videoSourceMode === 'upload' ? (
                <div>
                  <input
                    ref={videoFileRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-green/10 file:text-accent-green hover:file:bg-accent-green/20 file:cursor-pointer cursor-pointer"
                  />
                  {renderUploadStatus(videoUpload)}
                </div>
              ) : (
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  className={inputClass()}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              )}
            </div>

            {/* Row 6: Thumbnail source */}
            <div className="rounded-xl border border-gray-700 p-4 bg-bg-card-alt/30">
              {renderSourceToggle('Thumbnail', thumbSourceMode, setThumbSourceMode)}

              {thumbSourceMode === 'upload' ? (
                <div>
                  <input
                    ref={thumbFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-green/10 file:text-accent-green hover:file:bg-accent-green/20 file:cursor-pointer cursor-pointer"
                  />
                  {renderUploadStatus(thumbUpload)}
                </div>
              ) : (
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                  className={inputClass()}
                  placeholder="https://img.youtube.com/..."
                  required
                />
              )}

              {/* Thumbnail preview */}
              {form.thumbnailUrl && (
                <div className="mt-3">
                  <span className="text-text-muted text-xs block mb-1">Preview</span>
                  <img
                    src={form.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-40 h-24 object-cover rounded-lg border border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent-green text-black font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Video' : 'Create Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-bg-card-alt text-text-secondary px-5 py-2.5 rounded-xl hover:text-white transition-colors border border-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Detail Panel (view mode when a row is clicked)                       */}
      {/* ------------------------------------------------------------------- */}
      {selectedVideo && !showForm && (
        <div className="bg-bg-card rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Video Details</h2>
            <button
              onClick={() => setSelectedVideo(null)}
              className="text-text-muted hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-text-muted text-xs">Title</span>
              <p className="text-white text-sm">{selectedVideo.title}</p>
            </div>
            {selectedVideo.description && (
              <div className="md:col-span-2">
                <span className="text-text-muted text-xs">Description</span>
                <p className="text-white text-sm">{selectedVideo.description}</p>
              </div>
            )}
            <div>
              <span className="text-text-muted text-xs">Category</span>
              <p className="text-white text-sm capitalize">{selectedVideo.category}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Duration</span>
              <p className="text-white text-sm">{selectedVideo.duration || '—'}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Creator</span>
              <p className="text-white text-sm">{selectedVideo.creatorName}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Views</span>
              <p className="text-white text-sm">{selectedVideo.viewCount}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-text-muted text-xs">Video URL</span>
              <p className="text-accent-green text-sm truncate">{selectedVideo.videoUrl}</p>
            </div>
            {selectedVideo.thumbnailUrl && (
              <div className="md:col-span-2">
                <span className="text-text-muted text-xs block mb-1">Thumbnail</span>
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  className="w-40 h-24 object-cover rounded-lg border border-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-700">
            <button
              onClick={() => handleEdit(selectedVideo)}
              className="bg-accent-green text-black font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => {
                handleDelete(selectedVideo.id);
              }}
              className="bg-red-500/10 text-red-400 font-semibold px-4 py-2 rounded-xl hover:bg-red-500/20 transition-colors text-sm border border-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Table                                                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-bg-card rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-text-secondary text-sm font-medium p-4">Thumbnail</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Title</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Category</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Duration</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Views</th>
                <th className="text-left text-text-secondary text-sm font-medium p-4">Visible</th>
                <th className="text-right text-text-secondary text-sm font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-text-muted p-8">
                    No videos found. Add your first video.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr
                    key={video.id}
                    onClick={() => {
                      if (!showForm) setSelectedVideo(video);
                    }}
                    className="border-b border-gray-700/50 hover:bg-bg-card-alt/50 transition-colors cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <td className="p-4">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                          <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="p-4 text-white text-sm">{video.title}</td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="inline-block bg-accent-green/10 text-accent-green text-xs font-medium px-2.5 py-1 rounded-lg">
                        {video.category}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="p-4 text-text-secondary text-sm">
                      {video.duration || '—'}
                    </td>

                    {/* Views */}
                    <td className="p-4 text-text-secondary text-sm">
                      {video.viewCount}
                    </td>

                    {/* Visible toggle */}
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(video);
                        }}
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          video.isVisible ? 'bg-accent-green' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            video.isVisible ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(video);
                          }}
                          className="text-accent-green hover:text-accent-green/80 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(video.id);
                          }}
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
