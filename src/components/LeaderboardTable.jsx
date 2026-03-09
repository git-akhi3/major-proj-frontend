import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function getScoreBadge(score) {
  if (score >= 80) return { label: 'Elite', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (score >= 60) return { label: 'Strong', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
  if (score >= 40) return { label: 'Average', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
  return { label: 'Growing', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
}

function getRankIcon(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank;
}

function LeaderboardTable({ developerStats }) {
  if (!developerStats.length) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center text-slate-500">
        No developer data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h2 className="text-base font-semibold text-white">Developer Leaderboard</h2>
        <span className="ml-auto text-xs text-slate-500">{developerStats.length} developers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700/40">
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Developer</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Score</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Commits</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">PRs Created</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">PRs Merged</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Reviews</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Avg PR Size</th>
            </tr>
          </thead>
          <tbody>
            {developerStats.map((dev, index) => {
              const badge = getScoreBadge(dev.performanceScore);
              const rank = index + 1;
              return (
                <tr
                  key={dev.developer}
                  className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-slate-300">
                      {getRankIcon(rank)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://github.com/${dev.developer}.png?size=32`}
                        alt={dev.developer}
                        className="w-7 h-7 rounded-full ring-1 ring-slate-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {dev.developer}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text} border ${badge.border}`}
                    >
                      {dev.performanceScore}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm text-slate-300 tabular-nums">
                    {dev.commits}
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm text-slate-300 tabular-nums">
                    {dev.prsCreated}
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm text-slate-300 tabular-nums">
                    {dev.prsMerged}
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm text-slate-300 tabular-nums">
                    {dev.reviewsGiven}
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm text-slate-400 tabular-nums">
                    {dev.avgPRSize} <span className="text-slate-600">LOC</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default LeaderboardTable;
