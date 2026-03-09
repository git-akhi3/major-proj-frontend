import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitFork,
  Users,
  BarChart3,
  LogOut,
  Activity,
} from 'lucide-react';
import { useSessionParams, clearSession } from '../hooks/useSessionParams';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Repositories', icon: GitFork, path: '/repos' },
  { label: 'Developers', icon: Users, path: '/dashboard', hash: '#developers' },
  { label: 'Analytics', icon: BarChart3, path: '/dashboard', hash: '#analytics' },
];

function Sidebar() {
  const { userId, repoId } = useSessionParams();

  const buildPath = (item) => {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (repoId && item.path === '/dashboard') params.set('repo_id', repoId);
    const base = `${item.path}?${params.toString()}`;
    return item.hash ? `${base}${item.hash}` : base;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-semibold text-white tracking-tight">
          DevMetrics
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={buildPath(item)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive && !item.hash
                    ? 'bg-slate-800/80 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <a
          href="/"
          onClick={clearSession}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all duration-150"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
