import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

function Charts({ commits, pulls }) {
  // 1. Commits per developer
  const commitsByDev = {};
  commits.forEach((c) => {
    const author = c.author || 'Unknown';
    commitsByDev[author] = (commitsByDev[author] || 0) + 1;
  });
  const commitsPerDevData = Object.entries(commitsByDev)
    .map(([name, count]) => ({ name, commits: count }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 15);

  // 2. PR merge timeline (merged PRs grouped by date)
  const mergedPRs = pulls.filter((p) => p.merged_at);
  const mergesByDate = {};
  mergedPRs.forEach((pr) => {
    const date = pr.merged_at.split('T')[0];
    mergesByDate[date] = (mergesByDate[date] || 0) + 1;
  });
  const mergeTimelineData = Object.entries(mergesByDate)
    .map(([date, count]) => ({ date, merged: count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 3. Commit activity per day
  const commitsByDate = {};
  commits.forEach((c) => {
    if (!c.commit_date) return;
    const date = c.commit_date.split('T')[0];
    commitsByDate[date] = (commitsByDate[date] || 0) + 1;
  });
  const commitActivityData = Object.entries(commitsByDate)
    .map(([date, count]) => ({ date, commits: count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 mb-8">
      {/* Commits per Developer */}
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Commits per Developer</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={commitsPerDevData}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="commits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PR Merge Timeline */}
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">PR Merge Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mergeTimelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="merged" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Commit Activity per Day */}
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Commit Activity per Day</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={commitActivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="commits" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;
