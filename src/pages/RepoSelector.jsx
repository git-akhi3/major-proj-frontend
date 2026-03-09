import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitFork, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useSessionParams, setRepoId } from '../hooks/useSessionParams';

function RepoSelector() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const navigate = useNavigate();
  const { userId } = useSessionParams();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    api
      .get(`/repos/?user_id=${userId}`)
      .then((res) => setRepos(res.data))
      .catch(() => alert('Failed to load repositories'))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  const handleSync = async (repo) => {
    setSyncing(repo.repo_id);
    try {
      await api.post(`/repos/sync?repo_id=${repo.repo_id}&user_id=${userId}`);
      setRepoId(repo.repo_id);
      navigate(`/dashboard?user_id=${userId}&repo_id=${repo.repo_id}`);
    } catch {
      alert('Failed to sync repository');
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Repositories</h1>
          <p className="text-slate-400 text-sm mt-1">
            Select a repository to sync and view analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo, i) => (
            <motion.div
              key={repo.repo_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50 hover:border-slate-600/60 transition-colors group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <GitFork className="w-[18px] h-[18px] text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-white truncate">{repo.name}</h2>
                  <p className="text-slate-500 text-xs">{repo.owner}</p>
                </div>
              </div>

              {repo.language && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700/50 text-slate-400 mb-3">
                  {repo.language}
                </span>
              )}

              <button
                onClick={() => handleSync(repo)}
                disabled={syncing === repo.repo_id}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600/90 hover:bg-blue-600 disabled:bg-blue-800/50 disabled:cursor-wait text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                {syncing === repo.repo_id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    Sync & View
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RepoSelector;
