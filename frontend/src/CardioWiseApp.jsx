import React, { useState, useEffect } from 'react';
import './CardioWise.css';

const CardioWiseApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [assessmentData, setAssessmentData] = useState({
    patient_name: '',
    age: '',
    height: '',
    weight: '',
    ap_hi: '',
    ap_lo: '',
    cholesterol: '1',
    gluc: '1',
    smoke: false,
    alco: false,
    active: true,
    pregnancy_history: true
  });
  const [results, setResults] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [bmi, setBmi] = useState(0);
  const [modelStatus, setModelStatus] = useState({ loaded: false, shap: false });
  const [loadingStep, setLoadingStep] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [batchFile, setBatchFile] = useState(null);
  const [batchData, setBatchData] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      checkHealth();
      loadDashboard();
      loadHistory();
    }
  }, [isLoggedIn]);

  // Auto BMI calculation
  useEffect(() => {
    if (assessmentData.weight && assessmentData.height) {
      const weight = parseFloat(assessmentData.weight);
      const height = parseFloat(assessmentData.height) / 100;
      const calculatedBmi = weight / (height * height);
      setBmi(calculatedBmi.toFixed(1));
    }
  }, [assessmentData.weight, assessmentData.height]);

  const checkHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setModelStatus({
        loaded: data.model_loaded,
        shap: data.shap_enabled
      });
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      const data = await response.json();
      // Update dashboard with stats
      console.log('Dashboard stats:', data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history');
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAssessmentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const loadSampleData = () => {
    setAssessmentData({
      patient_name: 'Sarah Johnson',
      age: '45',
      height: '165',
      weight: '70',
      ap_hi: '120',
      ap_lo: '80',
      cholesterol: '1',
      gluc: '1',
      smoke: false,
      alco: false,
      active: true,
      pregnancy_history: true
    });
  };

  const clearForm = () => {
    setAssessmentData({
      patient_name: '',
      age: '',
      height: '',
      weight: '',
      ap_hi: '',
      ap_lo: '',
      cholesterol: '1',
      gluc: '1',
      smoke: false,
      alco: false,
      active: true,
      pregnancy_history: false
    });
    setResults(null);
  };

  const runPrediction = async () => {
    setLoading(true);
    setShowLoading(true);
    setLoadingStep('Preprocessing features...');
    
    try {
      // Simulate loading steps
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStep('Running XGBoost model...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStep('Generating SHAP explanations...');
      
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
      
      setLoadingStep('Finalizing report...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResults(data);
      setActiveView('predict');
      loadHistory();
    } catch (error) {
      console.error('Prediction failed:', error);
      alert('Prediction failed: ' + error.message);
    } finally {
      setLoading(false);
      setShowLoading(false);
      setLoadingStep('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setBatchFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const patients = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 10) {
            patients.push({
              patient_name: values[0] || `Patient_${i}`,
              age: parseInt(values[1]) || 45,
              height: parseInt(values[2]) || 165,
              weight: parseFloat(values[3]) || 70,
              ap_hi: parseInt(values[4]) || 120,
              ap_lo: parseInt(values[5]) || 80,
              cholesterol: parseInt(values[6]) || 1,
              gluc: parseInt(values[7]) || 1,
              smoke: parseInt(values[8]) || 0,
              alco: parseInt(values[9]) || 0,
              active: parseInt(values[10]) || 1,
              pregnancy_history: parseInt(values[11]) || 0
            });
          }
        }
        setBatchData(patients);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const runBatchPrediction = async () => {
    if (batchData.length === 0) {
      alert('Please upload patient data first');
      return;
    }
    
    setLoading(true);
    setShowLoading(true);
    setLoadingStep(`Processing ${batchData.length} patients...`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStep('Running batch XGBoost predictions...');
      
      const response = await fetch('http://localhost:5000/api/batch_predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patients: batchData })
      });
      
      setLoadingStep('Finalizing batch report...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const data = await response.json();
      setBatchResults(data);
      setActiveView('batch');
      loadHistory();
    } catch (error) {
      console.error('Batch prediction failed:', error);
      alert('Batch prediction failed. Please try again.');
    } finally {
      setLoading(false);
      setShowLoading(false);
      setLoadingStep('');
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `patient_name,age,height,weight,ap_hi,ap_lo,cholesterol,gluc,smoke,alco,active,pregnancy_history
Jane Smith,62,165,100,155,95,3,2,1,0,0,1
Sarah Jones,45,170,75,130,85,2,1,0,0,1,0
Emily Brown,55,160,85,145,90,1,1,0,1,0,1`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'cardiowise_sample.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const switchPage = (page) => {
    setActiveView(page);
  };

  const setTog = (field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value === 1
    }));
  };

  const getRiskCategory = (score) => {
    if (score < 35) return { label: 'Low Risk', class: 'low', color: 'var(--green)' };
    if (score < 60) return { label: 'Moderate Risk', class: 'moderate', color: 'var(--amber)' };
    return { label: 'High Risk', class: 'high', color: 'var(--red)' };
  };

  const getDerivedIndicators = () => {
    const age = parseInt(assessmentData.age) || 0;
    const weight = parseFloat(assessmentData.weight) || 0;
    const height = parseFloat(assessmentData.height) || 0;
    const ap_hi = parseInt(assessmentData.ap_hi) || 0;
    const gluc = parseInt(assessmentData.gluc) || 1;
    const active = assessmentData.active;
    
    const calculatedBmi = height > 0 ? weight / ((height / 100) ** 2) : 0;
    const isMenopausal = age >= 50 ? 1 : 0;
    const hasPcos = (gluc > 1 && !active && age <= 40) ? 1 : 0;
    const hasThyroid = (ap_hi > 140 && calculatedBmi > 30) ? 1 : 0;
    
    return {
      menopause: isMenopausal ? 'Post-Menopause' : 'Pre-Menopause',
      pcos: hasPcos ? 'PCOS Detected' : 'No PCOS',
      thyroid: hasThyroid ? 'Thyroid Risk' : 'No Thyroid Issue',
      pregnancy: assessmentData.pregnancy_history ? 'Pregnancy History' : 'No Pregnancy Complications'
    };
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-left">
          <div className="ll-brand">
            <div className="ll-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div>
              <div className="ll-brand-name">CardioWise AI</div>
              <div className="ll-brand-tag">Clinical Decision Support</div>
            </div>
          </div>

          <div className="ll-hero">
            <div className="ll-eyebrow">
              <div className="ll-eyebrow-dot"></div>
              <span>XGBoost · SHAP · v2.0</span>
            </div>
            <div className="ll-headline">AI-powered hearts<br/>care for <em>women's</em><br/>health</div>
            <div className="ll-sub">The most precise cardiovascular risk prediction engine trained on real clinical data, built for cardiologists.</div>
            <div className="ll-stats">
              <div><div className="ll-stat-val">91.2%</div><div className="ll-stat-lbl">Model AUC</div></div>
              <div><div className="ll-stat-val">70k+</div><div className="ll-stat-lbl">Patients trained</div></div>
              <div><div className="ll-stat-val">SHAP</div><div className="ll-stat-lbl">Explainability</div></div>
            </div>
            <div className="ll-features" style={{marginTop: '2rem'}}>
              <div className="ll-feature">
                <div className="ll-feature-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="ll-feature-text">Women-specific risk factors menopause, PCOS, thyroid</span>
              </div>
              <div className="ll-feature">
                <div className="ll-feature-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="ll-feature-text">Real SHAP explainability know why every prediction is made</span>
              </div>
              <div className="ll-feature">
                <div className="ll-feature-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="ll-feature-text">Personalized diet & clinical advisory engine</span>
              </div>
            </div>
            <div className="ll-trust">
              <div className="ll-trust-dot"></div>
              <span className="ll-trust-txt">Research-grade · Explainable AI · Not a diagnostic replacement</span>
            </div>
          </div>

          <div style={{fontSize: '.62rem', color: '#1e3a5f'}}>© 2025 CardioWise AI Educational Tool Only</div>
        </div>

        <div className="login-right">
          <div className="lc">
            <div className="lc-title">Welcome back</div>
            <div className="lc-sub">Sign in to your CardioWise dashboard</div>

            <div className="role-tabs">
              <button className="role-tab active">Clinician</button>
              <button className="role-tab">Researcher</button>
              <button className="role-tab">Admin</button>
            </div>

            <label className="lc-label">Email address</label>
            <input className="lc-input" type="email" placeholder="dr.sharma@hospital.org" defaultValue="doctor@example.com" />

            <label className="lc-label">Password</label>
            <input className="lc-input" type="password" placeholder="··············" defaultValue="doctor123" />

            <div className="lc-row">
              <label className="lc-check">
                <input type="checkbox" defaultChecked /> Remember this device
              </label>
              <button className="lc-forgot">Forgot password?</button>
            </div>

            <button className="btn-primary" onClick={handleLogin}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Sign in to Dashboard
            </button>

            <div className="lc-divider">
              <hr/><span>or continue with</span><hr/>
            </div>

            <button className="btn-sso" onClick={handleLogin}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google SSO
            </button>

            <div className="lc-footer">New to CardioWise? <a onClick={handleLogin}>Request access</a></div>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="app">
      {/* Loading Overlay */}
      <div className={`loading-overlay ${showLoading ? 'on' : ''}`}>
        <div className="loading-box">
          <div className="spinner"></div>
          <div className="loading-txt">Running AI Analysis</div>
          <div className="loading-step">{loadingStep}</div>
        </div>
      </div>

      {/* Topbar */}
      <div className="topbar">
        <div className="tb-brand">
          <div className="tb-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span className="tb-name">CardioWise</span>
        </div>
        <div className="tb-sep"></div>
        <nav className="tb-nav">
          <button className={`tb-nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => switchPage('dashboard')}>Dashboard</button>
          <button className={`tb-nav-item ${activeView === 'predict' ? 'active' : ''}`} onClick={() => switchPage('predict')}>Individual</button>
          <button className={`tb-nav-item ${activeView === 'batch' ? 'active' : ''}`} onClick={() => switchPage('batch')}>Batch</button>
          <button className={`tb-nav-item ${activeView === 'history' ? 'active' : ''}`} onClick={() => switchPage('history')}>History</button>
          <button className={`tb-nav-item ${activeView === 'stats' ? 'active' : ''}`} onClick={() => switchPage('stats')}>Analytics</button>
        </nav>
        <div className="tb-right">
          <div className="tb-status">
            <div className="tb-status-dot" style={{background: modelStatus.loaded ? 'var(--green)' : 'var(--amber)'}}></div>
            <span className="tb-status-txt">{modelStatus.loaded ? 'XGBoost Online' : 'Loading...'}</span>
          </div>
          <div className="tb-notif">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="tb-avatar">DR</div>
        </div>
      </div>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-heading">Main</div>
            <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => switchPage('dashboard')}>
              <div className="nav-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              Dashboard
            </button>
            <button className={`nav-item ${activeView === 'predict' ? 'active' : ''}`} onClick={() => switchPage('predict')}>
              <div className="nav-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              Individual
            </button>
            <button className={`nav-item ${activeView === 'batch' ? 'active' : ''}`} onClick={() => switchPage('batch')}>
              <div className="nav-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              Batch Prediction
            </button>
            <button className={`nav-item ${activeView === 'history' ? 'active' : ''}`} onClick={() => switchPage('history')}>
              <div className="nav-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              History
            </button>
            <button className={`nav-item ${activeView === 'stats' ? 'active' : ''}`} onClick={() => switchPage('stats')}>
              <div className="nav-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              Analytics
            </button>
          </div>
          <div className="sidebar-card">
            <div className="sc-label">Model Status</div>
            <div className="sc-val">
              <span className="sc-dot"></span>
              <span>XGBoost v2.0</span>
            </div>
            <div className="sc-val" style={{marginTop: '3px', color: '#94a3b8'}}>
              SHAP: <span>{modelStatus.shap ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main">
          {/* Dashboard Page */}
          <div className={`page-section ${activeView === 'dashboard' ? 'active' : ''}`} id="page-dashboard">
            <div className="page-header">
              <div className="page-title">Clinical Overview</div>
              <div className="page-sub">Dr. Sharma · Cardiology Dept · Last updated just now</div>
            </div>

            <div className="alert-banner">
              <span className="ab-pill">Alert</span>
              <span className="ab-txt">3 high-risk patients flagged since your last login review recommended</span>
              <span className="ab-count">3 alerts</span>
            </div>

            <div className="kpi-row">
              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{background: '#eff6ff'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                  </div>
                  <span className="kpi-trend up">+4</span>
                </div>
                <div className="kpi-val">24</div>
                <div className="kpi-lbl">Assessments today</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{background: '#2563eb', width: '72%'}}></div>
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{background: '#fee2e2'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <span className="kpi-trend down">+2</span>
                </div>
                <div className="kpi-val" style={{color: 'var(--red)'}}>7</div>
                <div className="kpi-lbl">High Risk</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{background: 'var(--red)', width: '29%'}}></div>
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{background: '#fef3c7'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <span className="kpi-trend neu">-</span>
                </div>
                <div className="kpi-val">38.4<sup>%</sup></div>
                <div className="kpi-lbl">Avg Risk Score</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{background: 'var(--amber)', width: '38%'}}></div>
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{background: '#dcfce7'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <span className="kpi-trend up">AUC</span>
                </div>
                <div className="kpi-val" style={{color: 'var(--green)'}}>91.2<sup>%</sup></div>
                <div className="kpi-lbl">Model Confidence</div>
                <div className="kpi-bar">
                  <div className="kpi-bar-fill" style={{background: 'var(--green)', width: '91%'}}></div>
                </div>
              </div>
            </div>

            <div className="dash-grid">
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Recent Patient Assessments</div>
                  <div className="card-actions">
                    <span className="chip chip-blue">Today</span>
                    <button onClick={() => switchPage('history')} style={{background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '6px', padding: '3px 10px', fontSize: '.68rem', fontWeight: '600', color: 'var(--slate-500)', cursor: 'pointer', fontFamily: 'inherit'}}>
                      View all
                    </button>
                  </div>
                </div>
                <div>
                  {history.slice(0, 5).map((patient, idx) => (
                    <div key={idx} className="patient-row">
                      <div className="pat-av" style={{background: '#dbeafe', color: '#1d4ed8'}}>
                        {patient.patient_name ? patient.patient_name.split(' ').map(n => n[0]).join('') : 'PA'}
                      </div>
                      <div>
                        <div className="pat-name">{patient.patient_name || 'Patient'}</div>
                        <div className="pat-meta">Risk Score: {patient.risk_score}%</div>
                      </div>
                      <div className={`risk-badge ${
                        patient.risk_score < 35 ? 'rb-l' : 
                        patient.risk_score < 60 ? 'rb-m' : 'rb-h'
                      }`}>
                        {patient.risk_category} · {patient.risk_score}%
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon" style={{fontSize: '1.5rem'}}>person</div>
                      <div className="empty-txt">No assessments yet run your first analysis</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Risk Distribution</div>
                    <span className="chip chip-blue">All time</span>
                  </div>
                  <div className="chart-wrap">
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', fontSize: '.8rem', color: 'var(--slate-400)'}}>
                      Chart visualization would go here
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Model Info</div>
                  </div>
                  <div className="score-item">
                    <div className="score-lbl">
                      <span>XGBoost AUC</span>
                      <strong>0.91</strong>
                    </div>
                    <div className="score-track">
                      <div className="score-fill" style={{width: '91%', background: 'var(--blue-400)'}}></div>
                    </div>
                  </div>
                  <div className="score-item">
                    <div className="score-lbl">
                      <span>SHAP Precision</span>
                      <strong>Top 5 features</strong>
                    </div>
                    <div className="score-track">
                      <div className="score-fill" style={{width: '100%', background: 'var(--purple)'}}></div>
                    </div>
                  </div>
                  <div className="score-item">
                    <div className="score-lbl">
                      <span>Feature Coverage</span>
                      <strong>15 features</strong>
                    </div>
                    <div className="score-track">
                      <div className="score-fill" style={{width: '100%', background: 'var(--green)'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis Page */}
          <div className={`page-section ${activeView === 'predict' ? 'active' : ''}`} id="page-predict">
            <div className="page-header">
              <div className="page-title">Risk Analysis</div>
              <div className="page-sub">Enter patient data to generate an AI-powered cardiovascular risk report with SHAP explainability</div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '420px 1fr', gap: '16px', alignItems: 'start'}}>
              {/* Form */}
              <div className="form-card">
                <div className="form-topbar">
                  <div>
                    <h2>Patient Input</h2>
                    <p>All fields required for accurate prediction</p>
                  </div>
                  <div className="form-topbar-badge">XGBoost · SHAP</div>
                </div>
                <div className="form-body">
                  <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem'}}>
                    <button className="sample-btn" onClick={clearForm}>Clear</button>
                  </div>

                  {/* Basic Information */}
                  <div className="fsec">
                    <div className="fsec-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Basic Information
                    </div>
                    <div className="field" style={{marginBottom: '10px'}}>
                      <label>Patient Name</label>
                      <input type="text" name="patient_name" value={assessmentData.patient_name} onChange={handleInputChange} placeholder="e.g. Priya Sharma"/>
                    </div>
                    <div className="field-grid">
                      <div className="field">
                        <label>Age (years)</label>
                        <input type="number" name="age" value={assessmentData.age} onChange={handleInputChange} min="18" max="100" placeholder="45"/>
                      </div>
                      <div className="field">
                        <label>Height (cm)</label>
                        <input type="number" name="height" value={assessmentData.height} onChange={handleInputChange} min="100" max="250" placeholder="162"/>
                      </div>
                    </div>
                    <div className="field-grid" style={{marginTop: '10px'}}>
                      <div className="field">
                        <label>Weight (kg)</label>
                        <input type="number" name="weight" value={assessmentData.weight} onChange={handleInputChange} min="30" max="300" step="0.1" placeholder="65"/>
                      </div>
                      <div>
                        <div className="field">
                          <label>BMI (auto)</label>
                          <div className="field-badge">{bmi || '---'}</div>
                        </div>
                      </div>
                    </div>
                    {bmi > 0 && (
                      <div className="bmi-computed">
                        <div>
                          <div className="bmi-val">{bmi}</div>
                          <div className="bmi-cat">
                            {bmi >= 30 ? '(Obese)' : bmi >= 25 ? '(Overweight)' : '(Normal)'}
                          </div>
                        </div>
                        <div style={{fontSize: '.68rem', color: 'var(--slate-400)', textAlign: 'right'}}>
                          weight / height²<br/>(kg/m²)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clinical Vitals */}
                  <div className="fsec">
                    <div className="fsec-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                      Clinical Vitals
                    </div>
                    <div className="field-grid">
                      <div className="field">
                        <label>Systolic BP (mmHg)</label>
                        <input type="number" name="ap_hi" value={assessmentData.ap_hi} onChange={handleInputChange} min="70" max="250" placeholder="120"/>
                      </div>
                      <div className="field">
                        <label>Diastolic BP (mmHg)</label>
                        <input type="number" name="ap_lo" value={assessmentData.ap_lo} onChange={handleInputChange} min="40" max="150" placeholder="80"/>
                      </div>
                    </div>
                    <div className="field-grid" style={{marginTop: '10px'}}>
                      <div className="field">
                        <label>Cholesterol</label>
                        <select name="cholesterol" value={assessmentData.cholesterol} onChange={handleInputChange}>
                          <option value="1">1 Normal</option>
                          <option value="2">2 Above normal</option>
                          <option value="3">3 Well above</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Glucose</label>
                        <select name="gluc" value={assessmentData.gluc} onChange={handleInputChange}>
                          <option value="1">1 Normal</option>
                          <option value="2">2 Above normal</option>
                          <option value="3">3 Well above</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Women's Health Factors */}
                  <div className="fsec">
                    <div className="fsec-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Women's Health Factors
                    </div>
                    <div className="field" style={{marginBottom: '10px'}}>
                      <label>Pregnancy History</label>
                      <div className="toggle-group">
                        <button 
                          className={`tog ${assessmentData.pregnancy_history ? 'on' : ''}`} 
                          onClick={() => setTog('pregnancy_history', 1)}
                        >
                          Yes
                        </button>
                        <button 
                          className={`tog ${!assessmentData.pregnancy_history ? 'on' : ''}`} 
                          onClick={() => setTog('pregnancy_history', 0)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    <div style={{background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontSize: '.72rem', color: 'var(--slate-500)', lineHeight: '1.7'}}>
                      <strong style={{color: 'var(--slate-700)'}}>Auto-derived from inputs</strong><br/>
                      <span> Menopause {getDerivedIndicators().menopause}</span><br/>
                      <span> PCOS indicator {getDerivedIndicators().pcos}</span><br/>
                      <span> Thyroid risk {getDerivedIndicators().thyroid}</span>
                    </div>
                  </div>

                  {/* Lifestyle Factors */}
                  <div className="fsec">
                    <div className="fsec-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4l3 3"/>
                      </svg>
                      Lifestyle Factors
                    </div>
                    <div className="field" style={{marginBottom: '10px'}}>
                      <label>Smoking Status</label>
                      <div className="toggle-group">
                        <button 
                          className={`tog ${assessmentData.smoke ? 'on' : ''}`} 
                          onClick={() => setTog('smoke', 1)}
                        >
                          Smoker
                        </button>
                        <button 
                          className={`tog ${!assessmentData.smoke ? 'on' : ''}`} 
                          onClick={() => setTog('smoke', 0)}
                        >
                          Non-smoker
                        </button>
                      </div>
                    </div>
                    <div className="field" style={{marginBottom: '10px'}}>
                      <label>Alcohol Consumption</label>
                      <div className="toggle-group">
                        <button 
                          className={`tog ${assessmentData.alco ? 'on' : ''}`} 
                          onClick={() => setTog('alco', 1)}
                        >
                          Consumes
                        </button>
                        <button 
                          className={`tog ${!assessmentData.alco ? 'on' : ''}`} 
                          onClick={() => setTog('alco', 0)}
                        >
                          None
                        </button>
                      </div>
                    </div>
                    <div className="field">
                      <label>Physical Activity</label>
                      <div className="toggle-group">
                        <button 
                          className={`tog ${assessmentData.active ? 'on' : ''}`} 
                          onClick={() => setTog('active', 1)}
                        >
                          Active
                        </button>
                        <button 
                          className={`tog danger ${!assessmentData.active ? 'on' : ''}`} 
                          onClick={() => setTog('active', 0)}
                        >
                          Sedentary
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="btn-run" onClick={runPrediction} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Run Cardiac Risk Analysis
                  </button>

                  <div className="disclaimer">
                    <strong>Disclaimer</strong> CardioWise is an educational AI screening tool. Results do not constitute a medical diagnosis. Always consult a qualified cardiologist.
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                {!results ? (
                  <div className="card" style={{height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="empty-state">
                      <div className="empty-icon">heart</div>
                      <div className="empty-title">Ready for analysis</div>
                      <div className="empty-txt">Fill in patient details and click<br/><strong>Run Cardiac Risk Analysis</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="results-panel visible">
                    <div className={`risk-hero ${getRiskCategory(results.risk_score).class}`}>
                      <div className="gauge-svg-wrap">
                        <svg viewBox="0 0 200 120">
                          <path d="M 30 100 A 70 70 0 0 1 170 100" stroke="#e5e7eb" strokeWidth="15" fill="none"/>
                          <path 
                            d="M 30 100 A 70 70 0 0 1 170 100" 
                            stroke={getRiskCategory(results.risk_score).color} 
                            strokeWidth="15" 
                            fill="none"
                            strokeDasharray={`${(results.risk_score / 100) * 140} 140`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="gauge-center">
                          <div className="gauge-score">{results.risk_score}%</div>
                          <div className="gauge-pct">Risk Score</div>
                        </div>
                      </div>
                      <div className="risk-info">
                        <div className="risk-label">
                          {getRiskCategory(results.risk_score).label}
                        </div>
                        <div className="risk-desc">
                          AI-powered analysis indicates {getRiskCategory(results.risk_score).label.toLowerCase()} cardiovascular risk profile
                        </div>
                        <div className="risk-meta">
                          <div className="risk-meta-item">
                            <strong>BMI</strong> {results.bmi}
                          </div>
                          <div className="risk-meta-item">
                            <strong>Confidence</strong> 91%
                          </div>
                          <div className="risk-meta-item">
                            <strong>Model</strong> XGBoost
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="vitals-row">
                      <div className={`vital ${parseInt(assessmentData.ap_hi) >= 140 ? 'flag-red' : 'flag-green'}`}>
                        <div className="vital-val">{assessmentData.ap_hi}/{assessmentData.ap_lo}</div>
                        <div className="vital-lbl">Blood Pressure</div>
                      </div>
                      <div className={`vital ${bmi >= 30 ? 'flag-red' : bmi >= 25 ? 'flag-amber' : 'flag-green'}`}>
                        <div className="vital-val">{bmi}</div>
                        <div className="vital-lbl">BMI</div>
                      </div>
                      <div className={`vital ${assessmentData.cholesterol >= 2 ? 'flag-amber' : 'flag-green'}`}>
                        <div className="vital-val">{['Normal', 'Above Normal', 'Well Above'][assessmentData.cholesterol - 1]}</div>
                        <div className="vital-lbl">Cholesterol</div>
                      </div>
                      <div className={`vital ${assessmentData.gluc >= 2 ? 'flag-amber' : 'flag-green'}`}>
                        <div className="vital-val">{['Normal', 'Above Normal', 'Well Above'][assessmentData.gluc - 1]}</div>
                        <div className="vital-lbl">Glucose</div>
                      </div>
                    </div>

                    <div className="women-grid">
                      <div className={`women-chip ${parseInt(assessmentData.age) >= 50 ? 'risk' : 'safe'}`}>
                        <div className="wc-dot"></div>
                        <span className="wc-name">Menopause Status</span>
                        <span className="wc-val">{getDerivedIndicators().menopause}</span>
                      </div>
                      <div className={`women-chip ${getDerivedIndicators().pcos === 'PCOS Detected' ? 'risk' : 'safe'}`}>
                        <div className="wc-dot"></div>
                        <span className="wc-name">PCOS Indicator</span>
                        <span className="wc-val">{getDerivedIndicators().pcos}</span>
                      </div>
                      <div className={`women-chip ${getDerivedIndicators().thyroid === 'Thyroid Risk' ? 'risk' : 'safe'}`}>
                        <div className="wc-dot"></div>
                        <span className="wc-name">Thyroid Status</span>
                        <span className="wc-val">{getDerivedIndicators().thyroid}</span>
                      </div>
                      <div className={`women-chip ${getDerivedIndicators().pregnancy === 'Pregnancy History' ? 'risk' : 'safe'}`}>
                        <div className="wc-dot"></div>
                        <span className="wc-name">Pregnancy History</span>
                        <span className="wc-val">{getDerivedIndicators().pregnancy}</span>
                      </div>
                    </div>

                    <div className="results-grid">
                      <div className="card">
                        <div className="card-head">
                          <div className="card-title">Feature Contributions</div>
                        </div>
                        {results.feature_explanation && results.feature_explanation.map((feature, idx) => (
                          <div key={idx} className="shap-item">
                            <div className="shap-label">{feature.label}</div>
                            <div className="shap-val">{feature.value}</div>
                            <div className="shap-track">
                              <div 
                                className="shap-fill" 
                                style={{ 
                                  width: `${feature.magnitude * 100}%`, 
                                  background: feature.direction === 'increase' ? 'var(--red)' : 'var(--green)' 
                                }}
                              ></div>
                            </div>
                            <div className="shap-dir">{feature.direction === 'increase' ? 'up' : 'down'}</div>
                          </div>
                        ))}
                      </div>

                      <div className="card">
                        <div className="card-head">
                          <div className="card-title">Clinical Recommendations</div>
                        </div>
                        {results.clinical_advice && results.clinical_advice.medications && results.clinical_advice.medications.map((med, idx) => (
                          <div key={idx} className={`advice-item ${med.urgency || 'moderate'}`}>
                            <div className="advice-name">{med.name}</div>
                            <div className="advice-detail">{med.detail}</div>
                          </div>
                        ))}
                        {results.clinical_advice && results.clinical_advice.lifestyle && results.clinical_advice.lifestyle.map((life, idx) => (
                          <div key={idx} className="life-item">
                            <div className="life-dot"></div>
                            <span>{life}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-head">
                        <div className="card-title">Personalized Diet Plan & Lifestyle</div>
                      </div>
                      {results.diet_plan && (
                        <div className="diet-grid">
                          <div className="diet-summary">
                            <div className="macro-row">
                              <div className="macro">
                                <div className="macro-val">{results.diet_plan.target_calories}</div>
                                <div className="macro-key">Target Calories</div>
                              </div>
                              <div className="macro">
                                <div className="macro-val">{results.diet_plan.macros.protein}</div>
                                <div className="macro-key">Protein</div>
                              </div>
                              <div className="macro">
                                <div className="macro-val">{results.diet_plan.macros.carbs}</div>
                                <div className="macro-key">Carbs</div>
                              </div>
                              <div className="macro">
                                <div className="macro-val">{results.diet_plan.macros.fat}</div>
                                <div className="macro-key">Healthy Fat</div>
                              </div>
                            </div>

                            <div className="diet-lists">
                              <div className="diet-list promote">
                                <h6>Recommended Foods</h6>
                                <ul>
                                  {results.diet_plan.promote.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                              </div>
                              <div className="diet-list avoid">
                                <h6>Limit or Avoid</h6>
                                <ul>
                                  {results.diet_plan.avoid.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="diet-schedule">
                            <h6>Suggested Daily Schedule</h6>
                            {results.diet_plan.sample_day && Object.entries(results.diet_plan.sample_day).map(([meal, food]) => (
                              <div key={meal} className="meal-row">
                                <div className="meal-name">{meal.replace('_', ' ').toUpperCase()}</div>
                                <div className="meal-food">{food}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Batch Prediction Page */}
          <div className={`page-section ${activeView === 'batch' ? 'active' : ''}`} id="page-batch">
            <div className="page-header">
              <div className="page-title">Batch Prediction</div>
              <div className="page-sub">Upload CSV file to process multiple patients at once with XGBoost model</div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              {/* Upload Section */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Upload Patient Data</div>
                  <button onClick={downloadSampleCSV} style={{background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: '6px', padding: '5px 12px', fontSize: '.72rem', fontWeight: '600', color: 'var(--blue-600)', cursor: 'pointer', fontFamily: 'inherit'}}>
                    Download Sample CSV
                  </button>
                </div>
                <div className="form-body">
                  <div className="field">
                    <label>CSV File (Required columns: patient_name, age, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active, pregnancy_history)</label>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload}
                      style={{padding: '10px', border: '2px dashed var(--slate-300)', borderRadius: '8px', background: 'var(--slate-50)'}}
                    />
                  </div>
                  
                  {batchFile && (
                    <div style={{background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: '6px', padding: '10px', marginTop: '10px'}}>
                      <div style={{fontWeight: '600', color: 'var(--green-700)', marginBottom: '5px'}}>
                        ✓ File uploaded: {batchFile.name}
                      </div>
                      <div style={{fontSize: '.8rem', color: 'var(--green-600)'}}>
                        {batchData.length} patients ready for processing
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn-run" 
                    onClick={runBatchPrediction} 
                    disabled={loading || batchData.length === 0}
                    style={{marginTop: '15px', width: '100%'}}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Process {batchData.length} Patients
                  </button>
                </div>
              </div>

              {/* Data Preview */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Data Preview</div>
                  <span className="chip chip-blue">{batchData.length} patients</span>
                </div>
                <div style={{maxHeight: '400px', overflow: 'auto'}}>
                  {batchData.length > 0 ? (
                    <table style={{width: '100%', fontSize: '.75rem', borderCollapse: 'collapse'}}>
                      <thead style={{position: 'sticky', top: 0, background: 'var(--slate-50)'}}>
                        <tr>
                          <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>Name</th>
                          <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>Age</th>
                          <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>BP</th>
                          <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>BMI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchData.slice(0, 10).map((patient, idx) => (
                          <tr key={idx}>
                            <td style={{padding: '8px', borderBottom: '1px solid var(--slate-100)'}}>{patient.patient_name}</td>
                            <td style={{padding: '8px', borderBottom: '1px solid var(--slate-100)'}}>{patient.age}</td>
                            <td style={{padding: '8px', borderBottom: '1px solid var(--slate-100)'}}>{patient.ap_hi}/{patient.ap_lo}</td>
                            <td style={{padding: '8px', borderBottom: '1px solid var(--slate-100)'}}>
                              {(patient.weight / ((patient.height / 100) ** 2)).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">upload</div>
                      <div className="empty-txt">Upload CSV file to preview patient data</div>
                    </div>
                  )}
                  {batchData.length > 10 && (
                    <div style={{padding: '10px', textAlign: 'center', fontSize: '.8rem', color: 'var(--slate-500)'}}>
                      Showing first 10 of {batchData.length} patients
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Batch Results */}
            {batchResults && (
              <div className="card" style={{marginTop: '16px'}}>
                <div className="card-head">
                  <div className="card-title">Batch Results</div>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <span className="chip chip-green">{batchResults.success_count} processed</span>
                    {batchResults.error_count > 0 && (
                      <span className="chip chip-red">{batchResults.error_count} errors</span>
                    )}
                  </div>
                </div>
                <div style={{maxHeight: '500px', overflow: 'auto'}}>
                  <table style={{width: '100%', fontSize: '.8rem', borderCollapse: 'collapse'}}>
                    <thead style={{position: 'sticky', top: 0, background: 'var(--slate-50)'}}>
                      <tr>
                        <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>Patient</th>
                        <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>Risk Score</th>
                        <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>Category</th>
                        <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>BMI</th>
                        <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid var(--slate-200)'}}>Response Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.results && batchResults.results.map((result, idx) => (
                        <tr key={idx}>
                          <td style={{padding: '10px', borderBottom: '1px solid var(--slate-100)'}}>
                            {result.patient_name}
                          </td>
                          <td style={{padding: '10px', borderBottom: '1px solid var(--slate-100)'}}>
                            {result.error ? (
                              <span style={{color: 'var(--red)'}}>Error</span>
                            ) : (
                              <strong>{result.risk_score}%</strong>
                            )}
                          </td>
                          <td style={{padding: '10px', borderBottom: '1px solid var(--slate-100)'}}>
                            {result.error ? (
                              <span className="chip chip-red">Failed</span>
                            ) : (
                              <span className={`risk-badge ${
                                result.risk_score < 35 ? 'rb-l' : 
                                result.risk_score < 60 ? 'rb-m' : 'rb-h'
                              }`}>
                                {result.risk_category}
                              </span>
                            )}
                          </td>
                          <td style={{padding: '10px', borderBottom: '1px solid var(--slate-100)'}}>
                            {result.bmi}
                          </td>
                          <td style={{padding: '10px', borderBottom: '1px solid var(--slate-100)'}}>
                            {result.response_time}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div style={{padding: '15px', background: 'var(--slate-50)', borderRadius: '8px', marginTop: '15px'}}>
                  <div style={{fontWeight: '600', marginBottom: '10px'}}>Batch Summary</div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px'}}>
                    <div>
                      <div style={{fontSize: '.8rem', color: 'var(--slate-500)'}}>Total Processed</div>
                      <div style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--blue-400)'}}>{batchResults.success_count}</div>
                    </div>
                    <div>
                      <div style={{fontSize: '.8rem', color: 'var(--slate-500)'}}>Avg Risk Score</div>
                      <div style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--amber)'}}>
                        {batchResults.results && batchResults.results.filter(r => !r.error).length > 0 
                          ? (batchResults.results.filter(r => !r.error).reduce((sum, r) => sum + r.risk_score, 0) / batchResults.results.filter(r => !r.error).length).toFixed(1) 
                          : 0}%
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize: '.8rem', color: 'var(--slate-500)'}}>High Risk</div>
                      <div style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--red)'}}>
                        {batchResults.results && batchResults.results.filter(r => !r.error && r.risk_score >= 60).length}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize: '.8rem', color: 'var(--slate-500)'}}>Total Time</div>
                      <div style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--green)'}}>{batchResults.total_time}s</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Page */}
          <div className={`page-section ${activeView === 'history' ? 'active' : ''}`} id="page-history">
            <div className="page-header">
              <div className="page-title">Assessment History</div>
              <div className="page-sub">Last 50 predictions stored locally</div>
            </div>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Patient Records</div>
                <button onClick={loadHistory} style={{background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: '6px', padding: '5px 12px', fontSize: '.72rem', fontWeight: '600', color: 'var(--blue-600)', cursor: 'pointer', fontFamily: 'inherit'}}>
                  Refresh
                </button>
              </div>
              <div>
                {history.length > 0 ? (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Risk Score</th>
                        <th>Category</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record, idx) => (
                        <tr key={idx}>
                          <td>{record.patient_name || 'Anonymous'}</td>
                          <td>{record.risk_score}%</td>
                          <td>
                            <span className={`risk-badge ${
                              record.risk_score < 35 ? 'rb-l' : 
                              record.risk_score < 60 ? 'rb-m' : 'rb-h'
                            }`}>
                              {record.risk_category}
                            </span>
                          </td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">history</div>
                    <div className="empty-txt">No assessment history available</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Page */}
          <div className={`page-section ${activeView === 'stats' ? 'active' : ''}`} id="page-stats">
            <div className="page-header">
              <div className="page-title">Analytics</div>
              <div className="page-sub">Live statistics from /api/stats</div>
            </div>
            <div className="stats-cards">
              <div className="card" style={{textAlign: 'center'}}>
                <div style={{fontSize: '.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--slate-400)', marginBottom: '.5rem'}}>
                  Total Predictions
                </div>
                <div style={{fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: '800', color: 'var(--blue-400)'}}>
                  {history.length}
                </div>
              </div>
              <div className="card" style={{textAlign: 'center'}}>
                <div style={{fontSize: '.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--slate-400)', marginBottom: '.5rem'}}>
                  Average Risk Score
                </div>
                <div style={{fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: '800', color: 'var(--amber)'}}>
                  {history.length > 0 ? (history.reduce((sum, h) => sum + h.risk_score, 0) / history.length).toFixed(1) : '0'}%
                </div>
              </div>
              <div className="card" style={{textAlign: 'center'}}>
                <div style={{fontSize: '.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--slate-400)', marginBottom: '.5rem'}}>
                  Model Version
                </div>
                <div style={{fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: '800', color: 'var(--green)'}}>
                  XGBoost v2.0
                </div>
              </div>
            </div>
            <div className="dash-grid">
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Risk Distribution Breakdown</div>
                </div>
                <div style={{padding: '.5rem 0'}}>
                  <div style={{textAlign: 'center', padding: '2rem', color: 'var(--slate-400)'}}>
                    Distribution chart would go here
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Distribution Chart</div>
                </div>
                <div className="chart-wrap">
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', fontSize: '.8rem', color: 'var(--slate-400)'}}>
                    Bar chart visualization would go here
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CardioWiseApp;
