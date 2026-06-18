---
name: project-cms-integration
description: How Relay Engine connects to the MediDoodle CMS for live pipeline counts, and the CMS env/domain setup
metadata:
  type: project
---

Relay Engine's dashboard shows live Content Pipeline counts (Intake/Review/Queue/Output) by fetching the CMS endpoint `GET /api/cms/pipeline/counts/`.

**Connection:** `server/cmsPipeline.ts` fetches the counts; base URL is `ENV.cmsBaseUrl` (`server/_core/env.ts`), default `https://sandbox-qa.medicarefaq.com` (overridable via `CMS_BASE_URL` env var).

**Why sandbox-qa, not production:** The CMS (`medicarefaq-next`, Next.js on Vercel + Neon Postgres) gates all `/admin` and `/api/cms/*` surfaces behind an `ENABLE_CMS` flag (`src/middleware.ts`, fail-closed). On production `main` (`medicarefaq.com`) the flag is unset → those routes 404. The flag is `true` on the `develop`/staging deploy served at `sandbox-qa.medicarefaq.com`, where the CMS admin actually lives. So Relay Engine must point at sandbox-qa, not the prod domain.

**Caveat:** The counts endpoint is currently publicly reachable at sandbox-qa (returns 200). If the CMS team later firewalls that deploy (Vercel Deployment Protection / Trusted IPs / VPN — mentioned in the CMS's CLAUDE.md), Relay Engine's serverless fetch will start failing and the pipeline tiles will show zeros. If that happens, switch to a direct read-only Neon DB connection instead.

**CMS branching workflow** (if ever editing that repo — but do CMS work in its own chat): branch off `develop`, PR into `develop`; releases go `develop` → `main`. Never branch off `main`. See [[feedback-git-workflow]].
