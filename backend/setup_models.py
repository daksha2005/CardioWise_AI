#!/usr/bin/env python3
"""
Setup script — copies .pkl model files from uploads to the models/ directory.
Run this once before starting either app.
"""

import os, shutil

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Map source → destination (using relative paths for cross-platform compatibility)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # Go up to cardiowise root
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

FILES = {
    os.path.join(UPLOADS_DIR, "heart_prediction_women_xgb.pkl"): "heart_prediction_women_xgb.pkl",
    os.path.join(UPLOADS_DIR, "scaler_final.pkl"):               "scaler_final.pkl",
    os.path.join(UPLOADS_DIR, "features_final.pkl"):             "features_final.pkl",
}

for src, dst in FILES.items():
    dst_path = os.path.join(MODELS_DIR, dst)
    if os.path.exists(src):
        shutil.copy2(src, dst_path)
        print(f"✅ Copied {os.path.basename(src)} → models/{dst}")
    else:
        print(f"⚠️  Not found: {src}")

print("\n✅ Model setup complete. You can now run:")
print("   Flask:     python app.py")
print("   Streamlit: streamlit run streamlit_app.py")
