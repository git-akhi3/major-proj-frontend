import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import RepoSelector from './pages/RepoSelector';
import Overview from './pages/Overview';
import Developers from './pages/Developers';
import CodeInsights from './pages/CodeInsights';
import Reviews from './pages/Reviews';
import Activity from './pages/Activity';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import { DataProvider } from './contexts/DataContext';

function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/';
  const isRepoSelector = location.pathname === '/repos';
  const showSidebar = !isLogin;
  const needsData = !isLogin && !isRepoSelector;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-200">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'ml-[240px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/repos" element={<RepoSelector />} />
        </Routes>
        {needsData && (
          <DataProvider>
            <Routes>
              <Route path="/overview" element={<Overview />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/code-insights" element={<CodeInsights />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </DataProvider>
        )}
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
