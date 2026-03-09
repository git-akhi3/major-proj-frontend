export function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr);
}

export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDateKey(dateStr) {
  if (!dateStr) return null;
  return dateStr.split('T')[0];
}

export function isWeekend(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isLateNight(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const hour = d.getHours();
  return hour >= 22 || hour < 6;
}

export function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
}

export function getDateRange(commits) {
  if (!commits.length) return { start: new Date(), end: new Date(), days: 1 };
  const dates = commits
    .map((c) => c.commit_date)
    .filter(Boolean)
    .map((d) => new Date(d))
    .sort((a, b) => a - b);
  if (!dates.length) return { start: new Date(), end: new Date(), days: 1 };
  const start = dates[0];
  const end = dates[dates.length - 1];
  return { start, end, days: getDaysBetween(start, end) };
}

export function filterByTimeRange(items, dateField, days) {
  if (!days || days === 'all') return items;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(days));
  return items.filter((item) => {
    const d = parseDate(item[dateField]);
    return d && d >= cutoff;
  });
}
