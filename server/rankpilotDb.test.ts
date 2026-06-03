import { describe, expect, it } from "vitest";
import {
  ping,
  getPipelineFlowCounts,
  getThroughputMetrics,
  getScheduledJobSummary,
  getPipelineHealth,
  getRecentActivity,
  getPipelineRunStatus,
} from "./rankpilotDb";

describe("rankpilotDb connectivity", () => {
  it("connects to the RankPilot TiDB and answers a ping", async () => {
    const ok = await ping();
    expect(ok).toBe(true);
  }, 30000);

  it("returns pipeline flow counts as non-negative numbers", async () => {
    const flow = await getPipelineFlowCounts();
    expect(flow.ingested).toBeGreaterThanOrEqual(0);
    expect(flow.briefsPending).toBeGreaterThanOrEqual(0);
    expect(flow.articlesComplete).toBeGreaterThanOrEqual(0);
  }, 30000);

  it("returns a 14-day throughput series", async () => {
    const t = await getThroughputMetrics();
    expect(t.series).toHaveLength(14);
    expect(t.total).toBeGreaterThanOrEqual(0);
  }, 30000);

  it("returns the scheduled job summary (Agentic handler)", async () => {
    const job = await getScheduledJobSummary();
    expect(job).not.toBeNull();
    expect(typeof job?.name).toBe("string");
    // The header "running" pill is driven by this flag — guard its presence/type.
    expect(typeof job?.isRunning).toBe("boolean");
  }, 30000);

  it("returns pipeline health with a valid approval rate", async () => {
    const h = await getPipelineHealth();
    expect(h.approvalRate).toBeGreaterThanOrEqual(0);
    expect(h.approvalRate).toBeLessThanOrEqual(100);
  }, 30000);

  it("returns an activity feed (array, max 20)", async () => {
    const events = await getRecentActivity();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeLessThanOrEqual(20);
  }, 30000);

  it("returns pipeline run status", async () => {
    const status = await getPipelineRunStatus();
    expect(typeof status.jobName).toBe("string");
    expect(typeof status.isRunning).toBe("boolean");
  }, 30000);
});
