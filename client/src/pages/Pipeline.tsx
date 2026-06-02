import {
  Play,
  Search,
  FileEdit,
  CheckCircle,
  Sparkles,
  Upload,
  Plus,
  Minus,
  Maximize2,
  Lock,
  Save,
} from 'lucide-react';

export default function Pipeline() {
  return (
    <div className="relative z-5 grid grid-cols-[260px_1fr] h-[calc(100vh-57px)]">
      {/* ── SIDEBAR (Node Library) ──────────────────────────── */}
      <div className="bg-white border-r-2.5 border-card-border p-6 overflow-y-auto">
        <h2 className="text-base font-extrabold mb-1">Node Library</h2>
        <p className="text-xs text-gray-400 mb-6">
          Drag nodes onto the canvas
        </p>

        <SidebarSection title="Trigger">
          <SidebarNode
            icon={<Play size={14} />}
            iconColor="purple"
            name="Trigger"
            desc="Scheduled or manual st..."
          />
        </SidebarSection>

        <SidebarSection title="AI Steps">
          <SidebarNode
            icon={<Search size={14} />}
            iconColor="blue"
            name="Topic Discovery"
            desc="Fetch next pending topic..."
          />
          <SidebarNode
            icon={<FileEdit size={14} />}
            iconColor="blue"
            name="Generate Draft"
            desc="LLM generates article..."
          />
          <SidebarNode
            icon={<CheckCircle size={14} />}
            iconColor="amber"
            name="Review"
            desc="AI proofreads for grammar..."
          />
          <SidebarNode
            icon={<Sparkles size={14} />}
            iconColor="blue"
            name="Revise Draft"
            desc="Send feedback to LLM..."
          />
        </SidebarSection>

        <SidebarSection title="Output">
          <SidebarNode
            icon={<Upload size={14} />}
            iconColor="green"
            name="Publish"
            desc="Submit to CMS as draft"
          />
        </SidebarSection>
      </div>

      {/* ── CANVAS ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Canvas Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold">Article Pipeline</h1>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-yellow border-2 border-status-amber text-status-amber">
              Unsaved changes
            </span>
          </div>
          <div className="flex gap-2.5">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border-2.5 border-card-border bg-white hover:bg-gray-50 transition-colors">
              <Save size={15} /> Save
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border-2.5 border-status-green bg-status-green-bg text-status-green hover:bg-green-100 transition-colors">
              <Play size={15} /> Run Now
            </button>
          </div>
        </div>

        {/* Pipeline Nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-0">
            <CanvasNode
              icon={<Play size={16} />}
              iconColor="purple"
              name="Trigger"
              desc="Manual trigger"
              tag="Trigger"
              tagColor="purple"
              status="Completed"
              statusColor="text-status-green"
              borderColor="border-status-purple"
            />
            <Connector />
            <CanvasNode
              icon={<Search size={16} />}
              iconColor="blue"
              name="Topic Discovery"
              desc="Fetch next pending topic from queue"
              tag="AI Step"
              tagColor="blue"
              status="Completed"
              statusColor="text-status-green"
              borderColor="border-status-blue"
            />
            <Connector />
            <CanvasNode
              icon={<FileEdit size={16} />}
              iconColor="blue"
              name="Generate Draft"
              desc="LLM generates article content"
              tag="AI Step"
              tagColor="blue"
              status="Running..."
              statusColor="text-status-green"
              active
              borderColor="border-status-green"
            />
            <Connector />
            <CanvasNode
              icon={<Upload size={16} />}
              iconColor="green"
              name="Publish"
              desc="Submit as draft"
              tag="Output"
              tagColor="green"
              status="Waiting"
              statusColor="text-gray-400"
              borderColor="border-status-green"
            />
          </div>
        </div>

        {/* Current Run Panel */}
        <div className="absolute top-16 right-5 w-60 card p-4 z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-status-green pulse-dot" />
            Current Run
          </div>
          <div className="space-y-2">
            <RunRow label="Step" value="Generate Draft" />
            <RunRow label="Keyword" value="medicare advantage 2025" />
            <RunRow label="Elapsed" value="2m 34s" />
            <RunRow label="Job" value="Weekly Medicare Posts" />
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-1 z-10">
          <ControlBtn icon={<Plus size={16} />} />
          <ControlBtn icon={<Minus size={16} />} />
          <ControlBtn icon={<Maximize2 size={16} />} />
          <ControlBtn icon={<Lock size={16} />} />
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SidebarNode({
  icon,
  iconColor,
  name,
  desc,
}: {
  icon: React.ReactNode;
  iconColor: string;
  name: string;
  desc: string;
}) {
  const colorMap: Record<string, string> = {
    purple: 'bg-status-purple-bg text-status-purple',
    blue: 'bg-status-blue-bg text-status-blue',
    amber: 'bg-status-amber-bg text-status-amber',
    green: 'bg-status-green-bg text-status-green',
  };

  return (
    <div className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg cursor-grab hover:border-card-border hover:bg-gray-50 transition-all">
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center ${colorMap[iconColor]}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold">{name}</div>
        <div className="text-[10px] text-gray-400">{desc}</div>
      </div>
    </div>
  );
}

function CanvasNode({
  icon,
  iconColor,
  name,
  desc,
  tag,
  tagColor,
  status,
  statusColor,
  active,
  borderColor,
}: {
  icon: React.ReactNode;
  iconColor: string;
  name: string;
  desc: string;
  tag: string;
  tagColor: string;
  status: string;
  statusColor: string;
  active?: boolean;
  borderColor: string;
}) {
  const iconColorMap: Record<string, string> = {
    purple: 'bg-status-purple-bg text-status-purple',
    blue: 'bg-status-blue-bg text-status-blue',
    amber: 'bg-status-amber-bg text-status-amber',
    green: 'bg-status-green-bg text-status-green',
  };

  const tagColorMap: Record<string, string> = {
    purple: 'bg-status-purple-bg text-status-purple',
    blue: 'bg-status-blue-bg text-status-blue',
    amber: 'bg-status-amber-bg text-status-amber',
    green: 'bg-status-green-bg text-status-green',
  };

  return (
    <div
      className={`w-[200px] card p-5 ${borderColor} ${
        active ? 'shadow-[0_0_0_3px_rgba(46,158,110,0.15)]' : ''
      } hover:-translate-y-1 hover:shadow-lg transition-all`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorMap[iconColor]}`}
        >
          {icon}
        </div>
        <span className="text-sm font-extrabold">{name}</span>
      </div>
      <div className="text-[11px] text-gray-400 mb-2">{desc}</div>
      <span
        className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${tagColorMap[tagColor]}`}
      >
        {tag}
      </span>
      <div className="flex items-center gap-1.5 mt-2">
        {active && (
          <span className="w-1.5 h-1.5 rounded-full bg-status-green pulse-dot" />
        )}
        <span className={`text-[11px] font-bold ${statusColor}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="w-14 flex items-center justify-center relative">
      <div className="w-full border-t-2 border-dashed border-gray-300" />
      <div className="absolute left-0 w-2 h-2 rounded-full bg-card-border" />
      <div className="absolute right-0 w-2 h-2 rounded-full bg-card-border" />
    </div>
  );
}

function RunRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-[11px] font-bold">{value}</span>
    </div>
  );
}

function ControlBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-9 h-9 bg-white border-2 border-card-border rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
      {icon}
    </button>
  );
}
