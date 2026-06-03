import { cn } from "@/lib/utils";

export type Tone = "green" | "amber" | "red" | "blue";

const pillTones: Record<Tone, string> = {
  green: "bg-engine-green-bg text-engine-green border-engine-green",
  amber: "bg-engine-amber-bg text-engine-amber border-engine-amber",
  red: "bg-engine-red-bg text-engine-red border-engine-red",
  blue: "bg-engine-blue-bg text-engine-blue border-engine-blue",
};

export function Pill({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-[3px] rounded-md border-[1.5px]",
        pillTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function RunningPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "running-pill inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-[3px] rounded-md border-[1.5px] bg-engine-blue-bg text-engine-blue border-engine-blue",
        className
      )}
    >
      <span className="running-dot inline-block w-[7px] h-[7px] rounded-full bg-engine-blue" />
      running
    </span>
  );
}

export function EngineCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border-[2.5px] border-[#1a1a1a] rounded-xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-[18px]">
      <span className="text-[14px] font-extrabold uppercase tracking-[0.02em]">
        {title}
      </span>
      {right}
    </div>
  );
}

const iconTones: Record<Tone, string> = {
  green: "bg-engine-green-bg",
  amber: "bg-engine-amber-bg",
  red: "bg-engine-red-bg",
  blue: "bg-engine-blue-bg",
};

export function ListIcon({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "w-9 h-9 rounded-lg border-[1.5px] border-[#1a1a1a] flex items-center justify-center flex-shrink-0",
        iconTones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function HealthRow({
  label,
  value,
  valueClass,
  big,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  big?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#eee] last:border-b-0">
      <span className="text-[13px] text-[#555]">{label}</span>
      <span
        className={cn(
          "font-bold",
          big ? "text-[20px]" : "text-[13px]",
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );
}
