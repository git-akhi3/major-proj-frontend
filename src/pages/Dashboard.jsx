import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSessionParams } from '../hooks/useSessionParams';
import {
  GitCommit,
  GitPullRequest,
  Users,
  Code2,
  Rocket,
  ShieldCheck,
  Clock,
  MessageSquare,
  AlertCircle,
  Heart,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import LeaderboardTable from '../components/LeaderboardTable';
import CommitChart from '../components/Charts/CommitChart';
import PRTimeline from '../components/Charts/PRTimeline';
import CommitSizeChart from '../components/Charts/CommitSizeChart';
import RadarHealthChart from '../components/Charts/RadarHealthChart';
import Heatmap from '../components/Charts/Heatmap';
import { computeKPIs, computeReviewMetrics, computeWorkLifeBalance } from '../utils/metrics';
import { computeDeveloperStats } from '../utils/developerStats';
import { filterByTimeRange } from '../utils/dateUtils';

function Dashboard() {
  const [commits, setCommits] = useState([]);
  const [pulls, setPulls] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const navigate = useNavigate();
  const { userId, repoId } = useSessionParams();

  useEffect(() => {
    if (!userId || !repoId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [commitRes, pullRes, reviewRes, repoRes] = await Promise.all([
          api.get(`/repos/${repoId}/commits`),
          api.get(`/repos/${repoId}/pulls`),
          api.get(`/repos/${repoId}/reviews`),
          api.get(`/repos/?user_id=${userId}`),
        ]);
        setCommits(commitRes.data);
        setPulls(pullRes.data);
        setReviews(reviewRes.data);
        const repo = repoRes.data.find((r) => String(r.repo_id) === String(repoId));
        if (repo) setRepoName(`${repo.owner}/${repo.name}`);
      } catch {
        alert('Failed to load metrics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, repoId, navigate]);

  const handleTimeRangeChange = useCallback((val) => setTimeRange(val), []);

  // Filter data by time range
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

  // Compute all metrics
  const kpis = useMemo(
    () => computeKPIs(filteredCommits, filteredPulls, filteredReviews),
    [filteredCommits, filteredPulls, filteredReviews]
  );
  const reviewMetrics = useMemo(
    () => computeReviewMetrics(filteredPulls, filteredReviews),
    [filteredPulls, filteredReviews]
  );
  const workLifeBalance = useMemo(
    () => computeWorkLifeBalance(filteredCommits),
    [filteredCommits]
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
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        repoName={repoName}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      <div className="px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Commits"
            value={kpis.totalCommits}
            icon={GitCommit}
            color="violet"
            description="All time commits"
          />
          <MetricCard
            title="Pull Requests"
            value={kpis.totalPRs}
            icon={GitPullRequest}
            color="blue"
            description="Total PRs"
          />
          <MetricCard
            title="Active Developers"
            value={kpis.activeDevelopers}
            icon={Users}
            color="emerald"
            description="Contributors"
          />
          <MetricCard
            title="Avg PR Size"
            value={`${kpis.avgPRSize}`}
            icon={Code2}
            color="amber"
            description="Lines changed"
          />
          <MetricCard
            title="Deploy Frequency"
            value={`${kpis.deploymentFrequency}/wk`}
            icon={Rocket}
            color="cyan"
            description="Merges per week"
          />
          <MetricCard
            title="Review Coverage"
            value={`${kpis.reviewCoverage}%`}
            icon={ShieldCheck}
            color="emerald"
            description="PRs with reviews"
          />
        </div>

        {/* Review Efficiency + Work-Life Balance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Avg Review Time"
            value={`${reviewMetrics.avgResponseTime}h`}
            icon={Clock}
            color="blue"
            description="Time to first review"
          />
          <MetricCard
            title="Reviews Per PR"
            value={reviewMetrics.reviewsPerPR}
            icon={MessageSquare}
            color="violet"
            description="Avg review count"
          />
          <MetricCard
            title="Unreviewed PRs"
            value={reviewMetrics.unreviewedPRs}
            icon={AlertCircle}
            color="rose"
            description="PRs without reviews"
          />
          <MetricCard
            title="Work-Life Balance"
            value={`${workLifeBalance.score}/100`}
            icon={Heart}
            color={workLifeBalance.score >= 70 ? 'emerald' : workLifeBalance.score >= 40 ? 'amber' : 'rose'}
            description={`${workLifeBalance.weekendPct}% weekend · ${workLifeBalance.lateNightPct}% late night`}
          />
        </div>

        {/* Activity Heatmap */}
        <Heatmap commits={filteredCommits} />

        {/* Developer Leaderboard */}
        <div id="developers">
          <LeaderboardTable developerStats={developerStats} />
        </div>

        {/* Charts Section */}
        <div id="analytics" className="space-y-5">
          {/* Commits Per Developer */}
          <CommitChart commits={filteredCommits} />

          {/* PR Merge Timeline + Commit Activity */}
          <PRTimeline pulls={filteredPulls} commits={filteredCommits} />

          {/* Size Distributions */}
          <CommitSizeChart commits={filteredCommits} pulls={filteredPulls} />

          {/* Radar Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <RadarHealthChart
              commits={filteredCommits}
              pulls={filteredPulls}
              reviews={filteredReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
