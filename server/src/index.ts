import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRouter from './routes/dashboard.js';
import pipelineRouter from './routes/pipeline.js';
import { isDemoMode } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/pipeline', pipelineRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: isDemoMode() ? 'demo' : 'live',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n⚡ Content Engine API running on port ${PORT}`);
  if (isDemoMode()) {
    console.log('📋 Running in DEMO mode (no database connected)');
    console.log('   Set DATABASE_URL in .env to connect to RankPilot DB\n');
  } else {
    console.log('🔗 Connected to RankPilot database\n');
  }
});
