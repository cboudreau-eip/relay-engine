import { Link, useLocation } from "wouter";
import { Zap, LayoutDashboard, GitBranch } from "lucide-react";
import FloatingShapes from "./FloatingShapes";
import { trpc } from "@/lib/trpc";

function NavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
        active
          ? "bg-white text-[#1a1a1a] border-2 border-[#1a1a1a]"
          : "text-[#555] hover:bg-black/5 hover:text-[#1a1a1a]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function EngineLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const health = trpc.engine.health.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const connected = health.data?.connected;

  return (
    <div className="relative min-h-screen">
      <FloatingShapes />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center px-8 py-3.5 bg-white border-b-[2.5px] border-[#1a1a1a]">
        <div className="flex items-center gap-2.5 mr-8 text-[15px] font-extrabold uppercase tracking-tight">
          <span className="w-[34px] h-[34px] bg-mint border-2 border-[#1a1a1a] rounded-lg flex items-center justify-center">
            <Zap className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </span>
          Relay Engine
        </div>
        <div className="flex items-center gap-1 flex-1">
          <NavLink
            href="/"
            active={location === "/"}
            icon={<LayoutDashboard className="w-[15px] h-[15px]" />}
            label="Dashboard"
          />
          <NavLink
            href="/pipeline"
            active={location === "/pipeline"}
            icon={<GitBranch className="w-[15px] h-[15px]" />}
            label="Pipeline"
          />
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              connected === undefined
                ? "bg-gray-300"
                : connected
                ? "bg-engine-green"
                : "bg-engine-red"
            }`}
          />
          <span className="text-[#555]">
            {connected === undefined
              ? "Checking…"
              : connected
              ? "RankPilot DB · Live"
              : "DB Disconnected"}
          </span>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-[5] max-w-[1280px] mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}
