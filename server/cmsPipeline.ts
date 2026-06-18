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
 * Fetch live pipeline stage counts from the medicarefaq-next CMS.
 * The CMS exposes a public, aggregate-only endpoint at
 * /api/cms/pipeline/counts backed by the shared Neon Postgres database.
 * Returns zeros + connected:false if the CMS is unreachable.
 */
export async function getCmsPipelineCounts(): Promise<CmsPipelineCounts> {
  const base = ENV.cmsBaseUrl.replace(/\/+$/, "");
  if (!base) return EMPTY;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(`${base}/api/cms/pipeline/counts/`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!resp.ok) return { ...EMPTY, debug: `GET ${base} -> HTTP ${resp.status}` };
    const data = (await resp.json()) as Partial<CmsPipelineCounts>;
    return {
      intake: Number(data.intake ?? 0),
      review: Number(data.review ?? 0),
      queue: Number(data.queue ?? 0),
      output: Number(data.output ?? 0),
      connected: true,
      debug: `ok via ${base}`,
    };
  } catch (err: any) {
    return { ...EMPTY, debug: `fetch ${base} threw: ${err?.name || ""} ${err?.message || String(err)}` };
  }
}
