import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Clock, Calendar, Moon, Sun } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import Heatmap from '../components/Charts/Heatmap';
import { useData } from '../contexts/DataContext';
import {
  computeCommitsByWeekday,
  computeCommitsByHour,
  computeActivityInsights,
} from '../utils/metrics';
import { filterByTimeRange } from '../utils/dateUtils';

function Activity() {
  const { commits, repoName, loading, timeRange, setTimeRange } = useData();

  const filteredCommits = useMemo(
    () => filterByTimeRange(commits, 'commit_date', timeRange),
    [commits, timeRange]
  );

  const weekdayData = useMemo(() => computeCommitsByWeekday(filteredCommits), [filteredCommits]);
  const hourData = useMemo(() => computeCommitsByHour(filteredCommits), [filteredCommits]);
  const insights = useMemo(() => computeActivityInsights(filteredCommits), [filteredCommits]);

  const commitTimeline = useMemo(() => {
    const byDate = {};
    filteredCommits.forEach((c) => {
      if (!c.commit_date) return;
      const date = c.commit_date.split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate)
      .map(([date, commits]) => ({ date, commits }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredCommits]);

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
          <MetricCard title="Peak Coding Hour" value={insights.peakHour} icon={Clock} color="violet" />
          <MetricCard title="Most Active Day" value={insights.mostActiveDay} icon={Calendar} color="blue" />
          <MetricCard
            title="Weekend Commits"
            value={`${insights.weekendPct}%`}
            icon={Sun}
            color="amber"
            description="of total commits"
          />
          <MetricCard
            title="Late Night Commits"
            value={`${insights.lateNightPct}%`}
            icon={Moon}
            color="cyan"
            description="10 PM - 6 AM"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Commit Activity Timeline</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={commitTimeline} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
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
                dataKey="commits"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <Heatmap commits={filteredCommits} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Commits by Weekday</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekdayData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="commits" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Commits by Hour</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hourData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="commits" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Activity;
