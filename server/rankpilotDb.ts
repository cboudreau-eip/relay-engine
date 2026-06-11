import mysql from "mysql2/promise";
import { ENV } from "./_core/env";

/**
 * Dedicated read-only connection pool to RankPilot's external TiDB database.
 * This is intentionally kept completely separate from the platform's own
 * DATABASE_URL / drizzle connection. It uses the RANKPILOT_DATABASE_URL secret.
 */
let _pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!_pool) {
    const url = ENV.rankpilotDatabaseUrl;
    if (!url) {
      throw new Error("RANKPILOT_DATABASE_URL is not configured");
    }
    // TiDB Cloud requires TLS. mysql2 accepts ssl options via the URL, but we
    // set a minimal ssl config explicitly to ensure a verified connection.
    _pool = mysql.createPool({
      uri: url,
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      connectionLimit: 5,
      waitForConnections: true,
      enableKeepAlive: true,
    });
  }
  return _pool;
}

/** Run a parameterized query and return typed rows. */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.query(sql, params);
  // SELECT statements resolve to an array of row objects. Anything else — an
  // OK/ResultSetHeader packet from a non-SELECT statement, or a malformed driver
  // response — would silently cast to T[] and corrupt every downstream consumer.
  // Fail loudly instead so the caller (and the tRPC error handler) can react.
  if (!Array.isArray(rows)) {
    throw new Error(
      `RankPilot query did not return rows (got ${typeof rows}): ${sql.trim().slice(0, 120)}`
    );
  }
  return rows as T[];
}

