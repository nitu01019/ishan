# Backend Planning Document

## 1. TypeScript Type Definitions

All shared types live in `src/types/` and are imported by both API route handlers and client code.

### 1.1 Common Types

```typescript
// src/types/common.ts

/** ISO-8601 string when serialized over JSON; Firestore Timestamp when in DB */
export type SerializedTimestamp = string;

/** Consistent envelope for every API response */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly meta?: PaginationMeta;
}

export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

/** Shape returned by POST /api/upload */
export interface UploadResult {
  readonly url: string;
  readonly path: string;
  readonly contentType: string;
  readonly size: number;
}
```

### 1.2 Collection Types

```typescript
// src/types/video.ts

export type VideoCategory = "recent" | "short" | "long";
export type VideoPlatform = "youtube" | "vimeo" | "tiktok" | "instagram";

export interface Video {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly thumbnailUrl: string;
  readonly videoUrl: string;
  readonly category: VideoCategory;
  readonly creatorName: string;
  readonly viewCount: string;
  readonly platform: VideoPlatform;
  readonly order: number;
  readonly createdAt: SerializedTimestamp;
  readonly isVisible: boolean;
}

export type CreateVideoInput = Omit<Video, "id" | "createdAt">;
export type UpdateVideoInput = Partial<Omit<Video, "id" | "createdAt">>;
```

```typescript
// src/types/testimonial.ts

export interface Testimonial {
  readonly id: string;
  readonly quote: string;
  readonly clientName: string;
  readonly clientRole: string;
  readonly clientAvatar: string;
  readonly rating: number; // 1-5
  readonly order: number;
  readonly isVisible: boolean;
}

export type CreateTestimonialInput = Omit<Testimonial, "id">;
export type UpdateTestimonialInput = Partial<Omit<Testimonial, "id">>;
```

```typescript
// src/types/service.ts

export interface Service {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly isVisible: boolean;
}

export type CreateServiceInput = Omit<Service, "id">;
export type UpdateServiceInput = Partial<Omit<Service, "id">>;
```

```typescript
// src/types/pricing.ts

export interface PricingPlan {
  readonly id: string;
  readonly planName: string;
  readonly price: number;
  readonly period: string;
  readonly features: readonly string[];
  readonly isHighlighted: boolean;
  readonly order: number;
}

export type CreatePricingInput = Omit<PricingPlan, "id">;
export type UpdatePricingInput = Partial<Omit<PricingPlan, "id">>;
```

```typescript
// src/types/faq.ts

export interface Faq {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly order: number;
  readonly isVisible: boolean;
}

export type CreateFaqInput = Omit<Faq, "id">;
export type UpdateFaqInput = Partial<Omit<Faq, "id">>;
```

```typescript
// src/types/site-config.ts

export interface SocialLinks {
  readonly linkedin: string;
  readonly instagram: string;
  readonly twitter: string;
}

export interface HeroConfig {
  readonly headline: string;
  readonly subtitle: string;
  readonly ctaText: string;
  readonly socialProofText: string;
}

export interface FooterConfig {
  readonly name: string;
  readonly tagline: string;
  readonly socials: SocialLinks;
}

export interface SiteConfig {
  readonly hero: HeroConfig;
  readonly skills: readonly string[];
  readonly footer: FooterConfig;
  readonly bookingLink: string;
}

export type UpdateSiteConfigInput = Partial<SiteConfig>;
```

```typescript
// src/types/auth.ts

export interface LoginRequest {
  readonly password: string;
}

export interface AuthStatus {
  readonly authenticated: boolean;
}
```

### 1.3 Barrel Export

```typescript
// src/types/index.ts

export * from "./common";
export * from "./video";
export * from "./testimonial";
export * from "./service";
export * from "./pricing";
export * from "./faq";
export * from "./site-config";
export * from "./auth";
```

---

## 2. API Route Table

All routes are Next.js App Router Route Handlers under `src/app/api/`.

