import { isWeekend, isLateNight, getDateKey, getDateRange } from './dateUtils';

export function computeKPIs(commits, pulls, reviews) {
  const totalCommits = commits.length;
  const totalPRs = pulls.length;

  const devSet = new Set([
    ...commits.map((c) => c.author).filter(Boolean),
    ...pulls.map((p) => p.author).filter(Boolean),
  ]);
  const activeDevelopers = devSet.size;

  const avgPRSize =
    totalPRs > 0
      ? Math.round(
          pulls.reduce((s, p) => s + (p.additions || 0) + (p.deletions || 0), 0) / totalPRs
        )
      : 0;

  const { days } = getDateRange(commits);
  const deploymentFrequency =
    days > 0 ? (pulls.filter((p) => p.merged_at).length / (days / 7)).toFixed(1) : 0;

  const prsWithReviews = new Set(reviews.map((r) => r.pr_number));
  const reviewCoverage =
    totalPRs > 0 ? Math.round((prsWithReviews.size / totalPRs) * 100) : 0;

  return {
    totalCommits,
    totalPRs,
    activeDevelopers,
    avgPRSize,
    deploymentFrequency,
    reviewCoverage,
  };
}

export function computeReviewMetrics(pulls, reviews) {
  const totalPRs = pulls.length;
  const totalReviews = reviews.length;

  const reviewsPerPR = totalPRs > 0 ? (totalReviews / totalPRs).toFixed(1) : 0;

  const prsWithReviews = new Set(reviews.map((r) => r.pr_number));
  const unreviewedPRs = pulls.filter((p) => !prsWithReviews.has(p.pr_number)).length;

  let avgResponseTime = 0;
  if (reviews.length > 0) {
    const responseTimes = reviews
      .map((r) => {
        const pr = pulls.find((p) => p.pr_number === r.pr_number);
        if (!pr || !pr.created_at || !r.submitted_at) return null;
        return (new Date(r.submitted_at) - new Date(pr.created_at)) / (1000 * 60 * 60);
      })
      .filter((t) => t !== null && t >= 0);
    if (responseTimes.length > 0) {
      avgResponseTime = (
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      ).toFixed(1);
    }
  }

  return {
    avgResponseTime,
    reviewsPerPR,
    unreviewedPRs,
  };
}

export function computeWorkLifeBalance(commits) {
  if (!commits.length) return { score: 100, weekendPct: 0, lateNightPct: 0 };

  const weekendCommits = commits.filter((c) => isWeekend(c.commit_date)).length;
  const lateNightCommits = commits.filter((c) => isLateNight(c.commit_date)).length;

  const weekendPct = Math.round((weekendCommits / commits.length) * 100);
  const lateNightPct = Math.round((lateNightCommits / commits.length) * 100);
  const score = Math.max(0, 100 - weekendPct - lateNightPct);

  return { score, weekendPct, lateNightPct };
}

export function computeEngineeringHealth(commits, pulls, reviews) {
  const totalPRs = pulls.length;
  const mergedPRs = pulls.filter((p) => p.merged_at).length;
  const { days } = getDateRange(commits);

  // Velocity: commits per day normalized
  const commitsPerDay = days > 0 ? commits.length / days : 0;
  const velocity = Math.min(100, Math.round(commitsPerDay * 20));

  // Code Quality: inverse of avg PR size, normalized
  const avgSize =
    totalPRs > 0
      ? pulls.reduce((s, p) => s + (p.additions || 0) + (p.deletions || 0), 0) / totalPRs
      : 0;
  const codeQuality = Math.max(0, Math.min(100, Math.round(100 - avgSize / 10)));

  // Collaboration: reviews per PR normalized
  const reviewsPerPR = totalPRs > 0 ? reviews.length / totalPRs : 0;
  const collaboration = Math.min(100, Math.round(reviewsPerPR * 50));

  // Consistency: unique commit days / total days
  const uniqueDays = new Set(commits.map((c) => getDateKey(c.commit_date)).filter(Boolean));
  const consistency = days > 0 ? Math.min(100, Math.round((uniqueDays.size / days) * 100)) : 0;

  // Review Efficiency: merge rate
  const reviewEfficiency = totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 100) : 0;

  return [
    { metric: 'Velocity', value: velocity },
    { metric: 'Code Quality', value: codeQuality },
    { metric: 'Collaboration', value: collaboration },
    { metric: 'Consistency', value: consistency },
    { metric: 'Review Efficiency', value: reviewEfficiency },
  ];
}

export function computeSizeDistribution(items) {
  let small = 0,
    medium = 0,
    large = 0;
  items.forEach((item) => {
    const loc = (item.additions || 0) + (item.deletions || 0);
    if (loc < 50) small++;
    else if (loc <= 200) medium++;
    else large++;
  });
  return [
    { name: 'Small (<50 LOC)', value: small, fill: '#10b981' },
    { name: 'Medium (50-200)', value: medium, fill: '#f59e0b' },
    { name: 'Large (>200)', value: large, fill: '#ef4444' },
  ];
}

export function computeHeatmapData(commits) {
  const counts = {};
  commits.forEach((c) => {
    const key = getDateKey(c.commit_date);
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}
