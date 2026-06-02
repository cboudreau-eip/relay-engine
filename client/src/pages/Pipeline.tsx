import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { timeAgo, formatDuration, humanize } from "@/lib/format";
import {
  Play,
  Search,
  FileEdit,
  CheckCircle,
  Sparkles,
  Upload,
  Save,
  Plus,
  Minus,
  Maximize2,
  Lock,
} from "lucide-react";

const REFETCH = 30000;

type NodeColor = "purple" | "blue" | "amber" | "green";

const colorMap: Record<NodeColor, { bg: string; fg: string; border: string }> = {
  purple: { bg: "#e8d4ff", fg: "#7c3aed", border: "#7c3aed" },
  blue: { bg: "#d4e8ff", fg: "#1565c0", border: "#1565c0" },
  amber: { bg: "#fff3cd", fg: "#c07a20", border: "#c07a20" },
  green: { bg: "#d4f5e4", fg: "#2e9e6e", border: "#2e9e6e" },
};

// The required canonical pipeline sequence.
const PIPELINE_NODES = [
  {
    key: "trigger",
    name: "Trigger",
    desc: "Scheduled or manual start",
    tag: "Trigger",
    color: "purple" as NodeColor,
    icon: <Play className="w-4 h-4" />,
  },
  {
    key: "topic",
    name: "Topic Discovery",
    desc: "Fetch next pending topic from queue",
    tag: "AI Step",
    color: "blue" as NodeColor,
    icon: <Search className="w-4 h-4" />,
  },
  {
    key: "draft",
    name: "Generate Draft",
    desc: "LLM generates article content",
    tag: "AI Step",
    color: "blue" as NodeColor,
    icon: <FileEdit className="w-4 h-4" />,
  },
  {
    key: "publish",
    name: "Publish",
    desc: "Submit to CMS as draft",
    tag: "Output",
    color: "green" as NodeColor,
    icon: <Upload className="w-4 h-4" />,
  },
];

const LIBRARY = [
  { section: "Trigger", nodes: [{ name: "Trigger", desc: "Scheduled or manual st...", color: "purple" as NodeColor, icon: <Play className="w-3.5 h-3.5" /> }] },
  {
    section: "AI Steps",
    nodes: [
      { name: "Topic Discovery", desc: "Fetch next pending topic...", color: "blue" as NodeColor, icon: <Search className="w-3.5 h-3.5" /> },
      { name: "Generate Draft", desc: "LLM generates article...", color: "blue" as NodeColor, icon: <FileEdit className="w-3.5 h-3.5" /> },
      { name: "Review", desc: "AI proofreads for grammar...", color: "amber" as NodeColor, icon: <CheckCircle className="w-3.5 h-3.5" /> },
      { name: "Revise Draft", desc: "Send feedback to LLM...", color: "blue" as NodeColor, icon: <Sparkles className="w-3.5 h-3.5" /> },
    ],
  },
  { section: "Output", nodes: [{ name: "Publish", desc: "Submit to CMS as draft", color: "green" as NodeColor, icon: <Upload className="w-3.5 h-3.5" /> }] },
];

type NodeState = "completed" | "running" | "waiting";

/**
 * Map the live run into a per-node state.
 * - If a run is actively running: trigger+topic completed, draft running, publish waiting.
 * - If last run completed: all completed.
 * - If failed: trigger+topic completed, draft failed (shown as waiting/red), publish waiting.
 */
function deriveNodeStates(isRunning: boolean, status: string | null): {
  states: Record<string, NodeState>;
  activeKey: string | null;
} {
  if (isRunning) {
    return {
      states: { trigger: "completed", topic: "completed", draft: "running", publish: "waiting" },
      activeKey: "draft",
    };
  }
  if (status === "completed") {
    return {
      states: { trigger: "completed", topic: "completed", draft: "completed", publish: "completed" },
      activeKey: null,
    };
  }
  // idle / no run / failed
  return {
    states: { trigger: "waiting", topic: "waiting", draft: "waiting", publish: "waiting" },
    activeKey: null,
  };
}

