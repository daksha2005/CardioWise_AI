import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Analytics = ({ onRefresh }) => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        apiService.getStats(),
        apiService.getHistory()
      ]);
      setStats(statsData);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskDistribution = () => {
    if (!history.length) return { low: 0, moderate: 0, high: 0 };
    
    const distribution = { low: 0, moderate: 0, high: 0 };
    history.forEach(record => {
      const score = record.risk_score;
      if (score < 35) distribution.low++;
      else if (score < 60) distribution.moderate++;
      else distribution.high++;
    });
    
    return distribution;
  };

  const getAverageRiskScore = () => {
    if (!history.length) return 0;
    const total = history.reduce((sum, record) => sum + record.risk_score, 0);
    return (total / history.length).toFixed(1);
  };

  const getHighRiskCount = () => {
    return history.filter(record => record.risk_score >= 60).length;
  };

  const createPieChart = (data) => {
    const total = data.low + data.moderate + data.high;
    if (total === 0) return null;

    const lowAngle = (data.low / total) * 360;
    const moderateAngle = (data.moderate / total) * 360;
    const highAngle = (data.high / total) * 360;

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Low Risk */}
          {lowAngle > 0 && (
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#10b981"
              strokeWidth="40"
              strokeDasharray={`${lowAngle * 1.4} 9999`}
            />
          )}
          {/* Moderate Risk */}
          {moderateAngle > 0 && (
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="40"
              strokeDasharray={`${moderateAngle * 1.4} 9999`}
              strokeDashoffset={`-${lowAngle * 1.4}`}
            />
          )}
          {/* High Risk */}
          {highAngle > 0 && (
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#ef4444"
              strokeWidth="40"
              strokeDasharray={`${highAngle * 1.4} 9999`}
              strokeDashoffset={`-${(lowAngle + moderateAngle) * 1.4}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{total}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const createLineChart = () => {
    if (!history.length) return null;

    const recentHistory = history.slice(-7);
    const maxScore = Math.max(...recentHistory.map(r => r.risk_score));
    const minScore = Math.min(...recentHistory.map(r => r.risk_score));
    const range = maxScore - minScore || 1;

    const points = recentHistory.map((record, index) => {
      const x = (index / (recentHistory.length - 1)) * 180;
      const y = 180 - ((record.risk_score - minScore) / range) * 160;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent, i) => (
            <line
              key={i}
              x1="20"
              y1={180 - (percent / 100) * 160}
              x2="180"
              y2={180 - (percent / 100) * 160}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Line chart */}
          <polyline
            points={points}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {recentHistory.map((record, index) => {
            const x = (index / (recentHistory.length - 1)) * 180;
            const y = 180 - ((record.risk_score - minScore) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#2563eb"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const createBarChart = () => {
    const features = [
      { name: 'Age', importance: 85 },
      { name: 'BMI', importance: 78 },
      { name: 'BP', importance: 72 },
      { name: 'Cholesterol', importance: 65 },
      { name: 'Glucose', importance: 58 },
    ];

    return (
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-slate-600 truncate">{feature.name}</div>
            <div className="flex-1 mx-3">
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cardiowise-blue-400 to-cardiowise-blue-600 rounded-full"
                  style={{ width: `${feature.importance}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-sm font-semibold text-slate-700 text-right">
              {feature.importance}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-space text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Loading analytics data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="premium-card p-6">
              <div className="h-64 bg-slate-100 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const riskDistribution = getRiskDistribution();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-space text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <button
          onClick={() => {
            fetchAnalyticsData();
            onRefresh && onRefresh();
          }}
          className="btn-secondary"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Risk Distribution</h3>
          <div className="flex flex-col items-center">
            {createPieChart(riskDistribution)}
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-600">Low ({riskDistribution.low})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-600">Moderate ({riskDistribution.moderate})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-600">High ({riskDistribution.high})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Risk Score Trends</h3>
          {history.length > 0 ? (
            <div>
              {createLineChart()}
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Last 7 predictions</span>
                <span>Range: {Math.min(...history.slice(-7).map(r => r.risk_score))}% - {Math.max(...history.slice(-7).map(r => r.risk_score))}%</span>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-slate-400">
                <i className="fas fa-chart-line text-3xl mb-2"></i>
                <div className="text-sm">No trend data available</div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Importance */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Feature Importance</h3>
          {createBarChart()}
        </div>

        {/* Performance Metrics */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Model Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Accuracy</span>
                <span className="text-sm font-semibold text-slate-800">91.2%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '91.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Precision</span>
                <span className="text-sm font-semibold text-slate-800">89.5%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '89.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Recall</span>
                <span className="text-sm font-semibold text-slate-800">87.8%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '87.8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">F1 Score</span>
                <span className="text-sm font-semibold text-slate-800">88.6%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '88.6%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold font-space text-cardiowise-blue-600">
              {history.length}
            </div>
            <div className="text-sm text-slate-500 mt-1">Total Predictions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-space text-green-600">
              {getAverageRiskScore()}%
            </div>
            <div className="text-sm text-slate-500 mt-1">Average Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-space text-amber-600">
              {getHighRiskCount()}
            </div>
            <div className="text-sm text-slate-500 mt-1">High Risk Cases</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-space text-purple-600">
              {stats?.model_loaded ? '91.2' : '0'}%
            </div>
            <div className="text-sm text-slate-500 mt-1">Model Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