| HTTP Method | Path                       | Auth Required | Request Body                | Response `data` Shape            | Notes                                      |
|-------------|----------------------------|---------------|-----------------------------|----------------------------------|--------------------------------------------|
| GET         | /api/videos                | No            | Query: `?category=`         | `Video[]`                        | Filter by category; returns visible only for public |
| POST        | /api/videos                | Yes           | `CreateVideoInput`          | `Video`                          | Generates `id` and `createdAt` server-side |
| PUT         | /api/videos/[id]           | Yes           | `UpdateVideoInput`          | `Video`                          | Partial update                             |
| DELETE      | /api/videos/[id]           | Yes           | None                        | `{ deleted: true }`              | Hard delete                                |
| GET         | /api/testimonials          | No            | None                        | `Testimonial[]`                  | Sorted by `order` ascending                |
| POST        | /api/testimonials          | Yes           | `CreateTestimonialInput`    | `Testimonial`                    |                                            |
| PUT         | /api/testimonials/[id]     | Yes           | `UpdateTestimonialInput`    | `Testimonial`                    |                                            |
| DELETE      | /api/testimonials/[id]     | Yes           | None                        | `{ deleted: true }`              |                                            |
| GET         | /api/services              | No            | None                        | `Service[]`                      | Sorted by `order` ascending                |
| POST        | /api/services              | Yes           | `CreateServiceInput`        | `Service`                        |                                            |
| PUT         | /api/services/[id]         | Yes           | `UpdateServiceInput`        | `Service`                        |                                            |
| DELETE      | /api/services/[id]         | Yes           | None                        | `{ deleted: true }`              |                                            |
| GET         | /api/pricing               | No            | None                        | `PricingPlan[]`                  | Sorted by `order` ascending                |
| POST        | /api/pricing               | Yes           | `CreatePricingInput`        | `PricingPlan`                    |                                            |
| PUT         | /api/pricing/[id]          | Yes           | `UpdatePricingInput`        | `PricingPlan`                    |                                            |
| DELETE      | /api/pricing/[id]          | Yes           | None                        | `{ deleted: true }`              |                                            |
| GET         | /api/faqs                  | No            | None                        | `Faq[]`                          | Sorted by `order` ascending                |
| POST        | /api/faqs                  | Yes           | `CreateFaqInput`            | `Faq`                            |                                            |
| PUT         | /api/faqs/[id]             | Yes           | `UpdateFaqInput`            | `Faq`                            |                                            |
| DELETE      | /api/faqs/[id]             | Yes           | None                        | `{ deleted: true }`              |                                            |
| GET         | /api/site-config           | No            | None                        | `SiteConfig`                     | Single document read                       |
| PUT         | /api/site-config           | Yes           | `UpdateSiteConfigInput`     | `SiteConfig`                     | Partial merge update                       |
| POST        | /api/upload                | Yes           | `multipart/form-data`       | `UploadResult`                   | Accepts image/video files                  |
| POST        | /api/auth/login            | No            | `LoginRequest`              | `AuthStatus`                     | Sets httpOnly cookie on success            |
| GET         | /api/auth/check            | No            | None                        | `AuthStatus`                     | Returns `{ authenticated: true/false }`    |
| POST        | /api/auth/logout           | No            | None                        | `AuthStatus`                     | Clears session cookie                      |

### Query Parameters (GET /api/videos)

| Param      | Type     | Required | Default | Description                     |
|------------|----------|----------|---------|---------------------------------|
| `category` | string   | No       | all     | Filter: `recent`, `short`, `long` |

### Response Envelope

Every response uses `ApiResponse<T>`:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error response:

```json
{
  "success": false,
  "data": null,
  "error": "Descriptive error message"
}
```

---

## 3. Auth Flow

### 3.1 Diagram

```
  Client (Admin Panel)                    Server (API Routes)
  =====================                   ====================

  1. POST /api/auth/login
     { password: "***" }  ───────────────>  Compare against
                                            process.env.ADMIN_PASSWORD
                                            (constant-time comparison)

                           <───────────────  Set-Cookie: session=<signed-token>;
                                            HttpOnly; Secure; SameSite=Strict;
                                            Path=/; Max-Age=86400

  2. Subsequent admin requests
     Cookie: session=<signed-token>  ────>  middleware.ts intercepts /api/*
                                            routes (except /api/auth/*)

                                            Verify token signature
                                            Check expiry

                           <───────────────  200 + data  OR  401 Unauthorized

  3. GET /api/auth/check
     Cookie: session=<signed-token>  ────>  Verify token, return status

                           <───────────────  { authenticated: true/false }

  4. POST /api/auth/logout
     Cookie: session=<signed-token>  ────>  Clear cookie

                           <───────────────  Set-Cookie: session=; Max-Age=0
                                            { authenticated: false }
```

