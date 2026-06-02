# Content Engine Dashboard

Production monitoring dashboard for the automated content pipeline. Standalone app that connects to the RankPilot database (read-only) and displays real-time pipeline health, throughput metrics, and recent activity.

## Architecture

```
client/          → Vite + React + TypeScript + TailwindCSS
server/          → Express + Drizzle ORM + MySQL2
```

## Quick Start

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Configure database (optional — runs in demo mode without it)
cp server/.env.example server/.env
# Edit server/.env with your RankPilot DB credentials

# Run both client and server
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Health check: http://localhost:3001/api/health

## Demo Mode

If `DATABASE_URL` is not set, the server returns placeholder data so the frontend renders correctly during development. Set the database URL to connect to the live RankPilot TiDB instance.

## Pages

- `/` — Dashboard (production monitoring, pipeline flow, health, throughput)
- `/pipeline` — Pipeline Editor (visual node-based flow builder)

## Design System

- Light peachy background (#fdf0e9) with subtle grid overlay
- Floating geometric shapes (circles, diamonds, triangles)
- White cards with thick dark borders (2.5px #1a1a1a)
- Pastel accent colors: mint, yellow, peach, lavender, pink
- Inter font family, bold uppercase section headers
- Status colors: green (healthy), amber (warning), red (error), blue (info)
