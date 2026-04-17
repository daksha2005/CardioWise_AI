# CardioWise AI - Project Structure

```
cardiowise/
├── backend/                     # Flask API & ML Backend
│   ├── app.py                  # Original Flask application
│   ├── app_enhanced.py         # Premium version with SHAP
│   ├── streamlit_app.py        # Streamlit dashboard
│   ├── models/                 # ML model files
│   │   ├── heart_prediction_women_xgb.pkl
│   │   ├── scaler_final.pkl
│   │   └── features_final.pkl
│   ├── requirements.txt         # Python dependencies
│   └── setup_models.py        # Model setup helper
├── frontend/                   # Web Interface
│   ├── index.html             # Premium medical dashboard
│   ├── static/                # CSS, JS, assets
│   └── templates/             # HTML templates
├── database/                   # Data Storage
│   └── predictions.db         # SQLite database
├── README_PREMIUM.md          # Premium documentation
└── PROJECT_STRUCTURE.md        # This file
```

## 📁 Folder Responsibilities

### **Backend/** 
- Flask API server with CORS support
- XGBoost ML model integration
- SHAP explainability engine
- Clinical advisory system
- Database operations
- Model loading and management

### **Frontend/**
- Premium medical dashboard UI
- Glassmorphism design system
- Interactive forms and visualizations
- Chart.js and Plotly integration
- Responsive mobile-first design
- Real-time API communication

### **Database/**
- SQLite database for patient history
- Prediction tracking and analytics
- SHAP explanation storage
- Clinical data persistence

## 🚀 Running the Application

```bash
# Start Premium Backend
cd backend
python app_enhanced.py

# Access at: http://localhost:5000
```

## 📊 Key Features by Component

- **Backend**: AI predictions, SHAP explanations, clinical advice
- **Frontend**: Premium UI, real-time forms, interactive charts
- **Database**: Persistent storage, history tracking, analytics

## 🔧 Clean Architecture

- **Separation of Concerns**: Clear frontend/backend distinction
- **No Duplicates**: Removed archive and redundant files
- **Organized Structure**: Logical grouping by functionality
- **Production Ready**: Scalable and maintainable codebase
