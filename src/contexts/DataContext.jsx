import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSessionParams } from '../hooks/useSessionParams';

const DataContext = createContext(null);

export function DataProvider({ children }) {
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
      setLoading(true);
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

  return (
    <DataContext.Provider
      value={{ commits, pulls, reviews, repoName, loading, timeRange, setTimeRange: handleTimeRangeChange }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
