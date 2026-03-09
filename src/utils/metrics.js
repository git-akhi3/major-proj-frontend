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

export function computeCommitCategories(commits) {
  const categories = {
    Feature: 0, Fix: 0, Docs: 0, Refactor: 0,
    Test: 0, Chore: 0, Style: 0, Other: 0,
  };
  commits.forEach((c) => {
    const msg = (c.message || '').toLowerCase();
    if (/^feat|feature|add |implement|new /.test(msg)) categories.Feature++;
    else if (/^fix|bug|patch|resolve|hotfix/.test(msg)) categories.Fix++;
    else if (/^doc|readme|comment/.test(msg)) categories.Docs++;
    else if (/^refactor|restructure|clean|simplif/.test(msg)) categories.Refactor++;
    else if (/^test|spec|coverage/.test(msg)) categories.Test++;
    else if (/^chore|build|ci|deploy|release|bump|config/.test(msg)) categories.Chore++;
    else if (/^style|format|lint|prettier/.test(msg)) categories.Style++;
    else categories.Other++;
  });
  return Object.entries(categories)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

export function computeCommitsByWeekday(commits) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts = new Array(7).fill(0);
  commits.forEach((c) => {
    if (!c.commit_date) return;
    counts[new Date(c.commit_date).getDay()]++;
  });
  return days.map((name, i) => ({ name: name.slice(0, 3), commits: counts[i] }));
}

export function computeCommitsByHour(commits) {
  const counts = new Array(24).fill(0);
  commits.forEach((c) => {
    if (!c.commit_date) return;
    counts[new Date(c.commit_date).getHours()]++;
  });
  return counts.map((commits, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    commits,
  }));
}

export function computeActivityInsights(commits) {
  if (!commits.length) return { peakHour: 'N/A', mostActiveDay: 'N/A', weekendPct: 0, lateNightPct: 0 };
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  let weekendCount = 0;
  let lateNightCount = 0;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  commits.forEach((c) => {
    if (!c.commit_date) return;
    const d = new Date(c.commit_date);
    const hour = d.getHours();
    const day = d.getDay();
    hourCounts[hour]++;
    dayCounts[day]++;
    if (day === 0 || day === 6) weekendCount++;
    if (hour >= 22 || hour < 6) lateNightCount++;
  });
  const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
  const mostActiveDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  return {
    peakHour: `${peakHourIndex.toString().padStart(2, '0')}:00`,
    mostActiveDay: days[mostActiveDayIndex],
    weekendPct: Math.round((weekendCount / commits.length) * 100),
    lateNightPct: Math.round((lateNightCount / commits.length) * 100),
  };
}

