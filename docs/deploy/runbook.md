# Deploy Runbook

**Last Updated:** 2026-04-19

Step-by-step release procedure for the video editor portfolio (Next.js 14 on Netlify + Supabase).

## Pre-flight

- You have access to the Netlify site and the Supabase project.
- Local `main` is up to date: `git pull origin main`.
- All CI checks on the PR are green.

## Release Steps

1. **Apply the Supabase migration.**
   - File: [`supabase/migrations/20260419_login_attempts.sql`](../../supabase/migrations/20260419_login_attempts.sql)
   - Apply via Supabase CLI (`supabase db push`) or the Dashboard SQL editor.
   - Verify: Supabase Dashboard → Table Editor → confirm expected tables/columns exist.

2. **Set env vars** per [`netlify-env-vars.md`](./netlify-env-vars.md).
   - Netlify UI → **Site settings → Environment variables**.
   - Confirm every required variable from the checklist is present for the correct scope (Production).

3. **Merge the PR to `main`.**
   - Use the standard PR merge flow (squash or merge, per project convention).
   - Netlify automatically starts a production build on the new `main`.

4. **Wait for the Netlify preview / deploy URL.**
   - Netlify UI → **Deploys** → watch the new deploy reach status **Published** (for production) or **Ready** (for a preview).
   - Note the unique deploy URL (e.g. `https://deploy-preview-42--yoursite.netlify.app`).

5. **Run the smoke test against the preview URL.**
   ```bash
   ./scripts/smoke-test.sh https://<preview-or-deploy-url>
   ```
   Expected: script exits 0 and prints `smoke test passed`.

6. **Promote to production** (if the preview was a branch/preview deploy).
   - Netlify UI → **Deploys** → select the green deploy → **Publish deploy**.
   - If `main` merged directly to production, this step is automatic.

7. **Post-deploy verification.**
   - Visit `NEXT_PUBLIC_SITE_URL` in a browser; confirm the homepage renders.
   - Visit `/admin`; confirm the login page renders (do **not** attempt login in verification — use a separate QA account if needed).
   - Confirm no client-side console errors.

## Rollback

If the new deploy is broken:

1. Netlify UI → **Deploys**.
2. Find the previous green production deploy (status **Published**).
3. Click the deploy → **Publish deploy** to make it live again.
4. Netlify swaps the published deploy atomically (no rebuild needed).
5. File an issue with the failing deploy ID and logs before re-attempting the release.

## Troubleshooting

- **Build fails on Netlify but succeeds locally:** check Node version parity (Netlify reads `.nvmrc` / `netlify.toml`), and confirm all env vars are set in the build scope.
- **Runtime 500s after deploy:** verify `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` are set in the Production scope, then re-deploy.
- **Admin login fails silently:** rotate `SESSION_SECRET`, update Netlify, re-deploy — existing sessions will be invalidated.

## Related

- [`netlify-env-vars.md`](./netlify-env-vars.md) — required env vars checklist
- [`../VIDEO-UPLOAD-GUIDE.md`](../VIDEO-UPLOAD-GUIDE.md) — upload flow + known risks
