import { useMemo } from 'react';
import Header from '../components/Header';
import CommitChart from '../components/Charts/CommitChart';
import LeaderboardTable from '../components/LeaderboardTable';
import { useData } from '../contexts/DataContext';
import { computeDeveloperStats } from '../utils/developerStats';
import { filterByTimeRange } from '../utils/dateUtils';

function Developers() {
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

  const developerStats = useMemo(
    () => computeDeveloperStats(filteredCommits, filteredPulls, filteredReviews),
    [filteredCommits, filteredPulls, filteredReviews]
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
        <LeaderboardTable developerStats={developerStats} />
        <CommitChart commits={filteredCommits} />
      </div>
    </div>
  );
}

export default Developers;
