import React from 'react';

const History = ({ history, onRefresh }) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-space text-slate-900">Prediction History</h1>
          <p className="text-slate-500 mt-1">View all patient risk assessments and their outcomes</p>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh
        </button>
      </div>

      {/* History Table */}
      <div className="premium-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold font-space text-slate-900">All Assessments</h2>
            <div className="text-sm text-slate-500">
              {history.length} total predictions
            </div>
          </div>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Risk Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Risk Level</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                            {record.patient_name ? record.patient_name.split(' ').map(n => n[0]).join('') : 'PA'}
                          </div>
                          <div className="font-medium text-slate-800">
                            {record.patient_name || 'Anonymous Patient'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{record.risk_score}%</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelClass(record.risk_score)}`}>
                          {getRiskLevelLabel(record.risk_score)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-cardiowise-blue-600 hover:text-cardiowise-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-history text-4xl text-slate-300 mb-4"></i>
              <div className="text-slate-500">No prediction history available</div>
              <p className="text-sm text-slate-400 mt-2">Run your first risk analysis to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
