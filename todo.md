# Content Engine — Command Center TODO

## Infrastructure
- [x] Connect to external RankPilot TiDB database (RANKPILOT_DATABASE_URL)
- [x] Inspect live schema and align column names
- [x] Build rankpilotDb.ts query module (flow, throughput, health, scheduled job, activity, run status)
- [x] Expose engine tRPC router (dashboard, scheduledJob, activity, pipelineRunStatus, health)
- [x] Connectivity + query vitest suite (rankpilotDb.test.ts) — all passing

## Design System
- [x] Pastel-geometric palette + grid background in index.css
- [x] Inter font wired in index.html
- [x] Floating shapes background
- [x] Shared engine-ui atoms (Pill, EngineCard, CardHeader, ListIcon, HealthRow)
- [x] EngineLayout navbar with live DB status indicator
- [x] Browser tab title set

## Dashboard Page
- [x] Pipeline flow row (Scraper → Ingested → Briefs → Generating → Articles)
- [x] Recent Activity feed (live, color-coded by event type)
- [x] Scheduled Job card (Agentic handler: runs, queue, duration, failures)
- [x] Pipeline Health card
- [x] Throughput card (today/week/month/total)
- [x] 14-day bar chart
- [x] Stat cards
- [x] Auto-refresh every 30s

## Pipeline Editor Page
- [x] Node Library sidebar
- [x] Canvas with 4-node flow (Trigger → Topic Discovery → Generate Draft → Publish)
- [x] Live run-state mapping onto nodes
- [x] Current/Last Run panel (live keyword, status, duration)
- [x] Horizontal single-row node layout with scroll
- [x] Placeholder controls show "coming soon" toasts

## Verification
- [x] Run full vitest suite and confirm pass (8/8)
- [x] Browser verification of both pages
- [x] Save checkpoint and deliver URL

## Deploy Fixes
- [x] Fix ERR_MODULE_NOT_FOUND for @shared/const (esbuild alias plugin bundles @shared/* and @/*)
- [x] Verify production bundle boots locally (node dist/index.js)

## Branding
- [x] Favicon: pale-yellow (#FFF9C4) circle with white lightning bolt (svg + ico + png 32/180/192), wired into index.html head
- [x] Change page background to lavender (#E8D4FF); aligned muted/border tokens
