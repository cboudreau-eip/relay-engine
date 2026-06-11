# Relay — Content Pipeline Command Center

## What This Tool Is

Relay is a **read-only monitoring and operations dashboard** for an automated AI content pipeline. It connects directly to the live RankPilot TiDB database and surfaces real-time pipeline health, throughput, and scheduler status in a single command center.

The tool is built for the team running the RankPilot content automation system. It is **not** a content creation tool itself — it observes and reports on what RankPilot is doing.

---

## The Pipeline This Tool Monitors

```
S3 Bucket (ideas/keywords)
        ↓
RankPilot picks up ideas → creates pipeline_jobs
        ↓
Briefs generated (pipeline_briefs) → pending_review
        ↓
Briefs approved → keyword_queue (keyword generation)
        ↓
Articles drafted (articles table) → status: draft
        ↓
Articles published → status: published → pushed to CMS
```

The "Agentic handler" scheduled job orchestrates the keyword queue step — it runs on a schedule, pulls pending keywords, generates articles, and tracks run history.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Tailwind CSS 4 + shadcn/ui |
| Backend | Node.js + Express + tRPC 11 |
| Auth | Manus OAuth |
| App DB | TiDB (MySQL-compatible) via Drizzle ORM |
| External DB | RankPilot TiDB (read-only, separate connection) |
| Hosting | Manus WebDev (Cloud Run) |
| Testing | Vitest |

---

## Key Files

```
server/rankpilotDb.ts       ← All read-only queries against the RankPilot external DB
server/routers.ts           ← tRPC procedures (engine.dashboard, engine.scheduledJob, engine.activity, engine.pipelineRunStatus)
client/src/pages/Dashboard.tsx   ← Production Dashboard page
client/src/pages/Pipeline.tsx    ← Pipeline Editor / flow visualizer page
client/src/components/engine-ui.tsx  ← Shared UI atoms (Pill, EngineCard, RunningPill, etc.)
client/src/components/EngineLayout.tsx  ← Shared navbar + floating shapes layout
client/src/lib/format.ts    ← Shared formatting helpers (duration, relative time, etc.)
drizzle/schema.ts           ← App-level DB schema (users, sessions)
```

---

## Environment Variables

The following secrets must be set for the app to run:

| Variable | Purpose |
|---|---|
| `RANKPILOT_DATABASE_URL` | MySQL connection string to the external RankPilot TiDB database (read-only) |
| `DATABASE_URL` | App-level MySQL/TiDB connection for users/sessions |
| `JWT_SECRET` | Session cookie signing |
| `VITE_APP_ID` | Manus OAuth app ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API bearer token |

The `RANKPILOT_DATABASE_URL` is the most critical — without it, all dashboard data queries will fail. It connects to the live RankPilot TiDB instance.

---

## RankPilot Database Schema (External, Read-Only)

The following tables are queried from the external RankPilot TiDB. **This app never writes to these tables.**

### `pipeline_jobs`
Tracks ideas/keywords ingested from the S3 bucket.
- `id`, `createdAt`, `updatedAt`

### `pipeline_briefs`
Content briefs generated from pipeline jobs, awaiting human review.
- `id`, `briefTitle`, `briefStatus` (`pending_review` | `approved` | `rejected`), `createdAt`, `approvedAt`

### `keyword_queue`
Keywords queued for article generation, linked to scheduled jobs.
- `id`, `keyword`, `status` (`pending` | `completed` | `failed`), `jobId`, `createdAt`

### `articles`
Generated articles at various stages of the pipeline.
- `id`, `title`, `articleStatus` (`draft` | `published` | `review` | `complete`), `createdAt`, `updatedAt`

### `scheduled_jobs`
Scheduler configuration for automated pipeline runs.
- `id`, `name`, `frequency`, `keywordSource`, `isRunning`, `totalGenerated`, `lastRunAt`, `nextRunAt`, `createdAt`

### `job_run_history`
Individual run records for each scheduled job execution.
- `id`, `jobId`, `keyword`, `runStatus`, `queueStatus`, `startedAt`, `completedAt`, `durationMs`, `createdAt`

### `pipeline_settings`
Global pipeline configuration flags.
- `id`, `enabled`, `bucketUrl`, `autoGenerateOutline`, `autoGenerateArticle`, `updatedAt`

---

