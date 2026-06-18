import { neon } from "@neondatabase/serverless";
import { ENV } from "./_core/env";

export type CmsPipelineCounts = {
  intake: number;
  review: number;
  queue: number;
  output: number;
  connected: boolean;
  debug?: string;
};

const EMPTY: CmsPipelineCounts = {
  intake: 0,
  review: 0,
  queue: 0,
  output: 0,
  connected: false,
};

/**
 * Read live pipeline stage counts straight from the CMS's Neon Postgres
 * database (the same DB the medicarefaq-next CMS writes to). We read the DB
 * directly rather than calling the CMS HTTP API because the CMS web layer is
 * IP-firewalled and returns 403 to outside servers like this one.
 *
 * Read-only: a single GROUP BY count query against pipeline_items.
 * Returns zeros + connected:false if CMS_DATABASE_URL is unset or unreachable.
 */
export async function getCmsPipelineCounts(): Promise<CmsPipelineCounts> {
  const url = ENV.cmsDatabaseUrl;
  if (!url) return { ...EMPTY, debug: "CMS_DATABASE_URL not set" };

  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT status, COUNT(*)::int AS cnt
      FROM pipeline_items
      GROUP BY status
    `) as Array<{ status: string; cnt: number }>;

    const c: Record<string, number> = {
      ingested: 0,
      briefed: 0,
      approved: 0,
      rejected: 0,
      producing: 0,
      done: 0,
      failed: 0,
    };
    for (const r of rows) {
      if (r.status in c) c[r.status] = Number(r.cnt);
    }

    return {
      intake: c.ingested,
      review: c.briefed,
      queue: c.approved + c.producing,
      output: c.done,
      connected: true,
    };
  } catch (err: any) {
    return { ...EMPTY, debug: `db error: ${err?.message || String(err)}` };
  }
}
