import { Router } from 'express';
import { isDemoMode } from '../db/index.js';
import { demoPipelineStatus } from '../db/demo-data.js';

const router = Router();

/**
 * GET /api/pipeline/status
 * Returns current pipeline execution status.
 */
router.get('/status', async (_req, res) => {
  try {
    if (isDemoMode()) {
      return res.json(demoPipelineStatus);
    }

    // TODO: Replace with real database queries
    return res.json(demoPipelineStatus);
  } catch (error) {
    console.error('Pipeline status query error:', error);
    return res.status(500).json({ error: 'Failed to fetch pipeline status' });
  }
});

export default router;
