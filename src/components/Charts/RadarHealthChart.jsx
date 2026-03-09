import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { computeEngineeringHealth } from '../../utils/metrics';

function RadarHealthChart({ commits, pulls, reviews }) {
  const data = computeEngineeringHealth(commits, pulls, reviews);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Engineering Health Radar</h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Health"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default RadarHealthChart;
