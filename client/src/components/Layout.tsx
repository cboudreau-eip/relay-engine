import { Outlet, NavLink } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  GitBranch,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';
import FloatingShapes from './FloatingShapes';

export default function Layout() {
  return (
    <div className="min-h-screen relative">
      <FloatingShapes />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center px-8 py-3.5 bg-white border-b-2.5 border-card-border">
        <div className="flex items-center gap-2.5 mr-8">
          <div className="w-8 h-8 bg-mint border-2 border-card-border rounded-lg flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="text-sm font-extrabold uppercase tracking-tight">
            Content Engine
          </span>
        </div>

        <div className="flex items-center gap-1 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={15} /> Dashboard
          </NavLink>
          <NavLink
            to="/pipeline"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <GitBranch size={15} /> Pipeline
          </NavLink>
          <NavLink
            to="/scheduler"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Calendar size={15} /> Scheduler
          </NavLink>
          <NavLink
            to="/articles"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <FileText size={15} /> Articles
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Settings size={15} /> Settings
          </NavLink>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-7 h-7 rounded-full bg-mint border-2 border-card-border flex items-center justify-center text-xs font-bold">
            C
          </div>
          cboudreau
        </div>
      </nav>

      {/* Page Content */}
      <main className="relative z-5">
        <Outlet />
      </main>
    </div>
  );
}
