import { COOKIE_NAME } from "@shared/const";
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
    dashboard: publicProcedure.query(async () => {
      const [flow, throughput, health] = await Promise.all([
        getPipelineFlowCounts(),
        getThroughputMetrics(),
        getPipelineHealth(),
      ]);
      return { flow, throughput, health };
    }),

    scheduledJob: publicProcedure.query(() => getScheduledJobSummary()),

    activity: publicProcedure.query(() => getRecentActivity()),

    pipelineRunStatus: publicProcedure.query(() => getPipelineRunStatus()),

    health: publicProcedure.query(async () => {
      const ok = await ping();
      return { connected: ok };
    }),
  }),
});

export type AppRouter = typeof appRouter;
