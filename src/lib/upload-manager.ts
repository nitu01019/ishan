'use client';

/**
 * Client-side upload manager with TUS resumable uploads.
 *
 * Routing:
 *   Files < 6 MB  →  Single XHR POST (fast, simple)
 *   Files >= 6 MB →  TUS resumable upload (chunked, retryable, resumable)
 *
 * Primary endpoint:  Direct Supabase Storage hostname (bypasses API gateway)
 * Fallback:          /api/upload → Supabase (for small files if direct fails)
 */

import * as tus from 'tus-js-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadProgress {
  readonly loaded: number;
  readonly total: number;
  readonly percentage: number;
}

export interface UploadOptions {
  readonly onProgress?: (progress: UploadProgress) => void;
  readonly signal?: AbortSignal;
  readonly bucket?: string;
}

export interface UploadResult {
  readonly url: string;
  readonly path: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50 GB (TUS limit)
const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024; // 4 MB — Next.js default body limit
const DEFAULT_BUCKET = 'uploads';

// TUS protocol constants
const TUS_CHUNK_SIZE = 6 * 1024 * 1024; // 6 MB — mandatory Supabase chunk size
const TUS_THRESHOLD = TUS_CHUNK_SIZE; // Use TUS for files >= 6 MB
const TUS_RETRY_DELAYS = [0, 3000, 5000, 10000, 20000];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function generateFilePath(fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}_${random}_${sanitizeFileName(fileName)}`;
}

/**
 * Returns the Supabase Storage base URL.
 * Uses the standard project URL — the direct storage hostname
 * (<ref>.storage.supabase.co) is only available on paid plans.
 */
function getStorageBaseUrl(): string {
  return SUPABASE_URL;
}

function buildPublicUrl(bucket: string, filePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

function isStorageConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ---------------------------------------------------------------------------
// TUS Resumable Upload — for files >= 6 MB
// ---------------------------------------------------------------------------

function uploadResumable(
  file: File,
  filePath: string,
  bucket: string,
  options: UploadOptions,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const storageHost = getStorageBaseUrl() || SUPABASE_URL;
    const endpoint = `${storageHost}/storage/v1/upload/resumable`;

    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize: TUS_CHUNK_SIZE,
      retryDelays: TUS_RETRY_DELAYS,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      headers: {
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      metadata: {
        bucketName: bucket,
        objectName: filePath,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      },

      onError(error) {
        reject(new Error(error.message || 'Upload failed'));
      },

      onProgress(bytesUploaded, bytesTotal) {
        options.onProgress?.({
          loaded: bytesUploaded,
          total: bytesTotal,
          percentage: Math.round((bytesUploaded / bytesTotal) * 100),
        });
      },

      onSuccess() {
        resolve({
          url: buildPublicUrl(bucket, filePath),
          path: filePath,
        });
      },
    });

    // Wire AbortSignal to TUS abort
    if (options.signal) {
      if (options.signal.aborted) {
        reject(new DOMException('Upload cancelled', 'AbortError'));
        return;
      }
      options.signal.addEventListener('abort', () => {
        upload.abort(true).then(() => {
          reject(new DOMException('Upload cancelled', 'AbortError'));
        }).catch(() => {
          reject(new DOMException('Upload cancelled', 'AbortError'));
        });
      });
    }

    // Check for previous uploads to resume
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    }).catch(() => {
      // No previous uploads found, start fresh
      upload.start();
    });
  });
}

// ---------------------------------------------------------------------------
// Direct XHR Upload — for files < 6 MB (faster than TUS for small files)
// ---------------------------------------------------------------------------

function uploadDirect(
  file: File,
  filePath: string,
  bucket: string,
  options: UploadOptions,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const storageHost = getStorageBaseUrl() || SUPABASE_URL;
    const endpoint = `${storageHost}/storage/v1/object/${bucket}/${filePath}`;

    // Pre-aborted
    if (options.signal?.aborted) {
      reject(new DOMException('Upload cancelled', 'AbortError'));
      return;
    }

    // Wire abort signal → XHR
    const onAbort = () => xhr.abort();
    options.signal?.addEventListener('abort', onAbort);

    const cleanup = () => options.signal?.removeEventListener('abort', onAbort);

    // Progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    // Completion
    xhr.addEventListener('load', () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: buildPublicUrl(bucket, filePath), path: filePath });
        return;
      }

      let msg = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText);
        msg = body.error ?? body.message ?? msg;
      } catch { /* ignore */ }

      if (xhr.status === 403) {
        msg = 'Storage permission denied. Ensure the "uploads" bucket allows inserts in Supabase → Storage → Policies.';
      } else if (xhr.status === 404) {
        msg = 'Bucket "uploads" not found. Create it in Supabase → Storage → New Bucket.';
      } else if (xhr.status === 413 || msg.toLowerCase().includes('payload too large') || msg.toLowerCase().includes('file size')) {
        msg = `File too large for current Supabase plan. Increase the file size limit in Supabase → Storage → uploads bucket → Settings. (Current file: ${formatFileSize(file.size)})`;
      }

      reject(new Error(msg));
    });

    xhr.addEventListener('error', () => {
      cleanup();
      reject(new Error('Network error during upload. Check your connection.'));
    });

    xhr.addEventListener('abort', () => {
      cleanup();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    });

    // Send
    xhr.open('POST', endpoint);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.timeout = 0; // no timeout — large videos can take minutes
    xhr.send(file);
  });
}

// ---------------------------------------------------------------------------
// Server fallback — Browser → /api/upload → Supabase
// ---------------------------------------------------------------------------

async function uploadViaServer(
  file: File,
  options: UploadOptions,
): Promise<UploadResult> {
  const body = new FormData();
  body.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body,
    signal: options.signal,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Upload failed');
  }

  const url: string = json.data?.url ?? '';
  if (!url) {
    throw new Error('Storage not configured. Add Supabase credentials to .env.local');
  }

  return { url, path: '' };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  if (file.size === 0) {
    throw new Error('File is empty');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_FILE_SIZE)}.`,
    );
  }

  const bucket = options.bucket ?? DEFAULT_BUCKET;

  // ---- Direct upload (preferred — supports progress + cancel) ----
  if (isStorageConfigured()) {
    const filePath = generateFilePath(file.name);

    // Always try direct XHR first — proven reliable
    try {
      return await uploadDirect(file, filePath, bucket, options);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // XHR failed for large file — try TUS resumable as fallback
      if (file.size >= TUS_THRESHOLD) {
        try {
          return await uploadResumable(file, filePath, bucket, options);
        } catch (tusError) {
          if (tusError instanceof DOMException && tusError.name === 'AbortError') {
            throw tusError;
          }
          // Both failed — throw the original XHR error (more descriptive)
          throw error;
        }
      }

      // Small file XHR failed — try server fallback
      if (file.size <= SERVER_UPLOAD_LIMIT) {
        return uploadViaServer(file, options);
      }
      throw error;
    }
  }

  // ---- Server fallback (small files only) ----
  if (file.size > SERVER_UPLOAD_LIMIT) {
    throw new Error(
      'Large file uploads require Supabase Storage. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local',
    );
  }
  return uploadViaServer(file, options);
}
