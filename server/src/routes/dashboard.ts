import { Router } from 'express';
import { isDemoMode } from '../db/index.js';
import { demoDashboardData } from '../db/demo-data.js';

const router = Router();

/**
 * GET /api/dashboard
 * Returns aggregated dashboard data for the Command Center.
 * When DATABASE_URL is not set, returns demo data.
 */
router.get('/', async (_req, res) => {
  try {
    if (isDemoMode()) {
      return res.json(demoDashboardData);
    }

    // TODO: Replace with real database queries
    // This is where we'll aggregate data from:
    // - pipeline_jobs (ingestion counts)
    // - pipeline_briefs (pending briefs)
    // - articles (generation counts, CMS status)
    // - scheduled_jobs (job status, run counts)
    // - job_run_history (recent activity, failures)
    // - keyword_queue (queue levels)
    // - pipeline_settings (auto-generate status, last poll)

    return res.json(demoDashboardData);
  } catch (error) {
    console.error('Dashboard query error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
