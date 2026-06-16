import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookies } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { verifySession } from "./session";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  authenticated: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const cookies = parseCookies(opts.req.headers.cookie ?? "");
  const token = cookies[COOKIE_NAME];
  const authenticated = await verifySession(token);
  return { req: opts.req, res: opts.res, authenticated };
}
