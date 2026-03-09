import { motion } from 'framer-motion';
import { Activity, Github } from 'lucide-react';
import { clearSession } from '../hooks/useSessionParams';

function Login() {
  const handleLogin = () => {
    clearSession();
    window.location.href = 'http://localhost:8000/auth/github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          DevMetrics
        </h1>
        <p className="text-slate-400 mb-8 text-base max-w-sm mx-auto leading-relaxed">
          Advanced developer analytics and insights for your GitHub repositories
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          className="bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-8 rounded-xl transition-colors flex items-center gap-3 mx-auto shadow-lg shadow-white/5"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </motion.button>

        <p className="text-slate-600 text-xs mt-6">
          Secure OAuth authentication · Read-only access
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