## Dashboard Sections

### Pipeline Flow Tiles (top row)
Five tiles showing the current state of the pipeline:
1. **Scraper** — S3 bucket connection status from `pipeline_settings`
2. **Ingested** — count of `pipeline_jobs`
3. **Briefs Pending** — count of `pipeline_briefs` where `briefStatus = 'pending_review'`
4. **Generating** — count of `keyword_queue` where `status = 'pending'`
5. **Pushed to CMS** — count of `articles` where `articleStatus = 'published'` and `updatedAt` falls within the current Monday–Friday business week

### Recent Activity Feed
Merged feed of the 20 most recent events across:
- Articles generated (`articles` ordered by `createdAt`)
- Briefs approved/rejected (`pipeline_briefs` with `approvedAt`)
- Scheduler runs (`job_run_history` with keyword + duration)

### Scheduled Job Panel
Live status of the "Agentic handler" scheduled job:
- Name, frequency, keyword source, running state
- Total generated, last run, next run
- Queue pending/completed counts
- Average run duration, failure count (24h)

### Pipeline Health Card
- Scraper enabled, auto-generate outline/article flags
- Brief approval rate (approved / total reviewed)

### Throughput Card
- Today / this week / this month / all-time article counts
- 14-day bar chart of daily article output

### Running Indicator
A pulsing blue "running" pill appears in the dashboard header next to the "Live" badge when `scheduled_jobs.isRunning = true`. It disappears when idle.

---

## Pipeline Editor Page (`/pipeline`)

Visual representation of the four-step pipeline flow:
```
Trigger → Topic Discovery → Generate Draft → Publish
```

Each node maps to a stage in the RankPilot pipeline. The "Last Run" panel shows the most recent `job_run_history` entry (keyword, status, duration).

---

## Auto-Refresh

The dashboard queries refresh automatically every **30 seconds** via tRPC's `refetchInterval`. All data is live — nothing is cached or stored locally.

---

## Design System

- **Color palette:** Pastel geometric — mint green (`#C8F5E0`), soft yellow (`#FFF9C4`), peach (`#FFD6B8`), lavender (`#E8D4FF`), pink (`#FFD6E8`)
- **Background:** Warm peach (`#FDF0E9`) with a subtle grid overlay
- **Font:** Inter (Google Fonts)
- **Favicon:** Lavender circle (`#E8D4FF`) with white lightning bolt

---

## What This Tool Does NOT Do

- It does **not** write to RankPilot's database
- It does **not** trigger pipeline runs (the "Run Now" button is currently a status indicator only)
- It does **not** manage content briefs (approve/reject) — that is a planned future feature
- It does **not** generate content — it monitors content generation

---

## Planned / Future Features

- **Brief Review queue** — approve/reject the 101 pending briefs directly from this dashboard
- **"Run Now" trigger** — actually fire a scheduler run from the dashboard
- **Podcast pipeline integration** — after article publish, generate a podcast script + audio via TTS (ElevenLabs or OpenAI TTS), store MP3 in S3, embed in CMS article
- **EST timezone display** — show scheduler times in U.S. Eastern time with next-run countdown
- **Social post generator** — generate LinkedIn/Twitter posts from published articles

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Set environment variables (copy .env.example and fill in values)
cp server/.env.example server/.env

# Run dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

---

## For LLMs Picking Up This Codebase

If you are an AI assistant working on this project, the most important things to know:

1. **Never write to the RankPilot external DB.** All queries in `server/rankpilotDb.ts` are read-only `SELECT` statements. Keep them that way.
2. **The external DB connection** uses `RANKPILOT_DATABASE_URL` (a separate env var from `DATABASE_URL`). The connection is initialized in `server/rankpilotDb.ts` using `mysql2/promise`.
3. **The esbuild config** (`esbuild.config.mjs`) must alias `@shared/*` and `@/*` so they bundle correctly for production. Do not remove this — the deploy will fail without it.
4. **tRPC procedures** for dashboard data live in the `engine` router in `server/routers.ts`. Add new data procedures there.
5. **Tests** are in `server/rankpilotDb.test.ts` and `server/auth.logout.test.ts`. Run `pnpm test` before every checkpoint.
6. **Design tokens** are in `client/src/index.css`. The pastel palette, grid background, and animation keyframes are all defined there. Do not hard-code colors in components.
