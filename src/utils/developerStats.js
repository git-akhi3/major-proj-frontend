import { getDateKey, getDateRange } from './dateUtils';

export function computeDeveloperStats(commits, pulls, reviews) {
  const devSet = new Set([
    ...commits.map((c) => c.author).filter(Boolean),
    ...pulls.map((p) => p.author).filter(Boolean),
  ]);

  const developers = [...devSet];
  const { days: totalDays } = getDateRange(commits);

  const stats = developers.map((dev) => {
    const devCommits = commits.filter((c) => c.author === dev);
    const devPRs = pulls.filter((p) => p.author === dev);
    const devMerged = devPRs.filter((p) => p.merged_at);
    const devReviews = reviews.filter((r) => r.reviewer === dev);
    const avgPRSize =
      devPRs.length > 0
        ? Math.round(
            devPRs.reduce((s, p) => s + (p.additions || 0) + (p.deletions || 0), 0) /
              devPRs.length
          )
        : 0;
    const activeDays = new Set(
      devCommits.map((c) => getDateKey(c.commit_date)).filter(Boolean)
    ).size;

    return {
      developer: dev,
      commits: devCommits.length,
      prsCreated: devPRs.length,
      prsMerged: devMerged.length,
      reviewsGiven: devReviews.length,
      avgPRSize,
      activeDays,
      totalDays,
    };
  });

  // Compute max values for normalization
  const maxCommits = Math.max(1, ...stats.map((s) => s.commits));
  const maxReviews = Math.max(1, ...stats.map((s) => s.reviewsGiven));

  return stats
    .map((s) => {
      const commitScore = s.commits / maxCommits;
      const prScore = s.prsCreated > 0 ? s.prsMerged / s.prsCreated : 0;
      const reviewScore = s.reviewsGiven / maxReviews;
      const consistencyScore = totalDays > 0 ? s.activeDays / totalDays : 0;
      const qualityScore = s.avgPRSize > 0 ? Math.min(1, 100 / s.avgPRSize) : 1;

      const rawScore =
        commitScore * 0.3 +
        prScore * 0.25 +
        reviewScore * 0.2 +
        consistencyScore * 0.15 +
        qualityScore * 0.1;

      const performanceScore = Math.round(rawScore * 100);

      return { ...s, performanceScore };
    })
    .sort((a, b) => b.performanceScore - a.performanceScore);
}
