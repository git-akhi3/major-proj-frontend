import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import RepoSelector from './pages/RepoSelector';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/';
  const showSidebar = !isLogin;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-200">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'ml-[240px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/repos" element={<RepoSelector />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
