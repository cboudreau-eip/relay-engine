import { UNAUTHED_ERR_MSG } from '../../shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireAuth = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.authenticated) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(requireAuth);
export const adminProcedure = t.procedure.use(requireAuth);
