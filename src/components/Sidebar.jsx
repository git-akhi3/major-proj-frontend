import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GitFork,
  Users,
  BarChart3,
  LogOut,
  Activity,
  ChevronDown,
  ChevronRight,
  Lock,
  Check,
  Code2,
  MessageSquare,
  Clock,
  FileText,
} from 'lucide-react';
import { useSessionParams, clearSession, setRepoId } from '../hooks/useSessionParams';
import api from '../services/api';

const analyticsNav = [
  { label: 'Overview', path: '/overview', Icon: LayoutDashboard },
  { label: 'Developers', path: '/developers', Icon: Users },
  { label: 'Code Insights', path: '/code-insights', Icon: Code2 },
  { label: 'Reviews', path: '/reviews', Icon: MessageSquare },
  { label: 'Activity', path: '/activity', Icon: Clock },
  { label: 'Reports', path: '/reports', Icon: FileText },
];

function Sidebar() {
  const { userId, repoId } = useSessionParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.get(`/auth/users/${userId}`).then((r) => setUsername(r.data.username)).catch(() => {});
    api.get(`/repos/?user_id=${userId}`).then((r) => setRepos(r.data)).catch(() => {});
  }, [userId]);

  const buildPath = (path) => {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (repoId) params.set('repo_id', repoId);
    return `${path}?${params.toString()}`;
  };

  const handleSwitchRepo = (repo) => {
    setRepoId(repo.repo_id);
    setSwitcherOpen(false);
    navigate(`/overview?user_id=${userId}&repo_id=${repo.repo_id}`);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-semibold text-white tracking-tight">DevMetrics</span>
      </div>

      {/* User Profile */}
      {username && (
        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
              >
                github.com/{username}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink to={`/repos?user_id=${userId}`} className={navLinkClass}>
          <GitFork className="w-[18px] h-[18px] shrink-0" />
          <span>Repositories</span>
        </NavLink>

        {/* Analytics section */}
        <div className="pt-3">
          <p className="px-3 pb-1 text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
            Analytics
          </p>

          {repoId ? (
            analyticsNav.map(({ label, path, Icon }) => (
              <NavLink key={path} to={buildPath(path)} className={navLinkClass}>
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))
          ) : (
            analyticsNav.map(({ label, Icon }) => (
              <div
                key={label}
                title="Select a repository first"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 cursor-not-allowed select-none"
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{label}</span>
                <Lock className="w-3 h-3 ml-auto shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Quick Repo Switcher */}
        {repos.length > 0 && (
          <div className="pt-3">
            <button
              onClick={() => setSwitcherOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest text-slate-600 font-semibold hover:text-slate-400 transition-colors"
            >
              <span className="flex-1 text-left">Switch Repo</span>
              {switcherOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {switcherOpen && (
              <div className="mt-1 space-y-0.5">
                {repos.map((repo) => {
                  const isActive = String(repo.repo_id) === String(repoId);
                  return (
                    <button
                      key={repo.repo_id}
                      onClick={() => handleSwitchRepo(repo)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 text-left ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-slate-500 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <GitFork className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{repo.name}</span>
                      {isActive && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-slate-800/60 pt-2">
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
