import React from 'react';

const Header = ({ activeView, onViewChange, modelStatus, onRefresh, user, onSignout, isLoggedIn }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center mr-8">
        <div className="w-8 h-8 bg-cardiowise-blue-400 rounded-lg flex items-center justify-center mr-3">
          <i className="fas fa-heart text-white text-sm"></i>
        </div>
        <span className="font-space font-bold text-lg text-slate-900">CardioWise</span>
      </div>

      {/* Navigation */}
      <nav className="flex space-x-1 flex-1">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'dashboard'
              ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onViewChange('predict')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'predict'
              ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Risk Analysis
        </button>
        <button
          onClick={() => onViewChange('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'history'
              ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          History
        </button>
        <button
          onClick={() => onViewChange('analytics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'analytics'
              ? 'bg-cardiowise-blue-50 text-cardiowise-blue-600'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Analytics
        </button>
      </nav>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Model Status */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            modelStatus.loaded ? 'bg-green-500' : 'bg-amber-500'
          }`}></div>
          <span className="text-xs font-semibold text-slate-600">
            {modelStatus.loaded ? 'XGBoost Online' : 'Loading...'}
          </span>
        </div>

        {/* Notifications */}
        <button className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
          <i className="fas fa-bell text-slate-400 text-sm"></i>
        </button>

        {/* User Info and Signout */}
        {isLoggedIn && user ? (
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cardiowise-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.initials || 'DR'}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500">Cardiology Dept</div>
              </div>
            </div>

            {/* Signout Button */}
            <button
              onClick={onSignout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign out"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          /* Login Button */
          <button
            onClick={() => {/* Handle login modal or redirect */}}
            className="btn-primary text-sm"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Sign in
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          title="Refresh Data"
        >
          <i className="fas fa-sync-alt text-slate-400 text-sm"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
