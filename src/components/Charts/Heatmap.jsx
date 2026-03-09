import { useMemo } from 'react';
import { motion } from 'framer-motion';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { computeHeatmapData } from '../../utils/metrics';

function Heatmap({ commits }) {
  const heatmapData = useMemo(() => computeHeatmapData(commits), [commits]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const maxCount = Math.max(1, ...heatmapData.map((d) => d.count));

  const classForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    const ratio = value.count / maxCount;
    if (ratio <= 0.25) return 'color-scale-1';
    if (ratio <= 0.5) return 'color-scale-2';
    if (ratio <= 0.75) return 'color-scale-3';
    return 'color-scale-4';
  };

  const titleForValue = (value) => {
    if (!value || !value.date) return 'No commits';
    return `${value.date}: ${value.count} commit${value.count !== 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Commit Activity</h3>
      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={heatmapData}
          classForValue={classForValue}
          titleForValue={titleForValue}
          showWeekdayLabels
          gutterSize={3}
        />
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-slate-500">Less</span>
        {['color-empty', 'color-scale-1', 'color-scale-2', 'color-scale-3', 'color-scale-4'].map(
          (cls) => (
            <div
              key={cls}
              className={`w-2.5 h-2.5 rounded-sm react-calendar-heatmap`}
            >
              <svg width="10" height="10">
                <rect width="10" height="10" rx="2" className={cls} />
              </svg>
            </div>
          )
        )}
        <span className="text-[10px] text-slate-500">More</span>
      </div>
    </motion.div>
  );
}

export default Heatmap;