### 3.2 Session Token Strategy

- Token: HMAC-SHA256 signed JSON payload `{ exp: <unix-timestamp> }`.
- Signing key: derived from `ADMIN_PASSWORD` via SHA-256 hash (so no extra env var needed).
- Token lifetime: 24 hours (configurable via `SESSION_MAX_AGE_SECONDS` env var, default `86400`).
- No external JWT library required; use Node.js built-in `crypto` module.

### 3.3 Middleware Implementation Plan

File: `src/middleware.ts`

```
Request arrives
  |
  +--> Path matches /api/auth/* ?
  |      YES --> pass through (no auth check)
  |      NO  --> continue
  |
  +--> Method is GET and path is a public collection route?
  |      YES --> pass through (public reads allowed)
  |      NO  --> continue
  |
  +--> Extract session cookie
  |      Missing --> 401 ApiResponse { error: "Authentication required" }
  |
  +--> Verify HMAC signature
  |      Invalid --> 401 ApiResponse { error: "Invalid session" }
  |
  +--> Check token expiry
  |      Expired --> 401 ApiResponse { error: "Session expired" }
  |
  +--> Allow request through
```

Routes that require auth (POST, PUT, DELETE on all resource endpoints, PUT on site-config, POST on upload) are protected. GET requests on public collection routes pass through without auth.

### 3.4 Password Validation

```typescript
import { timingSafeEqual, createHmac } from "crypto";

function validatePassword(input: string, expected: string): boolean {
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  if (inputBuf.length !== expectedBuf.length) {
    return false;
  }
  return timingSafeEqual(inputBuf, expectedBuf);
}
```

Constant-time comparison prevents timing attacks.

---

## 4. Firebase Fallback Strategy

### 4.1 Detection Logic

```
Application starts
  |
  +--> Check for env vars:
  |      NEXT_PUBLIC_FIREBASE_API_KEY
  |      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  |      NEXT_PUBLIC_FIREBASE_PROJECT_ID
  |      FIREBASE_STORAGE_BUCKET (server only)
  |
  +--> ALL present?
  |      YES --> use Firebase adapter
  |      NO  --> use Local JSON adapter
```

### 4.2 Data Access Layer (Repository Pattern)

A unified repository interface abstracts the storage backend. Each collection gets its own repository instance, but all share the same interface.

```
src/lib/
  data/
    types.ts              # Repository interface
    firebase-adapter.ts   # Firestore implementation
    local-adapter.ts      # seed.json read/write implementation
    index.ts              # Factory: returns correct adapter based on env
  firebase/
    config.ts             # Firebase app initialization (lazy, conditional)
  seed.json               # Local fallback data
```

#### Repository Interface

```typescript
// src/lib/data/types.ts

export interface Repository<T> {
  findAll(filters?: Record<string, unknown>): Promise<readonly T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

/** Specialized for the single-document siteConfig collection */
export interface SingleDocRepository<T> {
  get(): Promise<T>;
  update(data: Partial<T>): Promise<T>;
}
```

#### Firebase Adapter

- Uses `firebase-admin` SDK (server-side only, never exposed to client).
- Initialize lazily on first use; cache the app instance.
- Firestore reads use `.orderBy("order")` and `.where("isVisible", "==", true)` for public queries.
- Admin queries omit the `isVisible` filter.

#### Local JSON Adapter

- Reads `src/lib/seed.json` on startup, holds data in memory.
- Writes flush back to `seed.json` using `fs.writeFile` with an atomic write pattern (write to `.tmp`, rename).
- Generates UUIDs via `crypto.randomUUID()` for new documents.
- Suitable for local development and demo deployments.

### 4.3 seed.json Structure

```json
{
  "videos": [],
  "testimonials": [],
  "services": [],
  "pricing": [],
  "faqs": [],
  "siteConfig": {
    "hero": {
      "headline": "",
      "subtitle": "",
      "ctaText": "",
      "socialProofText": ""
    },
    "skills": [],
    "footer": {
      "name": "",
      "tagline": "",
      "socials": {
        "linkedin": "",
        "instagram": "",
        "twitter": ""
      }
    },
    "bookingLink": ""
  }
}
```

### 4.4 Adapter Factory

