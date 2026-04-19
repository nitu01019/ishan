# Video Upload Guide for Ishan's Portfolio

**Last Updated:** 2026-04-19

This portfolio stores video metadata in Supabase (Postgres) and video/thumbnail files in Supabase Storage. The site is hosted on Netlify.

## Quick Start: Using Seed Data (No Supabase)

The simplest way to update videos is editing `src/data/seed.json` directly. When Supabase is unconfigured, the app serves seed data as the fallback.

### Video Categories

- **recent** — Shows in the "My Recent Edits" carousel (3 recommended)
- **short** — Shows in "Short Videos" section (3 recommended)
- **long** — Shows in "Long Videos" grid (6 recommended)

### Adding a Video (seed path)

Add an entry to the `videos` array in `src/data/seed.json`:

```json
{
  "id": "v13",
  "title": "Your Video Title",
  "description": "Brief description",
  "thumbnailUrl": "/thumbnails/your-thumbnail.jpg",
  "videoUrl": "https://youtube.com/watch?v=YOUR_VIDEO_ID",
  "category": "recent",
  "creatorName": "Ishan",
  "viewCount": "50K",
  "platform": "youtube",
  "order": 1,
  "createdAt": "2026-04-01",
  "isVisible": true
}
```

### Adding Thumbnails

1. Place thumbnail images in `public/thumbnails/`.
2. Reference them as `/thumbnails/filename.jpg` in `thumbnailUrl`.
3. Recommended size: 1280x720 (16:9) for landscape, 1080x1920 (9:16) for portrait.
4. Use WebP or optimized JPG for fast loading.

## Using the Admin Panel

### Supabase setup (required for admin uploads)

1. Create a project at <https://supabase.com>.
2. Project Settings → API → copy **Project URL** and **anon public key** into `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_PASSWORD=your_admin_password
   SESSION_SECRET=your_session_signing_secret
   ```

3. Storage → **New Bucket** → name it `uploads` and set it **public**.
4. Storage → Policies → add policies on `uploads`:
   - `INSERT` allowed for `anon` (enables direct browser uploads)
   - `SELECT` allowed for `anon` (enables public read URLs)

### Admin Panel Access

1. Go to `http://localhost:3000/admin`.
2. Enter the admin password from `.env.local`.
3. Manage all content: Videos, Testimonials, Services, Pricing, FAQ.

### Uploading via Admin

1. Navigate to **Videos** in the admin panel.
2. Click **Add Video**.
3. Fill in metadata (title, description, category, order, visibility).
4. For the thumbnail and video file, the browser uploads directly to Supabase Storage using the **TUS resumable upload** protocol (bucket: `uploads`). Resumable uploads survive flaky connections and large files.
5. Once upload completes, the public URL from Supabase Storage is saved in the video record.
6. For externally hosted videos (YouTube/Vimeo), paste the embed URL directly into the `videoUrl` field instead of uploading.

### Known Risk: anon-key direct uploads (P2-9)

The current upload flow uses the Supabase **anon key** in the browser to upload directly to the `uploads` bucket. This is tracked as **P2-9** in `PLAN.md`.

Risk summary:

- The anon key is public (embedded in the browser bundle) — anyone can attempt uploads.
- Mitigations in place: RLS policies on the `uploads` bucket; admin route gating via `ADMIN_PASSWORD` + HMAC session cookie.
- Residual risk: unauthenticated users could theoretically upload via the anon key if they bypass the UI.
- Planned remediation: move uploads behind a server-side signed URL issued only to authenticated admin sessions (tracked in P2-9).

Until P2-9 is closed, keep the `uploads` bucket size quota low, monitor storage usage, and rotate the anon key if abuse is detected.

## Deploying to Production

The portfolio deploys to **Netlify** via the `@netlify/plugin-nextjs` runtime.

1. Push to GitHub; Netlify auto-deploys on push to `main`.
2. Set env vars in **Netlify UI → Site settings → Environment variables** (see [`deploy/netlify-env-vars.md`](deploy/netlify-env-vars.md)).
3. Follow the release checklist in [`deploy/runbook.md`](deploy/runbook.md).

### SEO Tips

- Keep video titles under 60 characters.
- Add descriptive text to video descriptions.
- Use high-quality thumbnails (they show in search results).
- Update the sitemap (`src/app/sitemap.ts`) when adding new static content.