/** Lightweight connectivity check used by tests and health endpoints. */
export async function ping(): Promise<boolean> {
  const rows = await query<{ ok: number }>("SELECT 1 AS ok");
  return rows.length > 0 && Number(rows[0].ok) === 1;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Pipeline flow counts (Scraper → Briefs → Generating → Complete)
 * ────────────────────────────────────────────────────────────────────────── */
export async function getPipelineFlowCounts() {
  const [ingested] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM pipeline_jobs"
  );
  const [briefsPending] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM pipeline_briefs WHERE briefStatus = 'pending_review'"
  );
  const [generating] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM keyword_queue WHERE queueStatus = 'pending'"
  );
  const [articlesComplete] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM articles"
  );
  const [sentToCms] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM articles WHERE articleStatus = 'published'"
  );

  // Articles pushed to the CMS (published) during the CURRENT week, limited to
  // the Monday→Friday (business-week) window. We anchor on `updatedAt`, which
  // for published rows reflects when the article entered the published state.
  //   weekMonday = Monday 00:00:00 of the current ISO week
  //   weekFridayEnd = Friday 23:59:59 of the current ISO week
  const [cmsThisWeek] = await query<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM articles
     WHERE articleStatus = 'published'
       AND updatedAt >= DATE_ADD(CURDATE(), INTERVAL -(WEEKDAY(CURDATE())) DAY)
       AND updatedAt <  DATE_ADD(CURDATE(), INTERVAL (5 - WEEKDAY(CURDATE())) DAY)`
  );

  return {
    ingested: Number(ingested?.cnt ?? 0),
    briefsPending: Number(briefsPending?.cnt ?? 0),
    generating: Number(generating?.cnt ?? 0),
    articlesComplete: Number(articlesComplete?.cnt ?? 0),
    sentToCms: Number(sentToCms?.cnt ?? 0),
    cmsThisWeek: Number(cmsThisWeek?.cnt ?? 0),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Throughput metrics
 * ────────────────────────────────────────────────────────────────────────── */
export async function getThroughputMetrics() {
  const [today] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM articles WHERE DATE(createdAt) = CURDATE()"
  );
  const [week] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM articles WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
  );
  const [month] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM articles WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
  );
  const [total] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM articles"
  );

  // Last 14 days bars
  const daily = await query<{ day: string; cnt: number }>(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS day, COUNT(*) AS cnt
     FROM articles
     WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
     GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')`
  );

  // Build a continuous 14-day series (fill gaps with 0)
  const map = new Map(daily.map((d) => [d.day, Number(d.cnt)]));
  const series: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ day: key, count: map.get(key) ?? 0 });
  }

  return {
    today: Number(today?.cnt ?? 0),
    week: Number(week?.cnt ?? 0),
    month: Number(month?.cnt ?? 0),
    total: Number(total?.cnt ?? 0),
    series,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Scheduled job ("Agentic handler") summary
 * ────────────────────────────────────────────────────────────────────────── */
export async function getScheduledJobSummary() {
  const [job] = await query<any>(
    `SELECT id, name, jobStatus, frequency, keywordSource,
            totalGenerated, lastRunAt, nextRunAt, isRunning
     FROM scheduled_jobs
     ORDER BY id ASC
     LIMIT 1`
  );

  if (!job) {
    return null;
  }

  const [queuePending] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM keyword_queue WHERE queueStatus = 'pending' AND jobId = ?",
    [job.id]
  );
  const [queueCompleted] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM keyword_queue WHERE queueStatus = 'completed' AND jobId = ?",
    [job.id]
  );

  // Average run duration from job_run_history (durationMs)
  const [avg] = await query<{ avgMs: number; runCount: number }>(
    `SELECT AVG(durationMs) AS avgMs, COUNT(*) AS runCount
     FROM job_run_history
     WHERE jobId = ? AND durationMs IS NOT NULL`,
    [job.id]
  );

  const [failures] = await query<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM job_run_history
     WHERE jobId = ? AND runStatus != 'completed'
     AND startedAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
    [job.id]
  );

  return {
    id: job.id,
    name: job.name,
    status: job.jobStatus,
    frequency: job.frequency,
    keywordSource: job.keywordSource,
    totalGenerated: Number(job.totalGenerated ?? 0),
    lastRunAt: job.lastRunAt ? new Date(job.lastRunAt).getTime() : null,
    nextRunAt: job.nextRunAt ? new Date(job.nextRunAt).getTime() : null,
    isRunning: Boolean(job.isRunning),
    queuePending: Number(queuePending?.cnt ?? 0),
    queueCompleted: Number(queueCompleted?.cnt ?? 0),
    avgDurationMs: avg?.avgMs ? Math.round(Number(avg.avgMs)) : null,
    runCount: Number(avg?.runCount ?? 0),
    failures24h: Number(failures?.cnt ?? 0),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Pipeline health card
 * ────────────────────────────────────────────────────────────────────────── */
export async function getPipelineHealth() {
  const [settings] = await query<any>(
    `SELECT bucketUrl, enabled, autoGenerateOutline, autoGenerateArticle, updatedAt
     FROM pipeline_settings
     ORDER BY id ASC
     LIMIT 1`
  );

  const [pending] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM pipeline_briefs WHERE briefStatus = 'pending_review'"
  );
  const [approved] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM pipeline_briefs WHERE briefStatus = 'approved'"
  );
  const [rejected] = await query<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM pipeline_briefs WHERE briefStatus = 'rejected'"
  );

  const approvedN = Number(approved?.cnt ?? 0);
  const rejectedN = Number(rejected?.cnt ?? 0);
  const decided = approvedN + rejectedN;
  const approvalRate = decided > 0 ? Math.round((approvedN / decided) * 100) : 0;

  return {
    scraperEnabled: Boolean(settings?.enabled),
    bucketUrl: settings?.bucketUrl ?? null,
    autoGenerateOutline: Boolean(settings?.autoGenerateOutline),
    autoGenerateArticle: Boolean(settings?.autoGenerateArticle),
    pendingBriefs: Number(pending?.cnt ?? 0),
    approvedBriefs: approvedN,
    rejectedBriefs: rejectedN,
    approvalRate,
    settingsUpdatedAt: settings?.updatedAt ? new Date(settings.updatedAt).getTime() : null,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Recent activity feed (last 20 events)
 * ────────────────────────────────────────────────────────────────────────── */
export type ActivityEvent = {
  id: string;
  type: "article_complete" | "brief_approved" | "brief_rejected" | "scheduler_run" | "scheduler_failed";
  title: string;
  detail: string | null;
  timestamp: number;
};

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  const events: ActivityEvent[] = [];

  // Scheduler runs from job_run_history
  const runs = await query<any>(
    `SELECT id, keyword, runStatus, durationMs, completedAt, startedAt
     FROM job_run_history
     ORDER BY COALESCE(completedAt, startedAt) DESC
     LIMIT 20`
  );
  for (const r of runs) {
    const ts = r.completedAt ?? r.startedAt;
    const ok = r.runStatus === "completed";
    events.push({
      id: `run-${r.id}`,
      type: ok ? "scheduler_run" : "scheduler_failed",
      title: ok ? "Scheduler run completed" : "Scheduler run failed",
      detail: r.keyword
        ? `${r.keyword}${r.durationMs ? ` · ${Math.round(r.durationMs / 1000)}s` : ""}`
        : null,
      timestamp: ts ? new Date(ts).getTime() : Date.now(),
    });
  }

  // Recently completed articles
  const articles = await query<any>(
    `SELECT id, title, articleStatus, createdAt
     FROM articles
     ORDER BY createdAt DESC
     LIMIT 20`
  );
  for (const a of articles) {
    events.push({
      id: `article-${a.id}`,
      type: "article_complete",
      title: "Article generated",
      detail: a.title ?? null,
      timestamp: a.createdAt ? new Date(a.createdAt).getTime() : Date.now(),
    });
  }

  // Recently decided briefs (pipeline_briefs has approvedAt/createdAt, no updatedAt)
  const briefs = await query<any>(
    `SELECT id, briefTitle, briefStatus, approvedAt, createdAt
     FROM pipeline_briefs
     WHERE briefStatus IN ('approved','rejected')
     ORDER BY COALESCE(approvedAt, createdAt) DESC
     LIMIT 20`
  );
  for (const b of briefs) {
    const approved = b.briefStatus === "approved";
    const ts = b.approvedAt ?? b.createdAt;
    events.push({
      id: `brief-${b.id}`,
      type: approved ? "brief_approved" : "brief_rejected",
      title: approved ? "Brief approved" : "Brief rejected",
      detail: b.briefTitle ?? null,
      timestamp: ts ? new Date(ts).getTime() : Date.now(),
    });
  }

  // Merge, sort by timestamp desc, take 20
  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Pipeline editor: current run + node statuses
 * ────────────────────────────────────────────────────────────────────────── */
export async function getPipelineRunStatus() {
  const [job] = await query<any>(
    `SELECT id, name, isRunning FROM scheduled_jobs ORDER BY id ASC LIMIT 1`
  );

  // Most recent run (for "current/last run" display)
  const [lastRun] = await query<any>(
    `SELECT id, keyword, runStatus, startedAt, completedAt, durationMs
     FROM job_run_history
     ORDER BY startedAt DESC
     LIMIT 1`
  );

  const isRunning = Boolean(job?.isRunning);

  return {
    jobName: job?.name ?? "Agentic handler",
    isRunning,
    current: lastRun
      ? {
          keyword: lastRun.keyword ?? null,
          status: lastRun.runStatus ?? null,
          startedAt: lastRun.startedAt ? new Date(lastRun.startedAt).getTime() : null,
          completedAt: lastRun.completedAt ? new Date(lastRun.completedAt).getTime() : null,
          durationMs: lastRun.durationMs ? Number(lastRun.durationMs) : null,
        }
      : null,
  };
}
