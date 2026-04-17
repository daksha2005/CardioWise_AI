import os
import numpy as np
import pickle
import joblib
from datetime import datetime

FEATURES = [
    'age','height','weight','ap_hi','ap_lo',
    'cholesterol','gluc','smoke','alco','active',
    'BMI','is_menopausal','has_pcos',
    'has_thyroid_issue','pregnancy_history'
]

_model = None
_scaler = None

def load_ml():
    global _model, _scaler
    model_path = os.environ.get("MODEL_PATH", "models/heart_prediction_women_xgb.pkl")
    scaler_path = os.environ.get("SCALER_PATH", "models/scaler_final.pkl")
    try:
        _model = joblib.load(model_path)
        _scaler = joblib.load(scaler_path)
        print("✅ ML Models loaded successfully")
    except Exception as e:
        print(f"⚠️  ML Model not found ({e}), using simulated predictions")
        _model = None
        _scaler = None

def simulate_prediction(data: dict) -> float:
    """Fallback rule-based risk score when model not available"""
    score = 0.0
    if data['ap_hi'] >= 140 or data['ap_lo'] >= 90: score += 0.25
    if data['ap_hi'] >= 160: score += 0.15
    if data['cholesterol'] == 2: score += 0.15
    if data['cholesterol'] == 3: score += 0.25
    if data['gluc'] == 2: score += 0.10
    if data['gluc'] == 3: score += 0.18
    if data['BMI'] >= 30: score += 0.12
    if data['BMI'] >= 35: score += 0.10
    if data['smoke'] == 1: score += 0.15
    if data['alco'] == 1: score += 0.07
    if data['active'] == 0: score += 0.08
    if data['is_menopausal'] == 1: score += 0.06
    if data['has_pcos'] == 1: score += 0.10
    if data['has_thyroid_issue'] == 1: score += 0.08
    return min(score, 0.97)

def predict_risk(data: dict):
    """Main prediction function"""
    load_ml()  # Ensure models are loaded
    
    # Calculate derived features
    age = data.get('age', 40)
    height = data.get('height', 165)
    weight = data.get('weight', 65)
    ap_hi = data.get('ap_hi', 120)
    ap_lo = data.get('ap_lo', 80)
    cholesterol = data.get('cholesterol', 1)
    gluc = data.get('gluc', 1)
    smoke = data.get('smoke', 0)
    alco = data.get('alco', 0)
    active = data.get('active', 1)
    pregnancy_history = data.get('pregnancy_history', 0)
    
    bmi = round(weight / ((height / 100) ** 2), 2)
    is_menopausal = 1 if age >= 50 else 0
    has_pcos = 1 if (gluc > 1 and active == 0 and age <= 40) else 0
    has_thyroid_issue = 1 if (ap_hi > 140 and bmi > 30) else 0
    
    input_data = {
        'age': age, 'height': height, 'weight': weight,
        'ap_hi': ap_hi, 'ap_lo': ap_lo, 'cholesterol': cholesterol,
        'gluc': gluc, 'smoke': smoke, 'alco': alco, 'active': active,
        'BMI': bmi, 'is_menopausal': is_menopausal, 'has_pcos': has_pcos,
        'has_thyroid_issue': has_thyroid_issue, 'pregnancy_history': pregnancy_history
    }
    
    prob = None
    if _model and _scaler:
        try:
            import pandas as pd
            row = pd.DataFrame([[input_data[f] for f in FEATURES]], columns=FEATURES)
            scaled = _scaler.transform(row)
            prob = float(_model.predict_proba(scaled)[0][1])
        except Exception as e:
            print(f"Prediction error: {e}")
    
    if prob is None:
        prob = simulate_prediction(input_data)
    
    # Classify risk
    if prob > 45:
        risk_level = "HIGH"
    elif prob > 20:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"
    
    # Generate recommendations
    recommendations = generate_recommendations(input_data, prob)
    
    # Feature importances (simplified for demo)
    feature_importances = {
        "Blood Pressure": 0.25,
        "Age": 0.20,
        "Cholesterol": 0.15,
        "BMI": 0.12,
        "Smoking": 0.10,
        "Glucose": 0.08,
        "Physical Activity": 0.06,
        "Women's Factors": 0.04
    }
    
    return {
        "risk_score": round(prob * 100, 2),
        "risk_level": risk_level,
        "bmi": bmi,
        "is_menopausal": is_menopausal,
        "has_pcos": has_pcos,
        "has_thyroid_issue": has_thyroid_issue,
        "recommendations": recommendations,
        "feature_importances": feature_importances,
        "input_features": input_data
    }

def generate_recommendations(data: dict, prob: float) -> dict:
    """Generate clinical recommendations"""
    meds = []
    lifestyle = []
    followup = []

    if data['ap_hi'] >= 140 or data['ap_lo'] >= 90:
        meds.append("Antihypertensives (ACE Inhibitors or Beta-Blockers)")
    if data['cholesterol'] >= 2:
        meds.append("Statin Therapy (manage LDL/arterial plaque)")
    if data['gluc'] > 1:
        meds.append("Glucose Management — Metformin if insulin resistant")
    if prob > 45:
        meds.append("Low-dose Aspirin (consult Cardiologist)")

    if data['BMI'] >= 30:
        lifestyle.append("Weight management & DASH/Mediterranean Diet")
    if data['smoke'] == 1:
        lifestyle.append("IMMEDIATE Smoking Cessation Program")
    if data['active'] == 0:
        lifestyle.append("Begin 30 min daily moderate activity")
    if data['is_menopausal']:
        lifestyle.append("Hormone Support: Vitamin D, Calcium-rich diet")
    if not lifestyle:
        lifestyle.append("Maintain current healthy habits")

    if prob > 45:
        followup.append("Cardiac Stress Test within 30 days")
        followup.append("Echocardiogram screening recommended")
        followup.append("Monthly blood pressure monitoring")
    elif prob > 20:
        followup.append("Annual comprehensive metabolic panel")
        followup.append("Quarterly blood pressure checks")
    else:
        followup.append("Routine annual physical exam")
        followup.append("Biannual lipid screening")

    return {
        "medications": meds,
        "lifestyle": lifestyle,
        "followup": followup
    }
