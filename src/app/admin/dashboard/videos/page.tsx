'use client';

import { useState, useEffect, useRef, useCallback, FormEvent, ChangeEvent } from 'react';
import type { Video } from '@/types';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { uploadFile, formatFileSize } from '@/lib/upload-manager';
import { compressImage } from '@/lib/image-compress';

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
  status: 'idle' | 'selected' | 'uploading' | 'success' | 'error';
  fileName: string;
  fileSize: number;
  errorMessage: string;
  progress: number;
  abortController: AbortController | null;
  uploadedUrl: string;
  fileType: string;
  objectUrl: string;
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
  creatorName: 'Neil',
  viewCount: '0',
  videoUrl: '',
  thumbnailUrl: '',
  order: '0',
};

const INITIAL_UPLOAD: UploadState = {
  status: 'idle',
  fileName: '',
  fileSize: 0,
  errorMessage: '',
  progress: 0,
  abortController: null,
  uploadedUrl: '',
  fileType: '',
  objectUrl: '',
};

function classifyUploadError(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes('403') || lower.includes('permission denied') || lower.includes('permission')) {
    return 'Upload permission denied. Check Supabase Storage policies.';
  }
  if (lower.includes('404') || lower.includes('bucket not found') || lower.includes('not found')) {
    return "Storage bucket not found. Create 'uploads' bucket in Supabase.";
  }
  if (lower.includes('413') || lower.includes('too large') || lower.includes('payload')) {
    return 'File too large for your Supabase plan.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('connection')) {
    return 'Upload failed. Check your internet connection and try again.';
  }
  return rawMessage || 'Upload failed. Please try again.';
}

