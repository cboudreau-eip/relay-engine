import { trpc } from "@/lib/trpc";
import { Pill, EngineCard, CardHeader, ListIcon, HealthRow, type Tone } from "@/components/engine-ui";
import { timeAgo, formatDateTime, formatDuration, humanize } from "@/lib/format";
import {
  CloudDownload,
  Inbox,
  BookOpen,
  Sparkles,
  FileCheck2,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip as RTooltip,
  Cell,
} from "recharts";

const REFETCH = 30000;

function FlowCard({
  color,
  icon,
  stage,
  count,
  sub,
  pill,
  connector = true,
}: {
  color: string;
  icon: React.ReactNode;
  stage: string;
  count?: React.ReactNode;
  sub: string;
  pill?: React.ReactNode;
  connector?: boolean;
}) {
  return (
    <div
      className="relative border-[2.5px] border-[#1a1a1a] rounded-xl px-4 py-[18px] text-center transition-transform hover:-translate-y-0.5"
      style={{ background: color }}
    >
      <div className="w-9 h-9 flex items-center justify-center mx-auto mb-2">
        {icon}
      </div>
      <div className="text-[11px] font-extrabold uppercase tracking-[0.06em] mb-1">
        {stage}
      </div>
      {count !== undefined && (
        <div className="text-[32px] font-black leading-none mb-1">{count}</div>
      )}
      <div className="text-[11px] text-[#555]">{sub}</div>
      {pill && <div className="mt-1.5">{pill}</div>}
      {connector && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#888] z-[2]">
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

const activityMeta: Record<
  string,
  { tone: Tone; icon: React.ReactNode; badge: string }
> = {
  article_complete: {
    tone: "green",
    icon: <FileText className="w-4 h-4" />,
    badge: "generated",
  },
  brief_approved: {
    tone: "blue",
    icon: <CheckCircle className="w-4 h-4" />,
    badge: "approved",
  },
  brief_rejected: {
    tone: "red",
    icon: <XCircle className="w-4 h-4" />,
    badge: "rejected",
  },
  scheduler_run: {
    tone: "green",
    icon: <PlayCircle className="w-4 h-4" />,
    badge: "success",
  },
  scheduler_failed: {
    tone: "red",
    icon: <AlertCircle className="w-4 h-4" />,
    badge: "failed",
  },
};

export default function Dashboard() {
  const dashboard = trpc.engine.dashboard.useQuery(undefined, {
    refetchInterval: REFETCH,
  });
  const job = trpc.engine.scheduledJob.useQuery(undefined, {
    refetchInterval: REFETCH,
  });
  const activity = trpc.engine.activity.useQuery(undefined, {
    refetchInterval: REFETCH,
  });

  const flow = dashboard.data?.flow;
  const throughput = dashboard.data?.throughput;
  const health = dashboard.data?.health;
  const j = job.data;

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] font-black uppercase tracking-tight leading-none">
            Production Dashboard
          </h1>
          <p className="text-[13px] text-[#555] mt-1.5">
            Live view of the RankPilot automated content pipeline · auto-refresh 30s
          </p>
        </div>
        {dashboard.isLoading ? (
          <Pill tone="amber">Loading…</Pill>
        ) : dashboard.isError ? (
          <Pill tone="red">Data error</Pill>
        ) : (
          <Pill tone="green">Live</Pill>
        )}
      </div>

      {/* PIPELINE FLOW ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <FlowCard
          color="#c8f5e3"
          icon={<CloudDownload className="w-[22px] h-[22px]" strokeWidth={2.2} />}
          stage="Scraper"
          sub="S3 bucket"
          pill={
            health?.scraperEnabled ? (
              <Pill tone="green">Connected</Pill>
            ) : (
              <Pill tone="amber">Disabled</Pill>
            )
          }
        />
        <FlowCard
          color="#fff9c4"
          icon={<Inbox className="w-[22px] h-[22px]" strokeWidth={2.2} />}
          stage="Ingested"
          count={flow?.ingested ?? "—"}
          sub="pipeline jobs"
        />
        <FlowCard
          color="#ffe5d4"
          icon={<BookOpen className="w-[22px] h-[22px]" strokeWidth={2.2} />}
          stage="Briefs Pending"
          count={flow?.briefsPending ?? "—"}
          sub="awaiting review"
          pill={
            (flow?.briefsPending ?? 0) > 0 ? (
              <Pill tone="amber">Needs attention</Pill>
            ) : (
              <Pill tone="green">Clear</Pill>
            )
          }
        />
        <FlowCard
          color="#e8d4ff"
          icon={<Sparkles className="w-[22px] h-[22px]" strokeWidth={2.2} />}
          stage="Generating"
          count={flow?.generating ?? "—"}
          sub="in keyword queue"
          pill={
            j?.isRunning ? (
              <Pill tone="blue">Running now</Pill>
            ) : (
              <Pill tone="green">Idle</Pill>
            )
          }
        />
        <FlowCard
          color="#ffd6e0"
          icon={<FileCheck2 className="w-[22px] h-[22px]" strokeWidth={2.2} />}
          stage="Articles Complete"
          count={flow?.articlesComplete ?? "—"}
          sub={`total · ${throughput?.week ?? 0} this week`}
          pill={<Pill tone="green">{flow?.sentToCms ?? 0} sent to CMS</Pill>}
          connector={false}
        />
      </div>

      {/* TWO COLUMN: ACTIVITY + SCHEDULED JOB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EngineCard>
          <CardHeader title="Recent Activity" />
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {activity.isLoading && (
              <p className="text-[13px] text-[#888] py-4 text-center">Loading activity…</p>
            )}
            {activity.data?.length === 0 && (
              <p className="text-[13px] text-[#888] py-4 text-center">No recent activity.</p>
            )}
            {activity.data?.map((ev) => {
              const meta = activityMeta[ev.type];
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 px-3.5 py-3 border-[1.5px] border-[#e8e8e8] rounded-lg hover:bg-[#f9f9f9] transition-colors"
                >
                  <ListIcon tone={meta.tone}>{meta.icon}</ListIcon>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold truncate">
                      {ev.detail ?? ev.title}
                    </div>
                    <div className="text-[11px] text-[#888]">
                      {ev.title} · {timeAgo(ev.timestamp)}
                    </div>
                  </div>
                  <Pill tone={meta.tone}>{meta.badge}</Pill>
                </div>
              );
            })}
          </div>
        </EngineCard>

        <EngineCard>
          <CardHeader
            title="Scheduled Job"
            right={
              j?.status ? (
                <Pill tone={j.status === "active" ? "green" : "amber"}>
                  {humanize(j.status)}
                </Pill>
              ) : null
            }
          />
          {job.isLoading && (
            <p className="text-[13px] text-[#888] py-4 text-center">Loading…</p>
          )}
          {j && (
            <>
              <div className="flex items-center gap-3 px-3.5 py-3 border-[1.5px] border-[#e8e8e8] rounded-lg mb-4">
                <ListIcon tone={j.isRunning ? "blue" : "green"}>
                  <Calendar className="w-4 h-4" />
                </ListIcon>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate">{j.name}</div>
                  <div className="text-[11px] text-[#888]">
                    {humanize(j.frequency)} · {humanize(j.keywordSource)}
                  </div>
                </div>
                <Pill tone={j.isRunning ? "blue" : "green"}>
                  {j.isRunning ? "running" : "idle"}
                </Pill>
              </div>
              <HealthRow label="Total generated" value={j.totalGenerated} />
              <HealthRow label="Last run" value={timeAgo(j.lastRunAt)} />
              <HealthRow label="Next run" value={formatDateTime(j.nextRunAt)} />
              <HealthRow
                label="Queue pending"
                value={j.queuePending}
                valueClass={j.queuePending > 0 ? "text-engine-amber" : ""}
              />
              <HealthRow label="Queue completed" value={j.queueCompleted} />
              <HealthRow
                label="Avg run duration"
                value={formatDuration(j.avgDurationMs)}
              />
              <HealthRow
                label="Failures (24h)"
                value={`${j.failures24h} ${j.failures24h === 1 ? "failure" : "failures"}`}
                valueClass={j.failures24h > 0 ? "text-engine-red" : "text-engine-green"}
              />
            </>
          )}
        </EngineCard>
      </div>

      {/* THREE COL: HEALTH + THROUGHPUT + CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <EngineCard>
          <CardHeader
            title="Pipeline Health"
            right={
              <Pill tone={(health?.pendingBriefs ?? 0) > 50 ? "amber" : "green"}>
                {(health?.pendingBriefs ?? 0) > 50 ? "Backlog" : "Healthy"}
              </Pill>
            }
          />
          <HealthRow
            label="Scraper enabled"
            value={health?.scraperEnabled ? "ON" : "OFF"}
            valueClass={health?.scraperEnabled ? "text-engine-green" : "text-engine-red"}
          />
          <HealthRow
            label="Auto-generate outline"
            value={health?.autoGenerateOutline ? "ON" : "OFF"}
            valueClass={health?.autoGenerateOutline ? "text-engine-green" : ""}
          />
          <HealthRow
            label="Auto-generate article"
            value={health?.autoGenerateArticle ? "ON" : "OFF"}
            valueClass={health?.autoGenerateArticle ? "text-engine-green" : ""}
          />
          <HealthRow label="Pending briefs" value={health?.pendingBriefs ?? "—"} />
          <HealthRow
            label="Brief approval rate"
            value={`${health?.approvalRate ?? 0}%`}
          />
        </EngineCard>

        <EngineCard>
          <CardHeader title="Throughput" right={<span className="text-[12px] font-semibold text-[#555]">Articles generated</span>} />
          <HealthRow label="Today" value={throughput?.today ?? "—"} big />
          <HealthRow label="This week" value={throughput?.week ?? "—"} big />
          <HealthRow label="This month" value={throughput?.month ?? "—"} big />
          <HealthRow label="Total (all time)" value={throughput?.total ?? "—"} big />
        </EngineCard>

        <EngineCard>
          <CardHeader title="Last 14 Days" right={<span className="text-[12px] font-semibold text-[#555]">per day</span>} />
          <div className="h-[200px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughput?.series ?? []} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "#888" }}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval={2}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    border: "2px solid #1a1a1a",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  labelFormatter={(d) => `Date: ${d}`}
                  formatter={(v) => [`${v} articles`, ""]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(throughput?.series ?? []).map((_, i) => (
                    <Cell key={i} fill="#9b5de5" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EngineCard>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <StatCard num={flow?.articlesComplete ?? "—"} label="Articles Generated" />
        <StatCard num={flow?.sentToCms ?? "—"} label="Sent to CMS" />
        <StatCard num={flow?.briefsPending ?? "—"} label="Briefs Pending Review" />
      </div>
    </div>
  );
}

function StatCard({ num, label }: { num: React.ReactNode; label: string }) {
  return (
    <div className="bg-white border-[2.5px] border-[#1a1a1a] rounded-xl p-5 text-center">
      <div className="text-[36px] font-black leading-none mb-1">{num}</div>
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#555]">
        {label}
      </div>
    </div>
  );
}
