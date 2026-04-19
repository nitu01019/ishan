# Netlify Environment Variables

**Last Updated:** 2026-04-19

Set these in **Netlify UI → Site settings → Environment variables**. Use the same names in `.env.local` for local development.

## Required

| Variable | Notes |
|----------|-------|
| `ADMIN_PASSWORD` | Strong; 20+ random chars. **DO NOT use `admin123`.** Generate with `openssl rand -base64 24`. |
| `SESSION_SECRET` | 32+ bytes hex. Generate with `openssl rand -hex 32`. Used to sign HMAC-SHA256 session cookies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. From **Supabase Dashboard → Project Settings → API**. Never expose to the browser — do not prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public. Supabase project URL, e.g. `https://xyzabc.supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public. Supabase anon key from **Project Settings → API**. |
| `NEXT_PUBLIC_SITE_URL` | Public. Canonical site URL, e.g. `https://example.netlify.app`. Used in sitemap and Open Graph metadata. |

## Optional

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console verification meta tag. |

## Checklist

Before the first production deploy:

- [ ] `ADMIN_PASSWORD` is set to a strong random value (not `admin123`, not the default).
- [ ] `SESSION_SECRET` is set (generated via `openssl rand -hex 32`).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set and **not** prefixed with `NEXT_PUBLIC_`.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the production Netlify domain.
- [ ] Scope is set correctly per env (Production / Deploy previews / Branch deploys) in the Netlify UI.
- [ ] Variables are saved **before** triggering a deploy (env var changes do not automatically redeploy — trigger a new deploy after editing).

## Rotation

If a secret is exposed:

1. Rotate it in its source (Supabase Dashboard for keys; regenerate `SESSION_SECRET` / `ADMIN_PASSWORD` locally).
2. Update the value in Netlify UI.
3. Trigger a new deploy.
4. Invalidate existing admin sessions (users will need to re-login after `SESSION_SECRET` rotation).
