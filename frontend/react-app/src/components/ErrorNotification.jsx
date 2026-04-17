import React from 'react';

const ErrorNotification = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-pulse">
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 max-w-sm shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-400 mt-0.5"></i>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-1 text-sm text-red-700">{message}</div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-red-400 hover:text-red-500 focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
