import { useSearchParams } from 'react-router-dom';

/**
 * Reads user_id / repo_id from URL search params first,
 * falls back to sessionStorage if not in URL.
 * Whenever a value IS present in the URL it gets persisted to sessionStorage.
 */
export function useSessionParams() {
  const [searchParams] = useSearchParams();

  const urlUserId = searchParams.get('user_id');
  const urlRepoId = searchParams.get('repo_id');

  // Persist when present in URL
  if (urlUserId) sessionStorage.setItem('dm_user_id', urlUserId);
  if (urlRepoId) sessionStorage.setItem('dm_repo_id', urlRepoId);

  // Read: URL wins, then sessionStorage
  const userId = urlUserId || sessionStorage.getItem('dm_user_id');
  const repoId = urlRepoId || sessionStorage.getItem('dm_repo_id');

  return { userId, repoId };
}

export function setRepoId(id) {
  sessionStorage.setItem('dm_repo_id', String(id));
}

export function clearSession() {
  sessionStorage.removeItem('dm_user_id');
  sessionStorage.removeItem('dm_repo_id');
}
