import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function CommitChart({ commits }) {
  const commitsByDev = {};
  commits.forEach((c) => {
    const author = c.author || 'Unknown';
    commitsByDev[author] = (commitsByDev[author] || 0) + 1;
  });

  const data = Object.entries(commitsByDev)
    .map(([name, commits]) => ({ name, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Commits Per Developer</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
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
            cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
          />
          <Bar
            dataKey="commits"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default CommitChart;
