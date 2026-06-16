import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { createSessionToken } from "./_core/session";
import { ENV } from "./_core/env";
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
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(({ ctx }) =>
      ctx.authenticated ? { name: "Admin" } : null
    ),

    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ENV.dashboardPassword || input.password !== ENV.dashboardPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
        }
        const token = await createSessionToken();
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  engine: router({
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
