# CardioWise AI: Advanced Heart Disease Risk Prediction for Women

![CardioWise Banner](https://img.shields.io/badge/CardioWise-AI--Powered-blue?style=for-the-badge&logo=heart)
![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Flask%20%7C%20XGBoost-9cf?style=for-the-badge)

CardioWise AI is a next-generation clinical decision support system designed specifically to assess cardiovascular risk in women. By integrating state-of-the-art **XGBoost machine learning** with gender-specific clinical indicators (Menopause status, PCOS indicators, Pregnancy history, and Thyroid risk), CardioWise provides a 360-degree view of heart health.

## 🚀 Key Features

- **Gender-Specific Risk Assessment**: Incorporates hormonal and reproductive health indicators often overlooked in traditional heart risk calculators.
- **Premium Clinical Dashboard**: A sleek, high-performance React interface for individual patient screening.
- **Batch Processing**: Upload CSV datasets to process multiple patient records simultaneously for population health research.
- **AI-Powered Insights**: Feature importance visualizations to show patients exactly which factors are impacting their risk scores.
- **Personalized Clinical Reports**: Generates automated intervention protocols, medication advice, and Mediterranean-style diet plans.
- **Analytics & History**: Track patient risk trends and application performance over time.

## 🛠️ Technology Stack

- **Frontend**: React 18, CSS3 (Modern Glassmorphism & SaaS Aesthetics).
- **Backend**: Python 3.9+, Flask (API Services).
- **Machine Learning**: XGBoost (Classifier), Scikit-Learn (Pipelines & Scalers), Joblib.
- **Alternative UI**: Streamlit (Lightweight data-centric dashboard).
- **Database**: SQLite3 (Historical data persistence).

## 📂 Project Structure

```text
cardiowise/
├── backend/                # Flask API & ML Pipeline
│   ├── app.py              # Main Flask server & API logic
│   ├── ml_model.py         # Model loading & inference wrapper
│   ├── models/             # Trained .pkl models and scalers
│   └── streamlit_app.py    # Alternative Streamlit dashboard
├── frontend/               # React Application
│   ├── src/
│   │   ├── CardioWiseApp.jsx  # Main Dashboard Component
│   │   └── CardioWise.css     # Premium UI styling
│   └── public/
├── database/               # SQLite storage
└── README.md
```

## 🚥 Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Server runs on: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm dev
```

### 3. Alternative Dashboard (Streamlit)
```bash
streamlit run backend/streamlit_app.py
```

## 📊 Model Performance
The XGBoost model was trained on a large cardiovascular dataset with balanced classes, achieving high accuracy and sensitivity for women's risk profiles.

- **Model Type**: XGBoost Classifier
- **Confidence Level**: 91%
- **Clinical Derivations**: Menopause (Age-based), PCOS (Age/BMI/Glucose-based), Thyroid (BP/BMI-based).

## 🛡️ Medical Disclaimer
CardioWise is an educational AI screening tool. Results do not constitute a medical diagnosis. Always consult a qualified cardiologist for clinical decisions.

---
© 2026 CardioWise AI Research. All rights reserved.