```typescript
// src/lib/data/index.ts

import type { Repository, SingleDocRepository } from "./types";

function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function createRepository<T>(collection: string): Repository<T> {
  if (isFirebaseConfigured()) {
    // Lazy import to avoid loading firebase-admin when not needed
    const { FirebaseRepository } = require("./firebase-adapter");
    return new FirebaseRepository<T>(collection);
  }
  const { LocalRepository } = require("./local-adapter");
  return new LocalRepository<T>(collection);
}

export function createSingleDocRepository<T>(
  collection: string
): SingleDocRepository<T> {
  if (isFirebaseConfigured()) {
    const { FirebaseSingleDocRepository } = require("./firebase-adapter");
    return new FirebaseSingleDocRepository<T>(collection);
  }
  const { LocalSingleDocRepository } = require("./local-adapter");
  return new LocalSingleDocRepository<T>(collection);
}
```

### 4.5 Upload Fallback

When Firebase Storage is not configured:
- `POST /api/upload` saves files to `public/uploads/` directory.
- Returns a URL path relative to the app root: `/uploads/<filename>`.
- Filenames are prefixed with a timestamp and random suffix to avoid collisions.
- In production with Firebase, files go to Firebase Storage and a signed download URL is returned.

---

## 5. Error Handling Patterns

### 5.1 Error Response Envelope

All errors follow the `ApiResponse` shape. HTTP status codes are set correctly alongside the JSON body.

| HTTP Status | Meaning                    | When Used                                    |
|-------------|----------------------------|----------------------------------------------|
| 200         | OK                         | Successful read, update, delete              |
| 201         | Created                    | Successful resource creation                 |
| 400         | Bad Request                | Validation failure, malformed body           |
| 401         | Unauthorized               | Missing or invalid session cookie            |
| 404         | Not Found                  | Resource with given ID does not exist        |
| 405         | Method Not Allowed         | Wrong HTTP method for the route              |
| 413         | Payload Too Large          | Upload exceeds size limit                    |
| 415         | Unsupported Media Type     | Upload with disallowed file type             |
| 429         | Too Many Requests          | Rate limit exceeded                          |
| 500         | Internal Server Error      | Unhandled exception, DB connection failure   |

### 5.2 Error Helper

```typescript
// src/lib/api/response.ts

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

export function errorResponse(
  message: string,
  status: number = 500
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { success: false, data: null, error: message },
    { status }
  );
}
```

### 5.3 Validation Pattern

Each mutation endpoint validates input before passing to the repository. Validation uses a lightweight schema approach (no external library in v1; can migrate to Zod later if needed).

```typescript
// src/lib/api/validate.ts

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateRequired(
  data: Record<string, unknown>,
  fields: readonly string[]
): ValidationResult {
  const errors: string[] = [];
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`Field "${field}" is required`);
    }
  }
  return { valid: errors.length === 0, errors };
}
```

Specific validators per collection check field types, ranges (rating 1-5, order >= 0), and enum membership (category, platform).

### 5.4 Global Error Boundary

Each route handler wraps its logic in a try-catch to ensure uncaught exceptions produce a 500 `ApiResponse` rather than leaking stack traces.

```typescript
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // ... handler logic
  } catch (err) {
    console.error("POST /api/videos error:", err);
    return errorResponse("Internal server error", 500);
  }
}
```

---

## 6. File Upload Flow

### 6.1 Flow Diagram

```
  Admin Panel                              POST /api/upload
  ===========                              ================

  1. User selects file (image or video)
     via <input type="file">

  2. JS creates FormData, appends file
     fetch("/api/upload", {
       method: "POST",
       body: formData,
       // Note: do NOT set Content-Type header;
       // browser sets multipart boundary automatically
     })
                               ──────────>

  3. Route handler:
     a. Verify auth (middleware already did this)
     b. Parse multipart form data via request.formData()
     c. Extract File object
     d. Validate:
        - File size <= MAX_UPLOAD_SIZE (10 MB default)
        - MIME type in allowlist
     e. If Firebase Storage configured:
        - Generate storage path: uploads/<timestamp>-<random>.<ext>
        - Upload buffer to Firebase Storage
        - Get signed download URL (long expiry or public)
        - Return URL
     f. If local fallback:
        - Write to public/uploads/<timestamp>-<random>.<ext>
        - Return relative URL path

                               <──────────

  4. Admin panel receives UploadResult
     { url: "https://...", path: "...", contentType: "...", size: 123 }

  5. Admin panel uses returned URL to populate
     thumbnailUrl or clientAvatar field in the
     create/update form.
```

