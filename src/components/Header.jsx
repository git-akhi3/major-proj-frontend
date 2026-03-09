import { ChevronDown } from 'lucide-react';

const timeRanges = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: 'All time', value: 'all' },
];

function Header({ repoName, timeRange, onTimeRangeChange }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {repoName || 'Dashboard'}
          </h1>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Synced
          </span>
        </div>

        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="appearance-none bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm rounded-lg px-4 py-2 pr-9 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer transition-colors hover:bg-slate-800"
          >
            {timeRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </header>
  );
}

export default Header;
