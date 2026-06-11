import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getPipelineFlowCounts,
  getThroughputMetrics,
  getScheduledJobSummary,
  getPipelineHealth,
  getRecentActivity,
  getPipelineRunStatus,
  ping,
} from "./rankpilotDb";

/**
 * Wrap a RankPilot data fetch so any failure (external DB down, timeout,
 * malformed response, missing RANKPILOT_DATABASE_URL) surfaces as a clean
 * tRPC error instead of an unhandled throw. The raw cause is logged
 * server-side; the client only sees a generic, safe message.
 */
async function engineQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[engine.${label}] RankPilot query failed:`, err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to load ${label} from the RankPilot database`,
      cause: err,
    });
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // RankPilot content engine monitoring — all public (internal tool, no auth).
  engine: router({
    // Combined dashboard payload: flow counts + throughput + health.
    dashboard: publicProcedure.query(() =>
      engineQuery("dashboard", async () => {
        const [flow, throughput, health] = await Promise.all([
          getPipelineFlowCounts(),
          getThroughputMetrics(),
          getPipelineHealth(),
        ]);
        return { flow, throughput, health };
      })
    ),

    scheduledJob: publicProcedure.query(() =>
      engineQuery("scheduledJob", getScheduledJobSummary)
    ),

    activity: publicProcedure.query(() =>
      engineQuery("activity", getRecentActivity)
    ),

    pipelineRunStatus: publicProcedure.query(() =>
      engineQuery("pipelineRunStatus", getPipelineRunStatus)
    ),

    // Health is intentionally fault-tolerant: a connection failure means
    // "not connected", not a 500 — that's the signal this endpoint exists for.
    health: publicProcedure.query(async () => {
      try {
        const ok = await ping();
        return { connected: ok };
      } catch (err) {
        console.error("[engine.health] ping failed:", err);
        return { connected: false };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
