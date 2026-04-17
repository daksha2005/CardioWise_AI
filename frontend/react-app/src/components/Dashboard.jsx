import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Dashboard = ({ stats, history, onRefresh }) => {
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRecentHistory(history.slice(0, 5));
  }, [history]);

  const getRiskLevelClass = (score) => {
    if (score < 35) return 'risk-low';
    if (score < 60) return 'risk-moderate';
    return 'risk-high';
  };

  const getRiskLevelLabel = (score) => {
    if (score < 35) return 'Low Risk';
    if (score < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-space text-slate-900">Clinical Overview</h1>
        <p className="text-slate-500 mt-1">Dr. Sharma · Cardiology Dept · Last updated just now</p>
      </div>

      {/* Alert Banner */}
      <div className="bg-cardiowise-blue-50 border border-cardiowise-blue-100 rounded-lg p-4 flex items-center">
        <span className="bg-cardiowise-blue-400 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
          Alert
        </span>
        <span className="text-cardiowise-blue-700 flex-1">
          3 high-risk patients flagged since your last login review recommended
        </span>
        <span className="bg-cardiowise-blue-600 text-white text-xs px-2 py-1 rounded-full">
          3 alerts
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-blue-500"></i>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              +4
            </span>
          </div>
          <div className="text-2xl font-bold font-space text-slate-900">24</div>
          <div className="text-sm font-medium text-slate-500">Assessments today</div>
          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              +2
            </span>
          </div>
          <div className="text-2xl font-bold font-space text-red-600">7</div>
          <div className="text-sm font-medium text-slate-500">High Risk</div>
          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '29%' }}></div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-amber-500"></i>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
              -
            </span>
          </div>
          <div className="text-2xl font-bold font-space text-slate-900">38.4<span className="text-sm font-normal text-slate-400">%</span></div>
          <div className="text-sm font-medium text-slate-500">Avg Risk Score</div>
          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '38%' }}></div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-green-500"></i>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              AUC
            </span>
          </div>
          <div className="text-2xl font-bold font-space text-green-600">91.2<span className="text-sm font-normal text-slate-400">%</span></div>
          <div className="text-sm font-medium text-slate-500">Model Confidence</div>
          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '91%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patient Assessments */}
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold font-space text-slate-900">Recent Patient Assessments</h2>
            <div className="flex items-center space-x-2">
              <span className="bg-cardiowise-blue-50 text-cardiowise-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                Today
              </span>
              <button
                onClick={onRefresh}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium px-3 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                View all
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentHistory.length > 0 ? (
              recentHistory.map((patient, index) => (
                <div key={index} className="flex items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                    {patient.patient_name ? patient.patient_name.split(' ').map(n => n[0]).join('') : 'PA'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{patient.patient_name || 'Patient'}</div>
                    <div className="text-sm text-slate-500">Risk Score: {patient.risk_score}%</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelClass(patient.risk_score)}`}>
                    {getRiskLevelLabel(patient.risk_score)} · {patient.risk_score}%
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-user text-4xl text-slate-300 mb-4"></i>
                <div className="text-slate-500">No assessments yet run your first analysis</div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Risk Distribution */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-space text-slate-900">Risk Distribution</h3>
              <span className="bg-cardiowise-blue-50 text-cardiowise-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                All time
              </span>
            </div>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center text-slate-400">
                <i className="fas fa-chart-pie text-3xl mb-2"></i>
                <div className="text-sm">Chart visualization would go here</div>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Model Info</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">XGBoost AUC</span>
                  <span className="text-sm font-semibold text-slate-800">0.91</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">SHAP Precision</span>
                  <span className="text-sm font-semibold text-slate-800">Top 5 features</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Feature Coverage</span>
                  <span className="text-sm font-semibold text-slate-800">15 features</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
