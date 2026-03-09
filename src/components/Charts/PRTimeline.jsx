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

function PRTimeline({ pulls, commits }) {
  // PR merge timeline
  const mergedPRs = pulls.filter((p) => p.merged_at);
  const mergesByDate = {};
  mergedPRs.forEach((pr) => {
    const date = pr.merged_at.split('T')[0];
    mergesByDate[date] = (mergesByDate[date] || 0) + 1;
  });
  const mergeData = Object.entries(mergesByDate)
    .map(([date, merged]) => ({ date, merged }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Commit activity per day
  const commitsByDate = {};
  commits.forEach((c) => {
    if (!c.commit_date) return;
    const date = c.commit_date.split('T')[0];
    commitsByDate[date] = (commitsByDate[date] || 0) + 1;
  });
  const commitData = Object.entries(commitsByDate)
    .map(([date, commits]) => ({ date, commits }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
      >
        <h3 className="text-sm font-semibold text-white mb-4">PR Merge Timeline</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mergeData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Commit Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={commitData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
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
    </div>
  );
}

export default PRTimeline;
