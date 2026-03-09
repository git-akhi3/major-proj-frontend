function DeveloperTable({ commits, pulls, reviews, developers }) {
  const rows = developers.map((dev) => {
    const devCommits = commits.filter((c) => c.author === dev).length;
    const devPRsCreated = pulls.filter((p) => p.author === dev).length;
    const devPRsMerged = pulls.filter(
      (p) => p.author === dev && p.merged_at
    ).length;
    const devReviews = reviews.filter((r) => r.reviewer === dev).length;

    return {
      developer: dev,
      commits: devCommits,
      prsCreated: devPRsCreated,
      prsMerged: devPRsMerged,
      reviewsGiven: devReviews,
    };
  });

  // Sort by commits descending
  rows.sort((a, b) => b.commits - a.commits);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <h2 className="text-lg font-semibold p-5 border-b border-gray-700">
        Developer Activity
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="p-4">Developer</th>
              <th className="p-4">Commits</th>
              <th className="p-4">PRs Created</th>
              <th className="p-4">PRs Merged</th>
              <th className="p-4">Reviews Given</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.developer}
                className="border-b border-gray-700/50 hover:bg-gray-700/30"
              >
                <td className="p-4 font-medium">{row.developer}</td>
                <td className="p-4">{row.commits}</td>
                <td className="p-4">{row.prsCreated}</td>
                <td className="p-4">{row.prsMerged}</td>
                <td className="p-4">{row.reviewsGiven}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No developer data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeveloperTable;
