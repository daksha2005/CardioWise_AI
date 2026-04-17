import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login (in real app, this would call an API)
    setTimeout(() => {
      const userData = {
        name: formData.username || 'Dr. Sharma',
        initials: formData.username ? formData.username.split(' ').map(n => n[0]).join('') : 'DR',
        role: 'Cardiologist'
      };
      onLogin(userData);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cardiowise-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-cardiowise-blue-400 rounded-xl flex items-center justify-center mr-3">
            <i className="fas fa-heart text-white text-lg"></i>
          </div>
          <span className="font-space font-bold text-2xl text-slate-900">CardioWise</span>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500">Sign in to access your cardiovascular dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-800">
            <div className="font-semibold mb-1">Demo Access:</div>
            <div>Enter any username and password to access the demo dashboard</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
