import React from 'react';

const LoadingOverlay = ({ message = 'Processing...' }) => {
  return (
    <div className="loading-overlay">
      <div className="bg-white rounded-xl p-8 shadow-xl max-w-sm mx-auto">
        <div className="loading-spinner mx-auto mb-4"></div>
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800 mb-2">
            {message}
          </div>
          <div className="text-sm text-slate-500">
            Please wait...
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
