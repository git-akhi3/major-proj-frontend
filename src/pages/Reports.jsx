import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, TrendingDown, Info, Heart } from 'lucide-react';
import Header from '../components/Header';
import RadarHealthChart from '../components/Charts/RadarHealthChart';
import { useData } from '../contexts/DataContext';
import {
  computeHealthScore,
  generateInsights,
  exportCSV,
} from '../utils/metrics';
import { filterByTimeRange } from '../utils/dateUtils';

function Reports() {
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

  const healthScore = useMemo(
    () => computeHealthScore(filteredCommits, filteredPulls, filteredReviews),
    [filteredCommits, filteredPulls, filteredReviews]
  );

  const insights = useMemo(
    () => generateInsights(filteredCommits, filteredPulls, filteredReviews),
    [filteredCommits, filteredPulls, filteredReviews]
  );

  const handleExport = () => {
    exportCSV(filteredCommits, filteredPulls, filteredReviews, repoName);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreRing = (score) => {
    if (score >= 80) return 'ring-emerald-500/30';
    if (score >= 60) return 'ring-blue-500/30';
    if (score >= 40) return 'ring-amber-500/30';
    return 'ring-rose-500/30';
  };

  const insightIcon = (type) => {
    if (type === 'positive') return <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (type === 'warning') return <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />;
    return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const insightBg = (type) => {
    if (type === 'positive') return 'border-emerald-500/20 bg-emerald-500/5';
    if (type === 'warning') return 'border-amber-500/20 bg-amber-500/5';
    return 'border-slate-700/50 bg-slate-800/30';
  };

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
        {/* Health Score + Export */}
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 flex items-center gap-6"
          >
            <div className={`w-24 h-24 rounded-full ring-4 ${getScoreRing(healthScore)} flex items-center justify-center bg-slate-800`}>
              <div className="text-center">
                <p className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>{healthScore}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">/ 100</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${getScoreColor(healthScore)}`} />
                <h3 className="text-sm font-semibold text-white">Repository Health</h3>
              </div>
              <p className={`text-lg font-bold ${getScoreColor(healthScore)}`}>{getScoreLabel(healthScore)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Based on velocity, code quality, collaboration, consistency, and review efficiency
              </p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-colors shadow-lg shadow-blue-500/10"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <RadarHealthChart
            commits={filteredCommits}
            pulls={filteredPulls}
            reviews={filteredReviews}
          />

          {/* Insights Panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${insightBg(insight.type)}`}
                >
                  {insightIcon(insight.type)}
                  <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
