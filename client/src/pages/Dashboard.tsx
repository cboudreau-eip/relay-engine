import {
  Cloud,
  Inbox,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileText,
  Calendar,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../lib/api';

// Placeholder data until API is wired up
const PLACEHOLDER = {
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

export default function Dashboard() {
  // When API is ready, this will fetch real data
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    placeholderData: PLACEHOLDER,
  });

  const d = data || PLACEHOLDER;

  return (
    <div className="relative z-5 p-8 max-w-[1400px] mx-auto space-y-6">
      {/* ── PIPELINE FLOW ─────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        <FlowNode
          icon={<Cloud size={22} />}
          title="SCRAPER"
          subtitle="S3 bucket"
          badge={{ label: 'Connected', color: 'green' }}
        />
        <FlowNode
          icon={<Inbox size={22} />}
          title="INGESTED"
          value="12"
          subtitle="jobs · last 7 days"
          bgColor="bg-yellow"
        />
        <FlowNode
          icon={<BookOpen size={22} />}
          title="BRIEFS PENDING"
          value="4"
          subtitle="awaiting review"
          badge={{ label: 'Needs attention', color: 'amber' }}
          bgColor="bg-peach"
          alert
        />
        <FlowNode
          icon={<Sparkles size={22} />}
          title="GENERATING"
          value="1"
          subtitle="article in progress"
          badge={{ label: 'Running now', color: 'blue', pulse: true }}
          bgColor="bg-lavender"
        />
        <FlowNode
          icon={<CheckCircle2 size={22} />}
          title="ARTICLES COMPLETE"
          value="47"
          subtitle="total · 9 this week"
          badge={{ label: '31 sent to CMS', color: 'green' }}
          bgColor="bg-mint"
        />
      </div>

      {/* ── RECENT ACTIVITY + SCHEDULED JOBS ──────────────── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Recent Activity
            </h2>
            <a
              href="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {d.recentActivity.map((item) => (
              <ActivityRow key={item.id} {...item} />
            ))}
          </div>
        </div>

        {/* Scheduled Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Scheduled Jobs
            </h2>
            <a
              href="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {d.scheduledJobs.map((job) => (
              <JobRow key={job.id} {...job} />
            ))}
          </div>
        </div>
      </div>

      {/* ── HEALTH + THROUGHPUT ────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pipeline Health */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Pipeline Health
            </h2>
            <span className="badge text-status-green border-status-green bg-status-green-bg">
              Healthy
            </span>
          </div>
          <div className="space-y-3">
            <HealthRow label="Last ingestion" value="3 hours ago" />
            <HealthRow
              label="Failed jobs (24h)"
              value="0 failures"
              valueColor="text-status-green"
            />
            <HealthRow label="Error rate (7d)" value="2.1%" />
            <HealthRow
              label="Auto-generate"
              value="ON"
              valueColor="text-status-green"
            />
            <HealthRow label="Brief approval rate" value="78%" />
          </div>
        </div>

        {/* Scheduler Health */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Scheduler Health
            </h2>
            <span className="badge text-status-amber border-status-amber bg-status-amber-bg">
              1 issue
            </span>
          </div>
          <div className="space-y-3">
            <HealthRow label="Active jobs" value="2 of 3" />
            <HealthRow
              label="Currently running"
              value="1 job"
              valueColor="text-status-blue"
            />
            <HealthRow
              label="Failed runs (24h)"
              value="1 failure"
              valueColor="text-status-red"
            />
            <HealthRow label="Next scheduled run" value="Today, 9:00 PM" />
            <HealthRow label="Avg run duration" value="4m 12s" />
          </div>
        </div>

        {/* Throughput */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Throughput
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              Articles generated
            </span>
          </div>
          <div className="space-y-3">
            <HealthRow label="Today" value="2" />
            <HealthRow label="This week" value="9" />
            <HealthRow label="This month" value="31" />
            <HealthRow label="Avg run time" value="4m 12s" />
            <HealthRow label="Total (all time)" value="47" />
          </div>
        </div>
      </div>

      {/* ── SUMMARY STATS ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-4xl font-black">47</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
            Articles Generated
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl font-black">31</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
            Sent to CMS
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl font-black">3</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
            Scheduled Jobs
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function FlowNode({
  icon,
  title,
  value,
  subtitle,
  badge,
  bgColor,
  alert,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  subtitle?: string;
  badge?: { label: string; color: string; pulse?: boolean };
  bgColor?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`card p-5 text-center relative ${bgColor || ''} ${
        alert ? 'border-status-amber' : ''
      }`}
    >
      <div className="flex justify-center mb-2 text-gray-700">{icon}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-600 mb-1">
        {title}
      </div>
      {value && <div className="text-3xl font-black">{value}</div>}
      {subtitle && (
        <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
      )}
      {badge && (
        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              badge.color === 'green'
                ? 'text-status-green border-status-green bg-status-green-bg'
                : badge.color === 'amber'
                ? 'text-status-amber border-status-amber bg-status-amber-bg'
                : badge.color === 'blue'
                ? 'text-status-blue border-status-blue bg-status-blue-bg'
                : 'text-status-green border-status-green bg-status-green-bg'
            }`}
          >
            {badge.pulse && (
              <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
            )}
            {badge.label}
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  type,
  title,
  detail,
}: {
  type: string;
  title: string;
  detail: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    generated: <FileText size={16} className="text-status-green" />,
    approved: <CheckCircle2 size={16} className="text-status-blue" />,
    success: <Clock size={16} className="text-status-green" />,
    failed: <XCircle size={16} className="text-status-red" />,
  };

  const badgeColors: Record<string, string> = {
    generated: 'text-status-green border-status-green bg-status-green-bg',
    approved: 'text-status-blue border-status-blue bg-status-blue-bg',
    success: 'text-status-green border-status-green bg-status-green-bg',
    failed: 'text-status-red border-status-red bg-status-red-bg',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate">{title}</div>
        <div className="text-xs text-gray-400">{detail}</div>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColors[type]}`}
      >
        {type}
      </span>
    </div>
  );
}

function JobRow({
  name,
  schedule,
  status,
}: {
  name: string;
  schedule: string;
  status: string;
}) {
  const statusColors: Record<string, string> = {
    running: 'text-status-green border-status-green bg-status-green-bg',
    failed: 'text-status-red border-status-red bg-status-red-bg',
    paused: 'text-status-amber border-status-amber bg-status-amber-bg',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Calendar size={16} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold">{name}</div>
        <div className="text-xs text-gray-400">{schedule}</div>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[status]}`}
      >
        {status}
      </span>
    </div>
  );
}

function HealthRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${valueColor || ''}`}>{value}</span>
    </div>
  );
}
