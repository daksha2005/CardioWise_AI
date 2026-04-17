import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RiskAnalysis from './components/RiskAnalysis';
import History from './components/History';
import Analytics from './components/Analytics';
import Login from './components/Login';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorNotification from './components/ErrorNotification';
import { apiService } from './services/api';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState({ loaded: false, shap: false });
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState({ name: 'Dr. Sharma', initials: 'DR' });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      await Promise.all([
        checkHealth(),
        loadStats(),
        loadHistory()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const data = await apiService.health();
      setModelStatus({
        loaded: data.model_loaded,
        shap: data.shap_enabled
      });
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await apiService.getHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const refreshData = () => {
    initializeApp();
  };

  const handleSignout = () => {
    // Clear authentication state
    setIsLoggedIn(false);
    setUser(null);
    
    // Clear any stored tokens/session
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Reset app state
    setActiveView('dashboard');
    setStats(null);
    setHistory([]);
    setError(null);
    
    // Show success message
    console.log('User signed out successfully');
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    initializeApp();
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="min-h-screen bg-slate-100">
          <Header 
            activeView={activeView}
            onViewChange={setActiveView}
            modelStatus={modelStatus}
            onRefresh={refreshData}
            user={user}
            onSignout={handleSignout}
            isLoggedIn={isLoggedIn}
          />

      <main className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 min-h-screen sticky top-0">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <i className="fas fa-th-large mr-3"></i>
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('predict')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'predict'
                  ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <i className="fas fa-heart mr-3"></i>
              Risk Analysis
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'history'
                  ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <i className="fas fa-history mr-3"></i>
              History
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'analytics'
                  ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <i className="fas fa-chart-line mr-3"></i>
              Analytics
            </button>
          </nav>

          {/* Model Status Card */}
          <div className="p-4 m-4 bg-cardiowise-blue-50 border border-cardiowise-blue-100 rounded-lg">
            <div className="text-sm font-semibold text-cardiowise-blue-600 mb-2">Model Status</div>
            <div className="flex items-center text-sm text-slate-600">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                modelStatus.loaded ? 'bg-green-500' : 'bg-amber-500'
              }`}></div>
              XGBoost v2.0
            </div>
            <div className="text-sm text-slate-500 mt-1">
              SHAP: {modelStatus.shap ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeView === 'dashboard' && (
            <Dashboard stats={stats} history={history} onRefresh={refreshData} />
          )}
          {activeView === 'predict' && (
            <RiskAnalysis onSuccess={refreshData} onError={handleError} />
          )}
          {activeView === 'history' && (
            <History history={history} onRefresh={refreshData} />
          )}
          {activeView === 'analytics' && (
            <Analytics stats={stats} onRefresh={refreshData} />
          )}
        </div>
      </main>
    </div>
      )}
    </>
  );
};

export default App;
