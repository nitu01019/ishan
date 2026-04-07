# Video Upload Guide for Ishan's Portfolio

## Quick Start: Using Seed Data (No Firebase)

The simplest way to update videos is editing `src/data/seed.json` directly.

### Video Categories
- **recent** — Shows in the "My Recent Edits" carousel (3 recommended)
- **short** — Shows in "Short Videos" section (3 recommended)
- **long** — Shows in "Long Videos" grid (6 recommended)

### Adding a Video
Add an entry to the `videos` array in `seed.json`:
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
  "createdAt": "2025-04-01",
  "isVisible": true
}
```

### Adding Thumbnails
1. Place thumbnail images in `public/thumbnails/`
2. Reference them as `/thumbnails/filename.jpg` in `thumbnailUrl`
3. Recommended size: 1280x720px (16:9) for landscape, 1080x1920px (9:16) for portrait
4. Use WebP or optimized JPG for fast loading

## Using the Admin Panel

### Setup Firebase (Optional)
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database and Storage
3. Copy your config to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
ADMIN_PASSWORD=your-admin-password
```

### Admin Panel Access
1. Go to `http://localhost:3000/admin`
2. Enter the admin password from `.env.local`
3. Manage all content: Videos, Testimonials, Services, Pricing, FAQ

### Uploading via Admin
1. Navigate to Videos in the admin panel
2. Click "Add Video"
3. Fill in details and upload thumbnail
4. The thumbnail uploads to Firebase Storage
5. Video URL should be a YouTube/Vimeo embed URL

## Deploying to Production

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — the site auto-deploys on every push

### SEO Tips
- Keep video titles under 60 characters
- Add descriptive text to video descriptions
- Use high-quality thumbnails (they show in search results)
- Update the sitemap when adding new content