### 6.2 Upload Constraints

| Constraint        | Value                                              |
|-------------------|----------------------------------------------------|
| Max file size     | 10 MB (configurable via `MAX_UPLOAD_SIZE_BYTES`)   |
| Allowed image MIME | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Allowed video MIME | `video/mp4`, `video/webm`                          |
| Max filename length | 255 characters                                   |
| Storage path format | `uploads/<timestamp>-<randomUUID>.<ext>`         |

### 6.3 Upload Handler Pseudocode

```typescript
// src/app/api/upload/route.ts

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm",
]);

const MAX_SIZE = Number(process.env.MAX_UPLOAD_SIZE_BYTES) || 10 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return errorResponse("No file provided", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return errorResponse(`File type "${file.type}" not allowed`, 415);
  }

  if (file.size > MAX_SIZE) {
    return errorResponse(`File exceeds maximum size of ${MAX_SIZE} bytes`, 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  if (isFirebaseConfigured()) {
    const url = await uploadToFirebaseStorage(buffer, storagePath, file.type);
    return successResponse({ url, path: storagePath, contentType: file.type, size: file.size }, 201);
  }

  const localPath = await writeToPublicDir(buffer, storagePath);
  return successResponse({ url: `/${storagePath}`, path: localPath, contentType: file.type, size: file.size }, 201);
}
```

---

## 7. CORS and Security Headers

### 7.1 Next.js Middleware Headers

Applied in `src/middleware.ts` or via `next.config.js` headers configuration.

```typescript
// next.config.js (headers section)

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires these
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.googleapis.com https://*.firebasestorage.app",
      "media-src 'self' blob: https://*.youtube.com https://*.vimeo.com https://*.tiktok.com",
      "frame-src https://*.youtube.com https://*.vimeo.com https://*.tiktok.com https://*.instagram.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com",
    ].join("; "),
  },
];
```

### 7.2 CORS Strategy

Since this is a Next.js full-stack application where the frontend and API share the same origin, **CORS headers are not needed for same-origin requests**.

However, if the API is consumed by external clients in the future, CORS can be enabled per-route:

```typescript
// Utility for routes that need CORS
export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
```

For OPTIONS preflight requests on CORS-enabled routes:

```typescript
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
```

### 7.3 Cookie Security Attributes

| Attribute   | Value            | Reason                                           |
|-------------|------------------|--------------------------------------------------|
| `HttpOnly`  | `true`           | Prevents JavaScript access (XSS mitigation)      |
| `Secure`    | `true` in prod   | Cookie only sent over HTTPS                      |
| `SameSite`  | `Strict`         | Prevents CSRF by blocking cross-site cookie sending |
| `Path`      | `/`              | Cookie available for all routes                  |
| `Max-Age`   | `86400`          | 24-hour session (matches token expiry)           |

---

## 8. Rate Limiting Considerations

### 8.1 Strategy

Since this portfolio site is low-traffic and deployed to serverless (Vercel), a full Redis-backed rate limiter is unnecessary for v1. Instead, use an in-memory approach with caveats.

### 8.2 Implementation Tiers

#### Tier 1: Vercel Built-in Protection (Recommended for v1)

If deploying on Vercel, leverage Vercel Firewall and DDoS protection which is included in all plans. No code changes needed.

#### Tier 2: In-Memory Token Bucket (Development / Single-Instance)

For self-hosted or development environments, use a simple in-memory rate limiter per IP address.

```typescript
// src/lib/api/rate-limit.ts

interface RateLimitEntry {
  readonly count: number;
  readonly resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "auth:login": { maxRequests: 5, windowMs: 15 * 60 * 1000 },   // 5 per 15 min
  "upload":     { maxRequests: 20, windowMs: 60 * 60 * 1000 },   // 20 per hour
  "mutation":   { maxRequests: 60, windowMs: 60 * 1000 },         // 60 per minute
  "read":       { maxRequests: 120, windowMs: 60 * 1000 },        // 120 per minute
};
```

**Caveat**: In-memory stores reset on cold starts and do not share state across serverless function instances. This is acceptable for a portfolio site but not for high-security applications.

#### Tier 3: Upstash Redis Rate Limiting (Future)