export default function Pipeline() {
  const run = trpc.engine.pipelineRunStatus.useQuery(undefined, {
    refetchInterval: REFETCH,
  });

  const isRunning = run.data?.isRunning ?? false;
  const status = run.data?.current?.status ?? null;
  const { states, activeKey } = deriveNodeStates(isRunning, status);

  // Live elapsed timer for the current run
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const startedAt = run.data?.current?.startedAt ?? null;
  const elapsed =
    isRunning && startedAt
      ? formatDuration(now - startedAt)
      : run.data?.current?.durationMs
      ? formatDuration(run.data.current.durationMs)
      : "—";

  return (
    <div className="-mt-8 -mx-8">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[calc(100vh-57px)]">
        {/* SIDEBAR — Node Library */}
        <aside className="bg-white border-r-[2.5px] border-[#1a1a1a] px-5 py-6 overflow-y-auto">
          <div className="text-[15px] font-extrabold">Node Library</div>
          <div className="text-[12px] text-[#888] mb-6">Pipeline building blocks</div>

          {LIBRARY.map((group) => (
            <div key={group.section}>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#888] mb-2.5 mt-5 first:mt-0">
                {group.section}
              </div>
              {group.nodes.map((n) => {
                const c = colorMap[n.color];
                return (
                  <div
                    key={n.name}
                    className="flex items-center gap-2.5 px-3 py-2.5 border-[1.5px] border-[#e8e8e8] rounded-lg mb-2 hover:border-[#1a1a1a] hover:bg-[#f9f9f9] transition-colors cursor-grab"
                    onClick={() => toast("Drag-and-drop editing coming soon")}
                  >
                    <span
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: c.bg, color: c.fg }}
                    >
                      {n.icon}
                    </span>
                    <div>
                      <div className="text-[12.5px] font-bold">{n.name}</div>
                      <div className="text-[10.5px] text-[#888]">{n.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        {/* CANVAS */}
        <section className="relative overflow-hidden">
          {/* Canvas header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[18px] font-extrabold">Article Pipeline</span>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-md border-[1.5px]"
                style={{ background: "#fff9c4", borderColor: "#c07a20", color: "#c07a20" }}
              >
                {isRunning ? "Running" : status === "completed" ? "Idle" : "Standby"}
              </span>
            </div>
            <div className="flex gap-2.5">
              <button
                className="flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-bold border-[2.5px] border-[#1a1a1a] bg-white hover:bg-[#f5f5f5] transition-colors active:scale-[0.97]"
                onClick={() => toast("Pipeline definitions are read-only in this monitor")}
              >
                <Save className="w-[15px] h-[15px]" /> Save
              </button>
              <button
                className="flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-bold border-[2.5px] transition-colors active:scale-[0.97]"
                style={{ background: "#d4f5e4", color: "#2e9e6e", borderColor: "#2e9e6e" }}
                onClick={() =>
                  toast("Runs are triggered by the scheduler (Agentic handler)")
                }
              >
                <Play className="w-[15px] h-[15px]" /> Run Now
              </button>
            </div>
          </div>

          {/* Nodes */}
          <div className="absolute inset-0 flex items-center justify-center px-4 overflow-x-auto">
            <div className="flex items-center gap-0 justify-center min-w-max">
              {PIPELINE_NODES.map((node, i) => {
                const c = colorMap[node.color];
                const nodeState = states[node.key];
                const isActive = activeKey === node.key;
                return (
                  <div key={node.key} className="flex items-center">
                    <div
                      className="w-[200px] bg-white rounded-xl p-5 relative transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                      style={{
                        border: `2.5px solid ${isActive ? "#2e9e6e" : c.border}`,
                        boxShadow: isActive ? "0 0 0 3px rgba(46,158,110,0.15)" : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: c.bg, color: c.fg }}
                        >
                          {node.icon}
                        </span>
                        <span className="text-[14px] font-extrabold">{node.name}</span>
                      </div>
                      <div className="text-[11.5px] text-[#888] mb-2">{node.desc}</div>
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-[0.05em]"
                        style={{ background: c.bg, color: c.fg }}
                      >
                        {node.tag}
                      </span>
                      <div className="flex items-center gap-1.5 mt-2 text-[10.5px] font-bold">
                        {nodeState === "running" && (
                          <span className="w-[7px] h-[7px] rounded-full bg-engine-green animate-pulse" />
                        )}
                        <span
                          style={{
                            color:
                              nodeState === "running" || nodeState === "completed"
                                ? "#2e9e6e"
                                : "#888",
                          }}
                        >
                          {nodeState === "running"
                            ? "Running…"
                            : nodeState === "completed"
                            ? "Completed"
                            : "Waiting"}
                        </span>
                      </div>
                    </div>

                    {/* Connector */}
                    {i < PIPELINE_NODES.length - 1 && (
                      <div className="w-[60px] flex items-center justify-center relative">
                        <div className="w-full border-t-2 border-dashed border-[#ccc]" />
                        <span className="absolute left-0 w-2 h-2 bg-[#1a1a1a] rounded-full" />
                        <span className="absolute right-0 w-2 h-2 bg-[#1a1a1a] rounded-full" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Run Panel */}
          <div className="absolute top-[70px] right-6 w-[240px] bg-white border-[2.5px] border-[#1a1a1a] rounded-xl p-4 z-10">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
              <span
                className={`w-[7px] h-[7px] rounded-full ${
                  isRunning ? "bg-engine-green animate-pulse" : "bg-gray-300"
                }`}
              />
              {isRunning ? "Current Run" : "Last Run"}
            </div>
            <RunRow label="Job" value={run.data?.jobName ?? "Agentic handler"} />
            <RunRow
              label="Step"
              value={
                isRunning
                  ? "Generate Draft"
                  : status === "completed"
                  ? "Complete"
                  : "—"
              }
            />
            <RunRow label="Keyword" value={run.data?.current?.keyword ?? "—"} />
            <RunRow
              label="Status"
              value={humanize(run.data?.current?.status) ?? "—"}
            />
            <RunRow label={isRunning ? "Elapsed" : "Duration"} value={elapsed} />
            {!isRunning && run.data?.current?.completedAt && (
              <RunRow label="Finished" value={timeAgo(run.data.current.completedAt)} />
            )}
          </div>

          {/* Canvas controls (decorative) */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-1 z-10">
            {[<Plus key="p" />, <Minus key="m" />, <Maximize2 key="x" />, <Lock key="l" />].map(
              (icon, idx) => (
                <button
                  key={idx}
                  className="w-9 h-9 bg-white border-2 border-[#1a1a1a] rounded-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors [&_svg]:w-4 [&_svg]:h-4"
                  onClick={() => toast("Canvas controls are display-only in this monitor")}
                >
                  {icon}
                </button>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function RunRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#eee] last:border-b-0 gap-2">
      <span className="text-[11.5px] text-[#888] flex-shrink-0">{label}</span>
      <span className="text-[11.5px] font-bold truncate text-right">{value}</span>
    </div>
  );
}
