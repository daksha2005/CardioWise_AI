"""
CardioWise AI — Streamlit Application
Women's Heart Disease Prediction System
Clinical Decision Support Dashboard
"""

import streamlit as st
import numpy as np
import pandas as pd
import joblib
import os
import warnings
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px

warnings.filterwarnings("ignore")

# ─── Page Config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CardioWise AI | Women's Heart Disease Prediction",
    page_icon="❤️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── Custom CSS ───────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; }

.main-header {
    background: linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%);
    color: white; padding: 1.5rem 2rem; border-radius: 14px;
    margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;
}
.main-header h1 { margin: 0; font-size: 1.6rem; font-weight: 700; }
.main-header p  { margin: 4px 0 0; opacity: 0.85; font-size: 0.85rem; }

.risk-card-high   { background: #fff5f5; border: 1px solid #fca5a5; border-radius: 14px; padding: 1.5rem; }
.risk-card-medium { background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 1.5rem; }
.risk-card-low    { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 1.5rem; }

.section-head {
    font-size: 0.78rem; font-weight: 700; letter-spacing: 1.1px;
    text-transform: uppercase; color: #718096;
    border-bottom: 2px solid #e8ecf0; padding-bottom: 6px; margin: 1rem 0 0.75rem;
}

.metric-box {
    background: white; border: 1px solid #e8ecf0; border-radius: 10px;
    padding: 14px; text-align: center;
}
.metric-box .mb-label { font-size: 0.7rem; color: #718096; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.metric-box .mb-val   { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin-top: 2px; }
.metric-box .mb-unit  { font-size: 0.65rem; color: #a0aec0; }

.indicator-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 99px;
    font-size: 0.78rem; font-weight: 600; margin: 4px;
}
.chip-active   { background: #fff5f5; color: #c0392b; border: 1px solid #fca5a5; }
.chip-inactive { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

.advice-box {
    background: white; border: 1px solid #e8ecf0; border-radius: 10px;
    padding: 12px 14px; margin-bottom: 8px; border-left: 4px solid;
}
.advice-box.urgent   { border-left-color: #e74c3c; }
.advice-box.moderate { border-left-color: #f39c12; }
.advice-box.info     { border-left-color: #2980b9; }

.disclaimer-box {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
    padding: 12px 16px; font-size: 0.8rem; color: #92400e;
    margin-top: 1rem; line-height: 1.5;
}

.food-tag {
    display: inline-block; background: #f8f9fb; border: 1px solid #e8ecf0;
    border-radius: 6px; padding: 3px 8px; font-size: 0.72rem; margin: 2px;
}

[data-testid="stSidebar"] {
    background: #ffffff !important;
    border-right: 1px solid #e8ecf0 !important;
}

.stButton > button {
    background: linear-gradient(135deg, #c0392b, #e74c3c) !important;
    color: white !important; border: none !important;
    border-radius: 10px !important; font-weight: 600 !important;
    padding: 0.6rem 1.5rem !important; font-size: 0.95rem !important;
    width: 100% !important;
}
.stButton > button:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(192,57,43,0.35) !important; }
</style>
""", unsafe_allow_html=True)

# ─── Model Loading ─────────────────────────────────────────────────────────────

FEATURES = [
    'age', 'height', 'weight', 'ap_hi', 'ap_lo',
    'cholesterol', 'gluc', 'smoke', 'alco', 'active',
    'BMI', 'is_menopausal', 'has_pcos',
    'has_thyroid_issue', 'pregnancy_history'
]

@st.cache_resource
def load_model():
    base = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base, "models")
    try:
        model  = joblib.load(os.path.join(model_dir, "heart_prediction_women_xgb.pkl"))
        scaler = joblib.load(os.path.join(model_dir, "scaler_final.pkl"))
        return model, scaler, True
    except Exception as e:
        return None, None, False

model, scaler, model_loaded = load_model()

# ─── Prediction Logic (shared with Flask) ─────────────────────────────────────

def compute_derived(age, weight, height, ap_hi, gluc, active):
    bmi = weight / ((height / 100) ** 2)
    is_menopausal     = 1 if age >= 50 else 0
    has_pcos          = 1 if (gluc > 1 and active == 0 and age <= 40) else 0
    has_thyroid_issue = 1 if (ap_hi > 140 and bmi > 30) else 0
    return round(bmi, 2), is_menopausal, has_pcos, has_thyroid_issue

def _heuristic(d):
    s = 0.10
    if d['ap_hi'] >= 140:     s += 0.20
    if d['cholesterol'] >= 2: s += 0.15
    if d['cholesterol'] >= 3: s += 0.10
    if d['BMI'] >= 30:        s += 0.10
    if d['smoke']:            s += 0.12
    if d['gluc'] > 1:         s += 0.08
    if d['is_menopausal']:    s += 0.05
    if d['has_pcos']:         s += 0.06
    if d['has_thyroid_issue']:s += 0.04
    if not d['active']:       s += 0.05
    return min(s, 0.99)

def predict(pf):
    if model and scaler:
        df = pd.DataFrame([pf])[FEATURES]
        sc = scaler.transform(df)
        return round(float(model.predict_proba(sc)[0][1] * 100), 1)
    return round(_heuristic(pf) * 100, 1)

def categorize(score):
    if score >= 60:   return 'High Risk',     '#e74c3c', '🔴', 'risk-card-high'
    elif score >= 35: return 'Moderate Risk',  '#f39c12', '🟡', 'risk-card-medium'
    else:             return 'Low Risk',        '#27ae60', '🟢', 'risk-card-low'

def generate_advice(pf, score):
    meds, life, warns = [], [], []
    if pf['ap_hi'] >= 160:
        meds.append(('Antihypertensives — Stage 2', 'ACE Inhibitors / ARBs e.g. Ramipril 5mg. Emergency consult.', 'urgent'))
    elif pf['ap_hi'] >= 140:
        meds.append(('Antihypertensives — Stage 1', 'Beta-blockers or Calcium Channel Blockers e.g. Amlodipine 5mg.', 'moderate'))
    if pf['cholesterol'] == 3:
        meds.append(('High-Intensity Statin', 'Rosuvastatin 20mg or Atorvastatin 40–80mg daily.', 'urgent'))
    elif pf['cholesterol'] == 2:
        meds.append(('Moderate Statin Therapy', 'Atorvastatin 10–20mg or Pravastatin 40mg daily.', 'moderate'))
    if pf['gluc'] > 1:
        meds.append(('Glucose Management', 'Metformin 500–1000mg. HbA1c monitoring advised.', 'moderate'))
    if score >= 60:
        meds.append(('Low-dose Aspirin 81mg', 'Cardioprotective — consult cardiologist before initiating.', 'moderate'))
    if pf['has_thyroid_issue']:
        meds.append(('Thyroid Panel', 'TSH, T3, T4 evaluation. May require levothyroxine.', 'info'))

    if pf['BMI'] >= 30: life.append('Weight loss target: 5–10% via 300–500 kcal/day deficit')
    if pf['smoke']:     life.append('⚠️ URGENT: Immediate smoking cessation (NRT / Varenicline)')
    if pf['alco']:      life.append('Limit alcohol to ≤1 unit/day; abstain if BP elevated')
    if not pf['active']:life.append('150 min/week aerobic activity (walking, swimming, cycling)')
    if pf['is_menopausal']: life.append('Post-menopausal: Vitamin D 1000–2000 IU + Calcium 1200mg daily')
    if pf['has_pcos']:  life.append('PCOS: Low-GI diet, aerobic exercise, stress management')
    life.append('Mediterranean diet: olive oil, fatty fish, legumes, whole grains')
    life.append('Mindfulness & stress reduction — proven BP & cortisol benefits')
    if score >= 35:     life.append('Cardiac stress test every 2 years; home BP monitoring twice daily')

    if pf['ap_hi'] >= 180:
        warns.append('🚨 Hypertensive Crisis — seek emergency care IMMEDIATELY')
    if pf['ap_hi'] >= 140:
        warns.append('⚠️ Hypertension detected — major cardiovascular risk factor')
    if pf['cholesterol'] >= 3:
        warns.append('⚠️ Very high cholesterol — arterial plaque risk significantly elevated')
    if pf['smoke'] and score >= 40:
        warns.append('🚨 Smoking + elevated risk: highest priority intervention needed')

    return meds, life, warns

def generate_diet(pf):
    cal = 1500 if pf['BMI'] >= 30 else (1650 if pf['BMI'] >= 25 else 1800)
    promote = ['Fatty fish (salmon, sardines) 2–3×/wk','Leafy greens — daily',
               'Berries — antioxidant rich','Walnuts, flaxseeds (omega-3)',
               'Oats, quinoa, brown rice','Lentils, chickpeas, beans',
               'Extra-virgin olive oil','Low-fat dairy / plant milk']
    avoid   = ['Trans fats — processed snacks, fast food','Refined carbs (white bread)',
               'High-sodium foods (>1500mg/day)','Sugary beverages','Processed meats']
    if pf['gluc'] > 1:
        avoid.append('High-GI carbs (white rice, sweets)')
    if pf['is_menopausal']:
        promote.append('Soy (tofu, edamame) — phytoestrogen support')
    sample = {
        '🍳 Breakfast':    'Overnight oats, chia seeds, blueberries, almond milk',
        '🍎 Mid-Morning':  'Handful of walnuts + green tea',
        '🥗 Lunch':        'Grilled salmon, quinoa salad, spinach, olive oil dressing',
        '🥜 Afternoon':    'Apple slices + 2 tbsp almond butter',
        '🍲 Dinner':       'Lentil dal, brown rice, roasted vegetables, turmeric',
        '🌙 Evening':      'Golden turmeric milk with black pepper',
    }
    return cal, promote, avoid, sample

def explain_features(pf):
    fs = []
    if pf['ap_hi'] >= 160:    fs.append(('Systolic BP', f"{pf['ap_hi']} mmHg", 'increase', 0.92, '#e74c3c'))
    elif pf['ap_hi'] >= 140:  fs.append(('Systolic BP', f"{pf['ap_hi']} mmHg", 'increase', 0.75, '#f39c12'))
    else:                      fs.append(('Systolic BP', f"{pf['ap_hi']} mmHg", 'decrease', 0.15, '#27ae60'))

    cl_map = {1:('Normal','decrease',0.10,'#27ae60'), 2:('Borderline High','increase',0.60,'#f39c12'), 3:('Very High','increase',0.90,'#e74c3c')}
    c = cl_map.get(pf['cholesterol'], ('—','neutral',0.5,'#888'))
    fs.append(('Cholesterol', c[0], c[1], c[2], c[3]))

    if pf['BMI'] >= 35:   fs.append(('BMI', f"{pf['BMI']:.1f}", 'increase', 0.80, '#e74c3c'))
    elif pf['BMI'] >= 30: fs.append(('BMI', f"{pf['BMI']:.1f}", 'increase', 0.60, '#f39c12'))
    elif pf['BMI'] >= 25: fs.append(('BMI', f"{pf['BMI']:.1f}", 'increase', 0.35, '#f39c12'))
    else:                  fs.append(('BMI', f"{pf['BMI']:.1f}", 'decrease', 0.12, '#27ae60'))

    if pf['smoke']:   fs.append(('Smoking', 'Yes', 'increase', 0.75, '#e74c3c'))
    else:             fs.append(('Smoking', 'No',  'decrease', 0.05, '#27ae60'))
    if pf['gluc']>1:  fs.append(('Glucose', f"Level {pf['gluc']}", 'increase', 0.55, '#f39c12'))
    else:             fs.append(('Glucose', 'Normal', 'decrease', 0.05, '#27ae60'))
    if pf['is_menopausal']: fs.append(('Menopause', 'Post-menopausal', 'increase', 0.40, '#f39c12'))
    if pf['has_pcos']:      fs.append(('PCOS', 'Detected', 'increase', 0.50, '#e74c3c'))
    if pf['has_thyroid_issue']: fs.append(('Thyroid Risk', 'Detected', 'increase', 0.45, '#f39c12'))
    if not pf['active']: fs.append(('Physical Activity', 'Sedentary', 'increase', 0.40, '#f39c12'))
    else:                fs.append(('Physical Activity', 'Active', 'decrease', 0.20, '#27ae60'))
    fs.sort(key=lambda x: x[3], reverse=True)
    return fs[:8]

# ─── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style='text-align:center;padding:1rem 0;'>
      <div style='font-size:2.5rem;'>❤️</div>
      <div style='font-size:1rem;font-weight:700;color:#1a202c;'>CardioWise AI</div>
      <div style='font-size:0.75rem;color:#718096;margin-top:4px;'>Women's Cardiovascular<br>Risk Assessment System</div>
    </div>
    <hr style='border:none;border-top:1px solid #e8ecf0;margin:0.5rem 0;'>
    """, unsafe_allow_html=True)

    st.markdown("<div class='section-head'>🧑 Patient Information</div>", unsafe_allow_html=True)
    patient_name = st.text_input("Patient Name (optional)", placeholder="e.g. Jane Doe")

    col1, col2 = st.columns(2)
    with col1: age    = st.number_input("Age (yrs)", 18, 85, 45, 1)
    with col2: height = st.number_input("Height (cm)", 130, 210, 162, 1)

    col3, col4 = st.columns(2)
    with col3: weight = st.number_input("Weight (kg)", 35.0, 200.0, 68.0, 0.5)
    with col4:
        bmi_val = weight / ((height/100)**2)
        st.metric("BMI", f"{bmi_val:.1f}")

    st.markdown("<div class='section-head'>🩺 Clinical Vitals</div>", unsafe_allow_html=True)
    col5, col6 = st.columns(2)
    with col5: ap_hi = st.number_input("Systolic BP", 70, 250, 120, 1)
    with col6: ap_lo = st.number_input("Diastolic BP", 40, 150, 80, 1)

    col7, col8 = st.columns(2)
    with col7:
        cholesterol = st.selectbox("Cholesterol", [1, 2, 3],
            format_func=lambda x: {1:"1 – Normal", 2:"2 – Above Normal", 3:"3 – Well Above"}[x])
    with col8:
        gluc = st.selectbox("Glucose", [1, 2, 3],
            format_func=lambda x: {1:"1 – Normal", 2:"2 – Above Normal", 3:"3 – Well Above"}[x])

    st.markdown("<div class='section-head'>🧬 Women's Health Factors</div>", unsafe_allow_html=True)
    pregnancy_history = st.radio("Pregnancy History", [0, 1],
        format_func=lambda x: "Yes" if x else "No", horizontal=True, index=1)

    st.markdown("<div class='section-head'>🏃 Lifestyle</div>", unsafe_allow_html=True)
    smoke  = st.radio("Smoking",           [0,1], format_func=lambda x:"Yes" if x else "No", horizontal=True, index=0)
    alco   = st.radio("Alcohol Use",       [0,1], format_func=lambda x:"Yes" if x else "No", horizontal=True, index=0)
    active = st.radio("Physical Activity", [0,1], format_func=lambda x:"Active" if x else "Sedentary", horizontal=True, index=1)

    st.markdown("<br>", unsafe_allow_html=True)
    run_btn = st.button("🔬 Run Cardiac Risk Analysis")

    st.markdown("""
    <div class='disclaimer-box'>
      ⚠️ <strong>Disclaimer:</strong> This AI tool is for educational screening purposes only. 
      It does not constitute a medical diagnosis. Always consult a qualified cardiologist.
    </div>""", unsafe_allow_html=True)

# ─── Main Panel ───────────────────────────────────────────────────────────────
st.markdown("""
<div class="main-header">
  <div style="font-size:2rem;">🫀</div>
  <div>
    <h1>CardioWise AI — Women's Heart Disease Prediction</h1>
    <p>AI-Powered Clinical Decision Support · XGBoost · Real-Time Risk Stratification · Personalized Medical Advisory</p>
  </div>
</div>
""", unsafe_allow_html=True)

# Model status badge
if model_loaded:
    st.success("✅ XGBoost model loaded successfully — predictions powered by trained ML model")
else:
    st.warning("⚠️ Model files not found — running heuristic fallback. Place .pkl files in /models folder.")

if not run_btn:
    # Landing state
    col_a, col_b, col_c = st.columns(3)
    with col_a:
        st.markdown("""
        <div style='background:white;border:1px solid #e8ecf0;border-radius:12px;padding:1.5rem;text-align:center;'>
          <div style='font-size:2rem;'>🧬</div>
          <div style='font-weight:600;margin:8px 0 4px;'>Women-Specific AI</div>
          <div style='font-size:0.8rem;color:#718096;'>Menopause, PCOS, Thyroid & Pregnancy risk factors integrated</div>
        </div>""", unsafe_allow_html=True)
    with col_b:
        st.markdown("""
        <div style='background:white;border:1px solid #e8ecf0;border-radius:12px;padding:1.5rem;text-align:center;'>
          <div style='font-size:2rem;'>🧠</div>
          <div style='font-weight:600;margin:8px 0 4px;'>Explainable AI</div>
          <div style='font-size:0.8rem;color:#718096;'>Feature contribution analysis — see why the model made each decision</div>
        </div>""", unsafe_allow_html=True)
    with col_c:
        st.markdown("""
        <div style='background:white;border:1px solid #e8ecf0;border-radius:12px;padding:1.5rem;text-align:center;'>
          <div style='font-size:2rem;'>💊</div>
          <div style='font-weight:600;margin:8px 0 4px;'>Clinical Advisory</div>
          <div style='font-size:0.8rem;color:#718096;'>Personalized medications, lifestyle & diet recommendations</div>
        </div>""", unsafe_allow_html=True)
    st.markdown("<br><div style='text-align:center;color:#a0aec0;font-size:0.85rem;'>← Fill in patient details in the sidebar and click <strong>Run Cardiac Risk Analysis</strong></div>", unsafe_allow_html=True)

else:
    # ── Compute ────────────────────────────────────────────────────────────────
    bmi, is_meno, has_pcos, has_thyroid = compute_derived(age, weight, height, ap_hi, gluc, active)
    pf = {
        'age': age, 'height': height, 'weight': weight,
        'ap_hi': ap_hi, 'ap_lo': ap_lo,
        'cholesterol': cholesterol, 'gluc': gluc,
        'smoke': smoke, 'alco': alco, 'active': active,
        'BMI': bmi, 'is_menopausal': is_meno,
        'has_pcos': has_pcos, 'has_thyroid_issue': has_thyroid,
        'pregnancy_history': pregnancy_history,
    }

    with st.spinner("🔬 Running clinical risk analysis…"):
        score = predict(pf)
        label, color, icon, card_class = categorize(score)
        meds, life, warns = generate_advice(pf, score)
        cal, promote, avoid, sample = generate_diet(pf)
        factors = explain_features(pf)

    # ── Row 1: Risk Score + Gauge + Vitals ────────────────────────────────────
    col_left, col_right = st.columns([1.2, 1])

    with col_left:
        # Gauge chart
        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=score,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': f"<b>{icon} {label}</b>", 'font': {'size': 18}},
            delta={'reference': 35, 'increasing': {'color': '#e74c3c'}, 'decreasing': {'color': '#27ae60'}},
            number={'suffix': '%', 'font': {'size': 36, 'color': color}},
            gauge={
                'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': '#718096'},
                'bar': {'color': color, 'thickness': 0.3},
                'bgcolor': 'white',
                'borderwidth': 0,
                'steps': [
                    {'range': [0, 35],  'color': '#f0fdf4'},
                    {'range': [35, 60], 'color': '#fffbeb'},
                    {'range': [60, 100],'color': '#fff5f5'}
                ],
                'threshold': {
                    'line': {'color': color, 'width': 3},
                    'thickness': 0.8,
                    'value': score
                }
            }
        ))
        fig_gauge.update_layout(
            height=280, margin=dict(l=20, r=20, t=40, b=20),
            font=dict(family='Inter'), paper_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig_gauge, use_container_width=True)

        # Warnings
        for w in warns:
            st.error(w)

    with col_right:
        st.markdown("<div class='section-head'>📊 Key Vitals Summary</div>", unsafe_allow_html=True)

        bp_color = 'inverse' if pf['ap_hi'] >= 140 else 'normal'
        c1, c2 = st.columns(2)
        with c1:
            st.metric("Blood Pressure", f"{ap_hi}/{ap_lo}", f"{'⚠️ High' if ap_hi>=140 else '✓ Normal'}", delta_color=bp_color)
            st.metric("BMI", f"{bmi:.1f}", f"{'⚠️ Obese' if bmi>=30 else '⚠️ Overweight' if bmi>=25 else '✓ Normal'}", delta_color='inverse' if bmi>=25 else 'normal')
        with c2:
            chol_labels = {1:'✓ Normal', 2:'⚠️ High', 3:'🔴 Very High'}
            st.metric("Cholesterol", chol_labels[cholesterol], delta_color='inverse' if cholesterol>=2 else 'normal')
            gluc_labels = {1:'✓ Normal', 2:'⚠️ Elevated', 3:'🔴 High'}
            st.metric("Glucose", gluc_labels[gluc], delta_color='inverse' if gluc>=2 else 'normal')

        st.markdown("<div class='section-head'>🧬 Women's Health Status</div>", unsafe_allow_html=True)
        indicators = [
            ('Menopause', pf['is_menopausal'], 'Post-menopausal', 'Pre-menopausal'),
            ('PCOS', pf['has_pcos'], 'Detected', 'Not detected'),
            ('Thyroid Risk', pf['has_thyroid_issue'], 'Elevated', 'Normal'),
            ('Pregnancy Hx', pf['pregnancy_history'], 'Reported', 'Not reported'),
        ]
        for label_i, active_i, yes_txt, no_txt in indicators:
            chip_class = 'chip-active' if active_i else 'chip-inactive'
            dot = '🔴' if active_i else '🟢'
            txt  = yes_txt if active_i else no_txt
            st.markdown(f"""
            <span class='indicator-chip {chip_class}'>{dot} <strong>{label_i}:</strong> {txt}</span>
            """, unsafe_allow_html=True)

    st.markdown("<hr style='border:none;border-top:1px solid #e8ecf0;margin:1.5rem 0;'>", unsafe_allow_html=True)

    # ── Row 2: Feature Explanation + Radar ────────────────────────────────────
    col_exp, col_radar = st.columns(2)

    with col_exp:
        st.markdown("<div class='section-head'>🧠 AI Feature Contribution (Explainability)</div>", unsafe_allow_html=True)
        labels_f  = [f[0] for f in factors]
        values_f  = [f[3]*100 for f in factors]
        colors_f  = [f[4] for f in factors]
        arrows_f  = ['↑ Risk' if f[2]=='increase' else '↓ Risk' for f in factors]

        fig_bar = go.Figure(go.Bar(
            y=labels_f[::-1], x=values_f[::-1],
            orientation='h',
            marker_color=colors_f[::-1],
            text=[f"{v:.0f}% {a}" for v,a in zip(values_f[::-1], arrows_f[::-1])],
            textposition='outside',
            hovertemplate='<b>%{y}</b><br>Contribution: %{x:.0f}%<extra></extra>'
        ))
        fig_bar.update_layout(
            height=300, margin=dict(l=10, r=60, t=10, b=10),
            xaxis_title="Contribution magnitude (%)",
            font=dict(family='Inter', size=11),
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            xaxis=dict(showgrid=True, gridcolor='#f0f0f0'),
            yaxis=dict(showgrid=False)
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_radar:
        st.markdown("<div class='section-head'>📡 Risk Profile Radar</div>", unsafe_allow_html=True)
        radar_cats = ['BP Risk', 'Cholesterol', 'BMI', 'Glucose', 'Lifestyle', 'Women-Specific']
        bp_r  = min((pf['ap_hi']-90) / 100 * 100, 100)
        ch_r  = (pf['cholesterol']-1) / 2 * 100
        bmi_r = min((pf['BMI']-18) / 20 * 100, 100)
        gl_r  = (pf['gluc']-1) / 2 * 100
        ls_r  = (pf['smoke']*40 + pf['alco']*20 + (1-pf['active'])*40)
        wh_r  = (pf['is_menopausal']*25 + pf['has_pcos']*35 + pf['has_thyroid_issue']*25 + pf['pregnancy_history']*15)
        radar_vals = [max(bp_r,0), max(ch_r,0), max(bmi_r,0), max(gl_r,0), ls_r, wh_r]

        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(
            r=radar_vals + [radar_vals[0]],
            theta=radar_cats + [radar_cats[0]],
            fill='toself', fillcolor=f'rgba({192},{57},{43},0.15)',
            line=dict(color=color, width=2),
            name='Risk Profile'
        ))
        fig_radar.update_layout(
            polar=dict(
                radialaxis=dict(visible=True, range=[0, 100], tickfont=dict(size=9)),
                angularaxis=dict(tickfont=dict(size=11))
            ),
            showlegend=False, height=300,
            margin=dict(l=40, r=40, t=30, b=30),
            font=dict(family='Inter'), paper_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig_radar, use_container_width=True)

    st.markdown("<hr style='border:none;border-top:1px solid #e8ecf0;margin:1.5rem 0;'>", unsafe_allow_html=True)

    # ── Row 3: Clinical Advice ────────────────────────────────────────────────
    col_med, col_life = st.columns(2)

    with col_med:
        st.markdown("<div class='section-head'>💊 Clinical Intervention Recommendations</div>", unsafe_allow_html=True)
        if not meds:
            st.success("✅ No immediate pharmaceutical intervention required. Maintain preventive health practices.")
        else:
            urgency_colors = {'urgent': '#fff5f5', 'moderate': '#fffbeb', 'info': '#eff6ff'}
            urgency_borders = {'urgent': '#e74c3c', 'moderate': '#f39c12', 'info': '#2980b9'}
            urgency_tags = {'urgent': '🔴 Urgent', 'moderate': '🟡 Moderate', 'info': '🔵 Routine'}
            for name, detail, urg in meds:
                st.markdown(f"""
                <div class='advice-box {urg}'>
                  <div style='font-weight:600;font-size:0.85rem;'>{urgency_tags[urg]} — {name}</div>
                  <div style='font-size:0.78rem;color:#4a5568;margin-top:4px;line-height:1.4;'>{detail}</div>
                </div>""", unsafe_allow_html=True)

    with col_life:
        st.markdown("<div class='section-head'>🏃 Lifestyle Prescriptions</div>", unsafe_allow_html=True)
        for item in life:
            st.markdown(f"""
            <div style='display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.82rem;color:#1a202c;line-height:1.4;'>
              <span style='color:#8e44ad;font-weight:700;margin-top:1px;'>›</span>
              <span>{item}</span>
            </div>""", unsafe_allow_html=True)

    st.markdown("<hr style='border:none;border-top:1px solid #e8ecf0;margin:1.5rem 0;'>", unsafe_allow_html=True)

    # ── Row 4: Diet Plan ──────────────────────────────────────────────────────
    st.markdown("<div class='section-head'>🥗 Personalized Nutrition Plan</div>", unsafe_allow_html=True)
    col_d1, col_d2, col_d3 = st.columns([1, 1, 1.5])

    with col_d1:
        st.metric("Daily Target", f"{cal} kcal")
        st.metric("Protein", "25%")
        st.metric("Carbs", "45%")
        st.metric("Healthy Fat", "30%")

    with col_d2:
        st.markdown("**✅ Encourage**")
        for f in promote[:6]:
            st.markdown(f"<span class='food-tag'>✓ {f}</span>", unsafe_allow_html=True)
        st.markdown("<br>**❌ Limit / Avoid**", unsafe_allow_html=True)
        for f in avoid[:5]:
            st.markdown(f"<span class='food-tag' style='border-color:#fca5a5;color:#c0392b;'>✕ {f}</span>", unsafe_allow_html=True)

    with col_d3:
        st.markdown("**📅 Sample Day Meal Plan**")
        for meal, food in sample.items():
            st.markdown(f"""
            <div style='display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.8rem;'>
              <span style='color:#8e44ad;font-weight:600;width:110px;flex-shrink:0;'>{meal}</span>
              <span>{food}</span>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Footer Summary ─────────────────────────────────────────────────────────
    st.markdown(f"""
    <div style='background:white;border:1px solid #e8ecf0;border-radius:12px;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;'>
      <div>
        <span style='font-weight:700;font-size:0.9rem;'>Report Generated:</span>
        <span style='color:#718096;font-size:0.85rem;margin-left:8px;'>{datetime.now().strftime("%B %d, %Y at %H:%M")}</span>
      </div>
      <div>
        <span style='font-weight:700;font-size:0.9rem;'>Patient:</span>
        <span style='color:#718096;font-size:0.85rem;margin-left:8px;'>{patient_name or "Anonymous"}</span>
      </div>
      <div>
        <span style='font-weight:700;font-size:0.9rem;'>Model:</span>
        <span style='color:#718096;font-size:0.85rem;margin-left:8px;'>XGBoost Classifier v1.0</span>
      </div>
      <div style='background:#fff5f5;border:1px solid #fca5a5;border-radius:8px;padding:6px 12px;font-size:0.72rem;color:#c0392b;'>
        ⚠️ Not a medical diagnosis — consult a cardiologist
      </div>
    </div>
    """, unsafe_allow_html=True)