function estimateUploadTime(bytes: number): string {
  const megabits = (bytes * 8) / (1024 * 1024);
  const seconds = Math.ceil(megabits / 1); // conservative 1 Mbps estimate
  if (seconds < 60) {
    return `~${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `~${minutes}m`;
  }
  return `~${minutes}m ${remainingSeconds}s`;
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  const start = url.slice(0, 20);
  const end = url.slice(-15);
  return `${start}...${end}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inputClass(extra = ''): string {
  return `w-full bg-bg-card-alt border border-gray-700 rounded-xl p-3 text-white placeholder-text-muted focus:border-accent-green focus:outline-none transition-colors ${extra}`;
}

function labelClass(): string {
  return 'block text-text-secondary text-sm mb-1';
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// ---------------------------------------------------------------------------
// Thumbnail with fallback
// ---------------------------------------------------------------------------

function ThumbnailWithFallback({
  src,
  alt,
  className,
}: {
  readonly src: string;
  readonly alt: string;
  readonly className: string;
}) {
  const [errored, setErrored] = useState(false);
  const hasSrc = src.length > 0;

  if (!hasSrc || errored) {
    return (
      <div className={`${className} bg-gray-700 flex items-center justify-center`}>
        <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
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

  // Refs for retry (hold latest file per target)
  const videoRetryFileRef = useRef<File | null>(null);
  const thumbRetryFileRef = useRef<File | null>(null);

  // Copied-to-clipboard feedback
  const [copiedUrl, setCopiedUrl] = useState<'video' | 'thumbnail' | null>(null);

  // YouTube metadata fetch
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const metaAbortRef = useRef<AbortController | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Auto-fill thumbnail when a YouTube URL is entered and thumbnail is empty
      if (field === 'videoUrl') {
        const ytId = extractYouTubeId(value);
        if (ytId && prev.thumbnailUrl.length === 0) {
          next.thumbnailUrl = getYouTubeThumbnail(ytId);
        }

        // Fetch duration (and optional title) from YouTube in the background
        if (ytId) {
          fetchYouTubeMeta(value, prev.title);
        }
      }

      return next;
    });
  }

  function fetchYouTubeMeta(videoUrl: string, currentTitle: string): void {
    // Abort any in-flight metadata request
    metaAbortRef.current?.abort();

    const controller = new AbortController();
    metaAbortRef.current = controller;
    setFetchingMeta(true);

    const encodedUrl = encodeURIComponent(videoUrl);

    fetch(`/api/youtube-meta?url=${encodedUrl}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json: { success: boolean; data?: { title: string | null; duration: string | null; thumbnailUrl: string | null } }) => {
        if (!json.success || !json.data) return;

        setForm((prev) => {
          const updates: Partial<VideoFormData> = {};

          if (json.data?.duration) {
            updates.duration = json.data.duration;
          }

          // Only auto-fill title when the field is empty
          if (json.data?.title && prev.title.length === 0) {
            updates.title = json.data.title;
          }

          if (Object.keys(updates).length === 0) return prev;
          return { ...prev, ...updates };
        });
      })
      .catch((err: unknown) => {
        // Silently ignore aborted requests
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Non-critical — the user can still fill fields manually
      })
      .finally(() => {
        // Only clear loading if this is still the active request
        if (metaAbortRef.current === controller) {
          setFetchingMeta(false);
        }
      });
  }

  function resetForm(): void {
    videoUpload.abortController?.abort();
    thumbUpload.abortController?.abort();
    // Revoke object URLs to free memory
    if (videoUpload.objectUrl) URL.revokeObjectURL(videoUpload.objectUrl);
    if (thumbUpload.objectUrl) URL.revokeObjectURL(thumbUpload.objectUrl);
    metaAbortRef.current?.abort();
    metaAbortRef.current = null;
    setFetchingMeta(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setVideoSourceMode('url');
    setThumbSourceMode('url');
    setVideoUpload(INITIAL_UPLOAD);
    setThumbUpload(INITIAL_UPLOAD);
    setSelectedVideo(null);
    setCopiedUrl(null);
    videoRetryFileRef.current = null;
    thumbRetryFileRef.current = null;
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

  const performUpload = useCallback(async (
    file: File,
    target: 'video' | 'thumbnail',
  ): Promise<void> => {
    const setUploadState = target === 'video' ? setVideoUpload : setThumbUpload;
    const fieldKey: keyof VideoFormData = target === 'video' ? 'videoUrl' : 'thumbnailUrl';
    const abortController = new AbortController();

    let uploadFile_ = file;

    // Compress thumbnail images before upload
    if (target === 'thumbnail' && file.type.startsWith('image/')) {
      setUploadState({
        ...INITIAL_UPLOAD,
        status: 'uploading',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        abortController,
      });
      try {
        const compressed = await compressImage(file);
        if (compressed.size < file.size) {
          uploadFile_ = compressed;
        }
      } catch {
        // Compression failed — proceed with original file
      }
    }

    setUploadState({
      status: 'uploading',
      fileName: uploadFile_.name,
      fileSize: uploadFile_.size,
      fileType: uploadFile_.type,
      errorMessage: '',
      progress: 0,
      abortController,
      uploadedUrl: '',
      objectUrl: '',
    });

    try {
      const result = await uploadFile(uploadFile_, {
        onProgress: (p) => {
          setUploadState((prev) => ({ ...prev, progress: p.percentage }));
        },
        signal: abortController.signal,
      });

      updateField(fieldKey, result.url);

      // Create an object URL for thumbnail preview on success
      const objectUrl = target === 'thumbnail' && uploadFile_.type.startsWith('image/')
        ? URL.createObjectURL(uploadFile_)
        : '';

      setUploadState({
        status: 'success',
        fileName: uploadFile_.name,
        fileSize: uploadFile_.size,
        fileType: uploadFile_.type,
        errorMessage: '',
        progress: 100,
        abortController: null,
        uploadedUrl: result.url,
        objectUrl,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setUploadState(INITIAL_UPLOAD);
        return;
      }
      const rawMsg = err instanceof Error ? err.message : 'Upload failed';
      const friendlyMsg = classifyUploadError(rawMsg);
      setUploadState({
        status: 'error',
        fileName: uploadFile_.name,
        fileSize: uploadFile_.size,
        fileType: uploadFile_.type,
        errorMessage: friendlyMsg,
        progress: 0,
        abortController: null,
        uploadedUrl: '',
        objectUrl: '',
      });
    }
  }, []);

  async function handleFileUpload(
    e: ChangeEvent<HTMLInputElement>,
    target: 'video' | 'thumbnail',
  ): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file ref for retry
    const retryRef = target === 'video' ? videoRetryFileRef : thumbRetryFileRef;
    retryRef.current = file;

    // Show pre-upload info (file size + estimated time) before starting
    const setUploadState = target === 'video' ? setVideoUpload : setThumbUpload;
    setUploadState({
      ...INITIAL_UPLOAD,
      status: 'selected',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Small delay so the user can see the file info before upload starts
    await new Promise((resolve) => setTimeout(resolve, 600));

    await performUpload(file, target);
  }

  function handleRetryUpload(target: 'video' | 'thumbnail'): void {
    const retryRef = target === 'video' ? videoRetryFileRef : thumbRetryFileRef;
    const file = retryRef.current;
    if (!file) return;
    performUpload(file, target);
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validate required URLs that may be set via file upload instead of form input
    if (!form.videoUrl.trim()) {
      setError(
        videoSourceMode === 'upload'
          ? 'Please upload a video file before submitting.'
          : 'Video URL is required.',
      );
      setSaving(false);
      return;
    }
    if (!form.thumbnailUrl.trim()) {
      setError(
        thumbSourceMode === 'upload'
          ? 'Please upload a thumbnail image before submitting.'
          : 'Thumbnail URL is required.',
      );
      setSaving(false);
      return;
    }

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
    setDeleteId(id);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/videos/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      if (selectedVideo?.id === deleteId) setSelectedVideo(null);
      await fetchVideos();
    } catch {
      setError('Failed to delete video.');
    } finally {
      setDeleteId(null);
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

  function handleCopyUrl(url: string, target: 'video' | 'thumbnail'): void {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(target);
      setTimeout(() => setCopiedUrl(null), 2000);
    }).catch(() => {
      // Clipboard write failed silently
    });
  }

  function renderUploadStatus(upload: UploadState, target: 'video' | 'thumbnail') {
    if (upload.status === 'idle') return null;

    return (
      <div className="mt-2 space-y-2">
        {/* File info header */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted truncate max-w-[200px]">
            {upload.fileName}
            {upload.fileSize > 0 && (
              <span className="ml-1 text-text-muted/60">
                ({formatFileSize(upload.fileSize)})
              </span>
            )}
          </span>

          {upload.status === 'uploading' && upload.abortController && (
            <button
              type="button"
              onClick={() => upload.abortController?.abort()}
              className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-0.5 rounded hover:bg-red-400/10 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Task 2: Pre-upload file info — size + estimated time */}
        {upload.status === 'selected' && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2">
            <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-300">
              <span className="font-medium">{formatFileSize(upload.fileSize)}</span>
              <span className="mx-1.5 text-blue-400/50">|</span>
              <span>Estimated upload time: {estimateUploadTime(upload.fileSize)}</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {upload.status === 'uploading' && (
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent-green h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        )}

        {/* Status: Uploading */}
        {upload.status === 'uploading' && (
          <div className="flex items-center gap-1.5 text-xs text-yellow-400">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>
              Uploading{upload.fileSize >= 6 * 1024 * 1024 ? ' (resumable)' : ''}... {upload.progress}%
            </span>
          </div>
        )}

        {/* Task 3: Enhanced success state */}
        {upload.status === 'success' && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2.5 space-y-2">
            {/* Top row: checkmark + file name */}
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-accent-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-accent-green font-medium">Upload successful</span>
            </div>

            {/* File name */}
            <p className="text-xs text-text-secondary truncate pl-6">{upload.fileName}</p>

            {/* Thumbnail preview for images, "Video ready" label for videos */}
            {target === 'thumbnail' && upload.objectUrl && (
              <div className="pl-6">
                <img
                  src={upload.objectUrl}
                  alt="Uploaded thumbnail preview"
                  className="w-24 h-16 object-cover rounded border border-gray-700"
                />
              </div>
            )}
            {target === 'video' && (
              <div className="flex items-center gap-1.5 pl-6">
                <svg className="h-3.5 w-3.5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-accent-green">Video ready</span>
              </div>
            )}

            {/* Truncated URL with copy button */}
            {upload.uploadedUrl && (
              <div className="flex items-center gap-2 pl-6">
                <span className="text-xs text-text-muted truncate font-mono">
                  {truncateUrl(upload.uploadedUrl)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(upload.uploadedUrl, target)}
                  className="flex-shrink-0 text-text-muted hover:text-white text-xs px-1.5 py-0.5 rounded border border-gray-600 hover:border-gray-500 transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl === target ? (
                    <span className="text-accent-green">Copied!</span>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Task 1: Enhanced error state with retry button */}
        {upload.status === 'error' && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 space-y-2">
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-red-400 leading-relaxed">{upload.errorMessage || 'Upload failed'}</span>
            </div>
            <div className="pl-6">
              <button
                type="button"
                onClick={() => handleRetryUpload(target)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-300 hover:text-white px-2.5 py-1 rounded-md border border-red-500/30 hover:border-red-400/50 hover:bg-red-500/10 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
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
                <label className={labelClass()}>
                  Duration
                  {fetchingMeta && (
                    <span className="inline-flex items-center gap-1 ml-2 text-xs text-yellow-400 font-normal">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Detecting...
                    </span>
                  )}
                </label>
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
                  placeholder="Neil"
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
                  {renderUploadStatus(videoUpload, 'video')}
                  {/* Tip for large files */}
                  {videoUpload.status === 'idle' && (
                    <p className="mt-2 text-xs text-text-muted">
                      Tip: For faster loading, upload to YouTube first and{' '}
                      <button
                        type="button"
                        onClick={() => setVideoSourceMode('url')}
                        className="text-accent-green hover:underline"
                      >
                        paste the URL
                      </button>{' '}
                      instead.
                    </p>
                  )}
                  {videoUpload.fileSize > 50 * 1024 * 1024 && videoUpload.status === 'uploading' && (
                    <p className="mt-1 text-xs text-yellow-400/80">
                      Large file detected ({formatFileSize(videoUpload.fileSize)}). Upload speed depends on your internet connection.
                    </p>
                  )}
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
              <div className="flex items-center justify-between">
                {renderSourceToggle('Thumbnail', thumbSourceMode, setThumbSourceMode)}
                {/* Auto-fill from YouTube button */}
                {(() => {
                  const ytId = extractYouTubeId(form.videoUrl);
                  if (!ytId) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => updateField('thumbnailUrl', getYouTubeThumbnail(ytId))}
                      className="text-xs text-accent-green hover:text-accent-green/80 font-medium px-2 py-1 rounded-lg hover:bg-accent-green/10 transition-colors whitespace-nowrap"
                    >
                      Use YouTube Thumbnail
                    </button>
                  );
                })()}
              </div>

              {thumbSourceMode === 'upload' ? (
                <div>
                  <input
                    ref={thumbFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-green/10 file:text-accent-green hover:file:bg-accent-green/20 file:cursor-pointer cursor-pointer"
                  />
                  {renderUploadStatus(thumbUpload, 'thumbnail')}
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
                  <ThumbnailWithFallback
                    src={form.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-40 h-24 object-cover rounded-lg border border-gray-700"
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
                <ThumbnailWithFallback
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  className="w-40 h-24 object-cover rounded-lg border border-gray-700"
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
      {/* Mobile: Card layout                                                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="lg:hidden flex flex-col gap-3">
        {videos.length === 0 ? (
          <div className="text-center text-text-muted p-8 bg-bg-card rounded-2xl border border-gray-700">
            No videos found. Add your first video.
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              onClick={() => { if (!showForm) setSelectedVideo(video); }}
              className="bg-bg-card rounded-xl border border-gray-700 p-4 cursor-pointer hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <ThumbnailWithFallback
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block bg-accent-green/10 text-accent-green text-xs font-medium px-2 py-0.5 rounded">
                      {video.category}
                    </span>
                    {video.duration && (
                      <span className="text-text-muted text-xs">{video.duration}</span>
                    )}
                    <span className="text-text-muted text-xs">{video.viewCount} views</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleVisibility(video); }}
                  className={`w-10 h-6 rounded-full transition-colors relative ${video.isVisible ? 'bg-accent-green' : 'bg-gray-600'}`}
                  role="switch"
                  aria-checked={video.isVisible}
                  aria-label={`Toggle visibility for ${video.title}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${video.isVisible ? 'left-5' : 'left-1'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(video); }}
                    className="text-accent-green text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors min-h-[44px] flex items-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
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

      {/* ------------------------------------------------------------------- */}
      {/* Desktop: Table layout                                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="hidden lg:block bg-bg-card rounded-2xl border border-gray-700 overflow-hidden">
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
                    <td className="p-4">
                      <ThumbnailWithFallback
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    </td>
                    <td className="p-4 text-white text-sm">{video.title}</td>
                    <td className="p-4">
                      <span className="inline-block bg-accent-green/10 text-accent-green text-xs font-medium px-2.5 py-1 rounded-lg">
                        {video.category}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary text-sm">{video.duration || '—'}</td>
                    <td className="p-4 text-text-secondary text-sm">{video.viewCount}</td>
                    <td className="p-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleVisibility(video); }}
                        className={`w-10 h-6 rounded-full transition-colors relative ${video.isVisible ? 'bg-accent-green' : 'bg-gray-600'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${video.isVisible ? 'left-5' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(video); }}
                          className="text-accent-green hover:text-accent-green/80 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent-green/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
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
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
