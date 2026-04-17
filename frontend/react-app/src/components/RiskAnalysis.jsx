import React, { useState } from 'react';
import { apiService } from '../services/api';

const RiskAnalysis = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(false);
  const [bmi, setBmi] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    if (weight && height) {
      const heightInMeters = height / 100;
      const calculatedBmi = weight / (heightInMeters * heightInMeters);
      setBmi(calculatedBmi.toFixed(1));
    }
  };

  React.useEffect(() => {
    calculateBMI();
  }, [formData.weight, formData.height]);

  const loadSampleData = () => {
    setFormData({
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
    setFormData({
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
    setBmi(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await apiService.predict(formData);
      setResults(result);
      onSuccess();
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const getRiskColor = (score) => {
    if (score < 35) return 'text-green-600';
    if (score < 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="premium-card">
        <div className="bg-gradient-to-r from-cardiowise-blue-700 to-cardiowise-blue-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-space text-white">Patient Input</h2>
              <p className="text-cardiowise-blue-100 text-sm mt-1">All fields required for accurate prediction</p>
            </div>
            <div className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
              XGBoost · SHAP
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={loadSampleData}
              className="btn-secondary"
            >
              Load sample patient
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200 flex items-center">
              <i className="fas fa-user mr-2 text-cardiowise-blue-500"></i>
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Patient Name</label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Priya Sharma"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    placeholder="45"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="100"
                    max="250"
                    placeholder="162"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="30"
                    max="300"
                    step="0.1"
                    placeholder="65"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">BMI (auto)</label>
                  <div className="input-field bg-slate-50 text-slate-500">
                    {bmi || '---'}
                  </div>
                </div>
              </div>

              {bmi > 0 && (
                <div className="bg-gradient-to-r from-cardiowise-blue-50 to-blue-50 border border-cardiowise-blue-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold font-space text-cardiowise-blue-600">{bmi}</div>
                      <div className="text-sm text-cardiowise-blue-500 font-medium">
                        {bmi >= 30 ? '(Obese)' : bmi >= 25 ? '(Overweight)' : '(Normal)'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      weight / height²<br/>(kg/m²)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Vitals */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200 flex items-center">
              <i className="fas fa-heartbeat mr-2 text-cardiowise-blue-500"></i>
              Clinical Vitals
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    name="ap_hi"
                    value={formData.ap_hi}
                    onChange={handleInputChange}
                    min="70"
                    max="250"
                    placeholder="120"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    name="ap_lo"
                    value={formData.ap_lo}
                    onChange={handleInputChange}
                    min="40"
                    max="150"
                    placeholder="80"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Cholesterol</label>
                  <select
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="1">1 Normal</option>
                    <option value="2">2 Above normal</option>
                    <option value="3">3 Well above</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Glucose</label>
                  <select
                    name="gluc"
                    value={formData.gluc}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="1">1 Normal</option>
                    <option value="2">2 Above normal</option>
                    <option value="3">3 Well above</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Women's Health Factors */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200 flex items-center">
              <i className="fas fa-venus mr-2 text-cardiowise-blue-500"></i>
              Women's Health Factors
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Pregnancy History</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pregnancy_history: true }))}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                      formData.pregnancy_history
                        ? 'border-cardiowise-blue-400 bg-cardiowise-blue-50 text-cardiowise-blue-600'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pregnancy_history: false }))}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                      !formData.pregnancy_history
                        ? 'border-cardiowise-blue-400 bg-cardiowise-blue-50 text-cardiowise-blue-600'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="smoke"
                    checked={formData.smoke}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cardiowise-blue-600 border-slate-300 rounded focus:ring-cardiowise-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-slate-700">Smoking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="alco"
                    checked={formData.alco}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cardiowise-blue-600 border-slate-300 rounded focus:ring-cardiowise-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-slate-700">Alcohol Consumption</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cardiowise-blue-600 border-slate-300 rounded focus:ring-cardiowise-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-slate-700">Physically Active</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-heart mr-2"></i>
                Run Risk Analysis
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {results ? (
          <>
            {/* Risk Score Card */}
            <div className={`premium-card p-6 border-2 ${getRiskLevelClass(results.risk_score)}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-space mb-2">
                    Risk Score: <span className={getRiskColor(results.risk_score)}>{results.risk_score}%</span>
                  </h3>
                  <div className={`text-lg font-semibold ${getRiskLevelClass(results.risk_score)}`}>
                    {getRiskLevelLabel(results.risk_score)}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    BMI: {results.bmi} kg/m²
                  </div>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - results.risk_score / 100)}`}
                      className={getRiskColor(results.risk_score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getRiskColor(results.risk_score)}`}>
                      {results.risk_score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="premium-card p-6">
              <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="metric-card">
                  <div className="text-lg font-bold text-slate-900">{results.processed_features?.ap_hi}/{results.processed_features?.ap_lo}</div>
                  <div className="text-sm text-slate-500">Blood Pressure (mmHg)</div>
                </div>
                <div className="metric-card">
                  <div className="text-lg font-bold text-slate-900">{results.bmi}</div>
                  <div className="text-sm text-slate-500">BMI (kg/m²)</div>
                </div>
                <div className="metric-card">
                  <div className="text-lg font-bold text-slate-900">{results.risk_score}%</div>
                  <div className="text-sm text-slate-500">Risk Score</div>
                </div>
                <div className="metric-card">
                  <div className="text-lg font-bold text-slate-900">{results.risk_category?.label}</div>
                  <div className="text-sm text-slate-500">Risk Level</div>
                </div>
              </div>
            </div>

            {/* Clinical Advice */}
            {results.clinical_advice && (
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Clinical Recommendations</h3>
                <div className="space-y-3">
                  {results.clinical_advice.urgent?.map((advice, index) => (
                    <div key={index} className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                      <div className="font-medium text-red-800">{advice}</div>
                    </div>
                  ))}
                  {results.clinical_advice.moderate?.map((advice, index) => (
                    <div key={index} className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                      <div className="font-medium text-amber-800">{advice}</div>
                    </div>
                  ))}
                  {results.clinical_advice.lifestyle?.map((advice, index) => (
                    <div key={index} className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                      <div className="font-medium text-green-800">{advice}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diet Plan */}
            {results.diet_plan && (
              <div className="premium-card p-6">
                <h3 className="text-lg font-semibold font-space text-slate-900 mb-4">Personalized Diet Plan</h3>
                <div className="space-y-3">
                  {Object.entries(results.diet_plan).map(([category, foods], index) => (
                    <div key={index}>
                      <h4 className="font-medium text-slate-700 mb-2 capitalize">{category}</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {foods.map((food, foodIndex) => (
                          <li key={foodIndex}>{food}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="premium-card p-12 text-center">
            <i className="fas fa-heart text-6xl text-slate-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Analysis Yet</h3>
            <p className="text-slate-500">Complete the form and submit to see risk analysis results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysis;
