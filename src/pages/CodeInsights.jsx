import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Code2, FileCode, AlertTriangle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import { useData } from '../contexts/DataContext';
import { computeSizeDistribution, computeCommitCategories } from '../utils/metrics';
import { filterByTimeRange } from '../utils/dateUtils';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CodeInsights() {
  const { commits, pulls, repoName, loading, timeRange, setTimeRange } = useData();

  const filteredCommits = useMemo(
    () => filterByTimeRange(commits, 'commit_date', timeRange),
    [commits, timeRange]
  );
  const filteredPulls = useMemo(
    () => filterByTimeRange(pulls, 'created_at', timeRange),
    [pulls, timeRange]
  );

  const commitDistro = useMemo(() => computeSizeDistribution(filteredCommits), [filteredCommits]);
  const prDistro = useMemo(() => computeSizeDistribution(filteredPulls), [filteredPulls]);
  const categories = useMemo(() => computeCommitCategories(filteredCommits), [filteredCommits]);

  const avgCommitSize = useMemo(() => {
    if (!filteredCommits.length) return 0;
    return Math.round(
      filteredCommits.reduce((s, c) => s + (c.additions || 0) + (c.deletions || 0), 0) / filteredCommits.length
    );
  }, [filteredCommits]);

  const avgPRSize = useMemo(() => {
    if (!filteredPulls.length) return 0;
    return Math.round(
      filteredPulls.reduce((s, p) => s + (p.additions || 0) + (p.deletions || 0), 0) / filteredPulls.length
    );
  }, [filteredPulls]);

  const largePRRatio = useMemo(() => {
    if (!filteredPulls.length) return 0;
    const large = filteredPulls.filter((p) => (p.additions || 0) + (p.deletions || 0) > 400).length;
    return Math.round((large / filteredPulls.length) * 100);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Avg Commit Size" value={`${avgCommitSize} LOC`} icon={Code2} color="blue" />
          <MetricCard title="Avg PR Size" value={`${avgPRSize} LOC`} icon={FileCode} color="violet" />
          <MetricCard
            title="Large PR Ratio"
            value={`${largePRRatio}%`}
            icon={AlertTriangle}
            color={largePRRatio > 30 ? 'rose' : 'emerald'}
            description=">400 LOC"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Commit Size Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={commitDistro}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderLabel}
                >
                  {commitDistro.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">PR Size Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={prDistro}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderLabel}
                >
                  {prDistro.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Commit Message Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {categories.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

export default CodeInsights;
