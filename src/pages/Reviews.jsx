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
import { ShieldCheck, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import { useData } from '../contexts/DataContext';
import {
  computeKPIs,
  computeReviewMetrics,
  computeReviewActivityOverTime,
  computeReviewParticipation,
} from '../utils/metrics';
import { filterByTimeRange } from '../utils/dateUtils';

function Reviews() {
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
  const reviewMetrics = useMemo(
    () => computeReviewMetrics(filteredPulls, filteredReviews),
    [filteredPulls, filteredReviews]
  );
  const reviewTimeline = useMemo(
    () => computeReviewActivityOverTime(filteredReviews),
    [filteredReviews]
  );
  const reviewParticipation = useMemo(
    () => computeReviewParticipation(filteredReviews),
    [filteredReviews]
  );

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
          <MetricCard title="Review Coverage" value={`${kpis.reviewCoverage}%`} icon={ShieldCheck} color="emerald" />
          <MetricCard
            title="Avg Review Time"
            value={`${reviewMetrics.avgResponseTime}h`}
            icon={Clock}
            color="blue"
            description="Time to first review"
          />
          <MetricCard title="Reviews Per PR" value={reviewMetrics.reviewsPerPR} icon={MessageSquare} color="violet" />
          <MetricCard
            title="Unreviewed PRs"
            value={reviewMetrics.unreviewedPRs}
            icon={AlertCircle}
            color="rose"
            description="PRs without reviews"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Review Activity Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={reviewTimeline} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
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
                  dataKey="reviews"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Review Participation</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reviewParticipation} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
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
                <Bar dataKey="reviews" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;