If abuse becomes a concern, migrate to `@upstash/ratelimit` with Upstash Redis (free tier available, serverless-compatible).

### 8.3 Rate Limit Headers

Responses from rate-limited endpoints include:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1700000000
```

When exceeded, return `429 Too Many Requests`:

```json
{
  "success": false,
  "data": null,
  "error": "Too many requests. Please try again later."
}
```

### 8.4 Per-Endpoint Limits

| Endpoint Group        | Max Requests | Window   | Notes                          |
|-----------------------|-------------|----------|--------------------------------|
| `POST /api/auth/login`| 5           | 15 min   | Brute-force protection         |
| `POST /api/upload`    | 20          | 1 hour   | Prevent storage abuse          |
| `POST/PUT/DELETE *`   | 60          | 1 min    | General mutation throttle      |
| `GET *`               | 120         | 1 min    | Public read endpoints          |

---

## 9. File Structure Summary

```
src/
  app/
    api/
      auth/
        login/route.ts
        check/route.ts
        logout/route.ts
      videos/
        route.ts               # GET (list), POST (create)
        [id]/route.ts          # PUT (update), DELETE (delete)
      testimonials/
        route.ts
        [id]/route.ts
      services/
        route.ts
        [id]/route.ts
      pricing/
        route.ts
        [id]/route.ts
      faqs/
        route.ts
        [id]/route.ts
      site-config/
        route.ts               # GET, PUT
      upload/
        route.ts               # POST
  lib/
    api/
      response.ts              # successResponse, errorResponse helpers
      validate.ts              # Input validation utilities
      rate-limit.ts            # In-memory rate limiter
    auth/
      session.ts               # Token sign/verify, cookie helpers
      password.ts              # Constant-time password comparison
    data/
      types.ts                 # Repository interface
      firebase-adapter.ts      # Firestore implementation
      local-adapter.ts         # seed.json implementation
      index.ts                 # Adapter factory
    firebase/
      config.ts                # Firebase app init (conditional)
      storage.ts               # Firebase Storage upload helper
    seed.json                  # Local fallback data
  middleware.ts                # Auth + security headers middleware
  types/
    common.ts
    video.ts
    testimonial.ts
    service.ts
    pricing.ts
    faq.ts
    site-config.ts
    auth.ts
    index.ts
```

---

## 10. Environment Variables

| Variable                              | Required | Default   | Description                          |
|---------------------------------------|----------|-----------|--------------------------------------|
| `ADMIN_PASSWORD`                      | Yes      | -         | Password for admin panel login       |
| `NEXT_PUBLIC_FIREBASE_API_KEY`        | No       | -         | Firebase Web API key                 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`    | No       | -         | Firebase Auth domain                 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`     | No       | -         | Firebase project ID                  |
| `FIREBASE_STORAGE_BUCKET`            | No       | -         | Firebase Storage bucket name         |
| `FIREBASE_SERVICE_ACCOUNT_KEY`       | No       | -         | Base64-encoded service account JSON  |
| `SESSION_MAX_AGE_SECONDS`            | No       | `86400`   | Session cookie/token lifetime        |
| `MAX_UPLOAD_SIZE_BYTES`              | No       | `10485760`| Max upload file size (10 MB)         |
| `ALLOWED_ORIGIN`                     | No       | `*`       | CORS origin (for future external use)|

### .env.example

```env
# Required
ADMIN_PASSWORD=change-me-in-production

# Optional: Firebase (app works without these, falls back to seed.json)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_SERVICE_ACCOUNT_KEY=

# Optional: Tuning
SESSION_MAX_AGE_SECONDS=86400
MAX_UPLOAD_SIZE_BYTES=10485760
```

---

## 11. Implementation Priority

| Phase | Scope                                       | Dependency       |
|-------|---------------------------------------------|------------------|
| 1     | Types, response helpers, validation utils   | None             |
| 2     | Auth (login, check, logout, middleware)      | Phase 1          |
| 3     | Local JSON adapter + seed.json              | Phase 1          |
| 4     | CRUD routes for all collections             | Phases 2, 3      |
| 5     | Firebase adapter                            | Phase 4          |
| 6     | File upload (local fallback first)          | Phase 2          |
| 7     | File upload (Firebase Storage)              | Phases 5, 6      |
| 8     | Rate limiting, security headers             | Phase 4          |
