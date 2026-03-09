import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { GitCommit, GitPullRequest, Users, Rocket } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import CommitChart from '../components/Charts/CommitChart';
import Heatmap from '../components/Charts/Heatmap';
import { useData } from '../contexts/DataContext';
import { computeKPIs } from '../utils/metrics';
import { filterByTimeRange } from '../utils/dateUtils';

function Overview() {
  const { commits, pulls, reviews, repoName, loading, timeRange, setTimeRange } = useData();

  const filteredCommits = useMemo(
    () => filterByTimeRange(commits, 'commit_date', timeRange),
    [commits, timeRange]
  );
  const filteredPulls = useMemo(
    () => filterByTimeRange(pulls, 'created_at', timeRange),
    [pulls, timeRange]
  );
  const filteredReviews = useMemo(
    () => filterByTimeRange(reviews, 'submitted_at', timeRange),
    [reviews, timeRange]
  );

  const kpis = useMemo(
    () => computeKPIs(filteredCommits, filteredPulls, filteredReviews),
    [filteredCommits, filteredPulls, filteredReviews]
  );

  const mergeTimelineData = useMemo(() => {
    const merged = filteredPulls.filter((p) => p.merged_at);
    const byDate = {};
    merged.forEach((pr) => {
      const date = pr.merged_at.split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate)
      .map(([date, merged]) => ({ date, merged }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPulls]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header repoName={repoName} timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Total Commits" value={kpis.totalCommits} icon={GitCommit} color="violet" />
          <MetricCard title="Pull Requests" value={kpis.totalPRs} icon={GitPullRequest} color="blue" />
          <MetricCard title="Active Developers" value={kpis.activeDevelopers} icon={Users} color="emerald" />
          <MetricCard
            title="Deploy Frequency"
            value={`${kpis.deploymentFrequency}/wk`}
            icon={Rocket}
            color="cyan"
            description="Merges per week"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <CommitChart commits={filteredCommits} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">PR Merge Timeline</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mergeTimelineData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="merged"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <Heatmap commits={filteredCommits} />
      </div>
    </div>
  );
}

export default Overview;