export function computeReviewActivityOverTime(reviews) {
  const byDate = {};
  reviews.forEach((r) => {
    if (!r.submitted_at) return;
    const date = r.submitted_at.split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });
  return Object.entries(byDate)
    .map(([date, reviews]) => ({ date, reviews }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeReviewParticipation(reviews) {
  const byDev = {};
  reviews.forEach((r) => {
    const reviewer = r.reviewer || 'Unknown';
    byDev[reviewer] = (byDev[reviewer] || 0) + 1;
  });
  return Object.entries(byDev)
    .map(([name, reviews]) => ({ name, reviews }))
    .sort((a, b) => b.reviews - a.reviews);
}

export function computeHealthScore(commits, pulls, reviews) {
  const health = computeEngineeringHealth(commits, pulls, reviews);
  return Math.round(health.reduce((sum, h) => sum + h.value, 0) / health.length);
}

export function generateInsights(commits, pulls, reviews) {
  const insights = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentCommits = commits.filter((c) => c.commit_date && new Date(c.commit_date) >= thirtyDaysAgo);
  const olderCommits = commits.filter((c) => c.commit_date && new Date(c.commit_date) >= sixtyDaysAgo && new Date(c.commit_date) < thirtyDaysAgo);
  const recentPulls = pulls.filter((p) => p.created_at && new Date(p.created_at) >= thirtyDaysAgo);
  const olderPulls = pulls.filter((p) => p.created_at && new Date(p.created_at) >= sixtyDaysAgo && new Date(p.created_at) < thirtyDaysAgo);
  const recentReviews = reviews.filter((r) => r.submitted_at && new Date(r.submitted_at) >= thirtyDaysAgo);
  const olderReviews = reviews.filter((r) => r.submitted_at && new Date(r.submitted_at) >= sixtyDaysAgo && new Date(r.submitted_at) < thirtyDaysAgo);

  if (olderCommits.length > 0) {
    const velocityChange = ((recentCommits.length - olderCommits.length) / olderCommits.length) * 100;
    if (velocityChange > 20) insights.push({ type: 'positive', message: `Commit velocity increased by ${Math.round(velocityChange)}% in the last 30 days` });
    else if (velocityChange < -20) insights.push({ type: 'warning', message: `Commit velocity decreased by ${Math.round(Math.abs(velocityChange))}% in the last 30 days` });
  }

  const recentPRsWithReview = new Set(recentReviews.map((r) => r.pr_number));
  const olderPRsWithReview = new Set(olderReviews.map((r) => r.pr_number));
  const recentCoverage = recentPulls.length > 0 ? (recentPRsWithReview.size / recentPulls.length) * 100 : 0;
  const olderCoverage = olderPulls.length > 0 ? (olderPRsWithReview.size / olderPulls.length) * 100 : 0;
  if (olderCoverage > 0 && recentCoverage < olderCoverage - 10) insights.push({ type: 'warning', message: `Review coverage dropped from ${Math.round(olderCoverage)}% to ${Math.round(recentCoverage)}%` });
  else if (recentCoverage > olderCoverage + 10) insights.push({ type: 'positive', message: `Review coverage improved to ${Math.round(recentCoverage)}%` });

  const avgMergeTime = (prs) => {
    const merged = prs.filter((p) => p.merged_at);
    if (!merged.length) return 0;
    return merged.reduce((s, p) => s + (new Date(p.merged_at) - new Date(p.created_at)) / (1000 * 60 * 60), 0) / merged.length;
  };
  const recentMergeTime = avgMergeTime(recentPulls);
  const olderMergeTime = avgMergeTime(olderPulls);
  if (olderMergeTime > 0 && recentMergeTime > olderMergeTime * 1.3) insights.push({ type: 'warning', message: `PR merge time increased from ${Math.round(olderMergeTime)}h to ${Math.round(recentMergeTime)}h` });
  else if (olderMergeTime > 0 && recentMergeTime < olderMergeTime * 0.7) insights.push({ type: 'positive', message: `PR merge time improved from ${Math.round(olderMergeTime)}h to ${Math.round(recentMergeTime)}h` });

  const largePRs = pulls.filter((p) => (p.additions || 0) + (p.deletions || 0) > 400);
  const largePRRatio = pulls.length > 0 ? (largePRs.length / pulls.length) * 100 : 0;
  if (largePRRatio > 30) insights.push({ type: 'warning', message: `${Math.round(largePRRatio)}% of PRs are large (>400 LOC). Consider smaller PRs.` });

  const devSet = new Set([...commits.map((c) => c.author).filter(Boolean)]);
  if (devSet.size >= 5) insights.push({ type: 'positive', message: `${devSet.size} active developers contributing to this repository` });

  if (!insights.length) insights.push({ type: 'info', message: 'Not enough historical data to generate trend insights. Keep contributing!' });
  return insights;
}

export function exportCSV(commits, pulls, reviews, repoName) {
  const rows = [['Developer', 'Commits', 'PRs Created', 'PRs Merged', 'Reviews Given', 'Avg PR Size (LOC)']];
  const devSet = new Set([...commits.map((c) => c.author).filter(Boolean), ...pulls.map((p) => p.author).filter(Boolean)]);
  [...devSet].forEach((dev) => {
    const devPRs = pulls.filter((p) => p.author === dev);
    const avgSize = devPRs.length > 0 ? Math.round(devPRs.reduce((s, p) => s + (p.additions || 0) + (p.deletions || 0), 0) / devPRs.length) : 0;
    rows.push([dev, commits.filter((c) => c.author === dev).length, devPRs.length, devPRs.filter((p) => p.merged_at).length, reviews.filter((r) => r.reviewer === dev).length, avgSize]);
  });
  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(repoName || 'report').replace('/', '_')}_report.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
