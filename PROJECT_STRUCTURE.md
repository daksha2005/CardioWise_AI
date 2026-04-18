# CardioWise AI - Project Structure

```
cardiowise/
├── backend/                     # Python Flask API & ML Engine
│   ├── app.py                  # Core Flask API (Risk Analysis & History)
│   ├── ml_model.py             # ML prediction logic & feature engineering
│   ├── setup_models.py         # Script to initialize model files
│   ├── streamlit_app.py        # Streamlit Research & Clinical UI
│   ├── cardiowise.log          # Application execution logs
│   ├── requirements.txt         # Python backend dependencies
│   ├── models/                 # Serialized ML models
│   │   ├── heart_prediction_women_xgb.pkl  # Trained XGBoost model
│   │   ├── scaler_final.pkl                # Data normalization scaler
│   │   └── features_final.pkl              # Feature definition list
│   └── routes/                 # Modular API route handlers
│       ├── analytics.py        # Stats and data visualization logic
│       ├── auth.py             # Authentication endpoints (placeholder)
│       ├── predict.py          # Real-time risk prediction routes
│       └── reports.py          # Clinical report generation logic
├── database/                   # Data Persistence
│   └── predictions.db         # SQLite database for patient history
├── frontend/                   # Main React Interface (CRA-based)
│   ├── src/                    # React source code
│   │   ├── CardioWiseApp.jsx   # Primary dashboard component
│   │   ├── CardioWise.css      # Modern Glassmorphism styling
│   │   └── index.js            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json            # React dependencies & scripts
│   └── react-app/              # Alternative Webpack-based Build
│       ├── src/                # Source for webpack version
│       ├── webpack.config.js    # Custom build configuration
│       └── package.json        # Webpack build scripts
├── sample_data/                # Research Data
│   └── sample_batch_1-5.csv    # Simulated patient datasets for testing
├── cardio_train.csv            # Original training dataset
├── run_cardiowise.bat          # One-click Windows launch utility
├── PROJECT_STRUCTURE.md        # This file
├── README.md                   # Main documentation
└── Heart Disease Risk Prediction for Women using Machine Learning.ipynb # Research Notebook
```

## 📁 Folder Responsibilities

### **backend/** 
- **Flask API**: RESTful endpoints for real-time risk assessment.
- **ML Engine**: XGBoost integration with gender-specific health markers.
- **Clinical Advisory**: Logic for generating medication and lifestyle advice.
- **Analytics**: Processing patient population data for trends.
- **Streamlit**: Rapid research interface for clinicians.

### **frontend/**
- **Premium Dashboard**: Professional React-based UI with glassmorphism design.
- **Data Visualization**: Interactive charts for risk factor contribution.
- **Clinical Reports**: Frontend logic for displaying and exporting assessments.
- **React-App Submodule**: Custom webpack configuration for optimized builds.

### **database/**
- **Patient History**: Secure SQLite storage for all clinical assessments.
- **Performance Tracking**: Monitoring API response times and accuracy.

### **sample_data/**
- **Batch Processing**: CSV files for testing bulk prediction endpoints.

## 🚀 Running the Application

### **1. Automatic Launch (Windows)**
Double-click `run_cardiowise.bat` in the root folder.

### **2. Manual Backend Launch**
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```

### **3. Manual Frontend Launch**
```bash
cd frontend
npm install
npm start
```

## 🔧 Architecture Principles

- **Separation of Concerns**: Decoupled Flask backend and React frontend.
- **Gender-Centric Design**: Features specifically engineered for women's physiology.
- **Explainability (XAI)**: Integrated feature contribution analysis for transparency.
- **Production Ready**: Optimized for scalability with logging and persistent storage.
