/**
 * Demo/placeholder data returned when no database is connected.
 * This allows the frontend to render properly during development.
 */

export const demoDashboardData = {
  pipelineFlow: {
    scraper: { status: 'connected', label: 'S3 bucket' },
    ingested: { count: 12, label: 'jobs · last 7 days' },
    briefsPending: { count: 4, label: 'awaiting review', alert: true },
    generating: { count: 1, label: 'article in progress', running: true },
    articlesComplete: { count: 47, label: 'total · 9 this week', cmsSent: 31 },
  },
  recentActivity: [
    {
      id: '1',
      type: 'generated',
      title: 'Medicare Part D 2025 Coverage Guide',
      detail: '1,847 words · Compliance 91/100 · 3 min ago',
    },
    {
      id: '2',
      type: 'approved',
      title: 'Best Medicare Supplement Plans 2025',
      detail: 'Brief approved · Sent to queue · 18 min ago',
    },
    {
      id: '3',
      type: 'success',
      title: 'Weekly Medicare Posts — completed',
      detail: '"medicare advantage 2025" · 4m 12s · 1 hr ago',
    },
    {
      id: '4',
      type: 'failed',
      title: 'Daily AI Keywords — failed',
      detail: 'LLM timeout after 120s · 6 hrs ago',
    },
  ],
  scheduledJobs: [
    {
      id: '1',
      name: 'Weekly Medicare Posts',
      schedule: 'Weekly · Keyword Queue · Last run: Today, 9 AM',
      status: 'running',
    },
    {
      id: '2',
      name: 'Daily AI Keywords',
      schedule: 'Daily · AI-Suggested · Next: Tomorrow, 6 AM',
      status: 'failed',
    },
    {
      id: '3',
      name: 'Monthly Deep Dive',
      schedule: 'Monthly · Keyword Queue · Last run: May 1',
      status: 'paused',
    },
  ],
  pipelineHealth: {
    lastIngestion: '3 hours ago',
    failedJobs24h: 0,
    errorRate7d: '2.1%',
    autoGenerate: true,
    briefApprovalRate: '78%',
    healthy: true,
  },
  schedulerHealth: {
    activeJobs: '2 of 3',
    currentlyRunning: 1,
    failedRuns24h: 1,
    nextScheduledRun: 'Today, 9:00 PM',
    avgRunDuration: '4m 12s',
    issues: 1,
  },
  throughput: {
    today: 2,
    thisWeek: 9,
    thisMonth: 31,
    avgRunTime: '4m 12s',
    total: 47,
  },
};

export const demoPipelineStatus = {
  nodes: [
    { id: 'trigger', type: 'trigger', name: 'Trigger', status: 'completed' },
    {
      id: 'topic-discovery',
      type: 'ai',
      name: 'Topic Discovery',
      status: 'completed',
    },
    {
      id: 'generate-draft',
      type: 'ai',
      name: 'Generate Draft',
      status: 'running',
    },
    { id: 'publish', type: 'output', name: 'Publish', status: 'waiting' },
  ],
  currentRun: {
    step: 'Generate Draft',
    keyword: 'medicare advantage 2025',
    elapsed: '2m 34s',
    job: 'Weekly Medicare Posts',
  },
};
