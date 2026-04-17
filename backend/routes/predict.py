from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, User, Prediction
from routes.auth import get_current_user_simple
from ml_model import predict_risk
import json

router = APIRouter()

class PredictInput(BaseModel):
    patient_name: str = "Anonymous"
    age: float
    height: float
    weight: float
    ap_hi: float
    ap_lo: float
    cholesterol: int  # 1=normal, 2=above normal, 3=well above normal
    gluc: int        # 1=normal, 2=above normal, 3=well above normal
    smoke: int       # 0/1
    alco: int        # 0/1
    active: int      # 0/1
    pregnancy_history: Optional[int] = 0

class BatchPredictInput(BaseModel):
    patients: List[PredictInput]

@router.post("/")
def make_prediction(
    data: PredictInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Make individual prediction"""
    result = predict_risk(data.dict())
    
    # Save to DB
    pred = Prediction(
        user_id=current_user.id,
        patient_name=data.patient_name,
        age=data.age,
        height=data.height,
        weight=data.weight,
        ap_hi=data.ap_hi,
        ap_lo=data.ap_lo,
        cholesterol=data.cholesterol,
        gluc=data.gluc,
        smoke=bool(data.smoke),
        alco=bool(data.alco),
        active=bool(data.active),
        bmi=result["bmi"],
        is_menopausal=result["is_menopausal"],
        has_pcos=result["has_pcos"],
        has_thyroid_issue=result["has_thyroid_issue"],
        pregnancy_history=bool(data.pregnancy_history),
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        recommendations=json.dumps(result["recommendations"])
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    
    return {
        "prediction_id": pred.id,
        "patient_name": data.patient_name,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "bmi": result["bmi"],
        "is_menopausal": result["is_menopausal"],
        "has_pcos": result["has_pcos"],
        "has_thyroid_issue": result["has_thyroid_issue"],
        "recommendations": result["recommendations"],
        "feature_importances": result["feature_importances"],
        "created_at": pred.created_at
    }

@router.post("/batch")
def make_batch_prediction(
    data: BatchPredictInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Make batch predictions"""
    if len(data.patients) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 patients per batch"
        )
    
    results = []
    
    for i, patient in enumerate(data.patients):
        try:
            result = predict_risk(patient.dict())
            
            # Save to DB
            pred = Prediction(
                user_id=current_user.id,
                patient_name=patient.patient_name,
                age=patient.age,
                height=patient.height,
                weight=patient.weight,
                ap_hi=patient.ap_hi,
                ap_lo=patient.ap_lo,
                cholesterol=patient.cholesterol,
                gluc=patient.gluc,
                smoke=bool(patient.smoke),
                alco=bool(patient.alco),
                active=bool(patient.active),
                bmi=result["bmi"],
                is_menopausal=result["is_menopausal"],
                has_pcos=result["has_pcos"],
                has_thyroid_issue=result["has_thyroid_issue"],
                pregnancy_history=bool(patient.pregnancy_history),
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                recommendations=json.dumps(result["recommendations"])
            )
            db.add(pred)
            
            results.append({
                "index": i,
                "patient_name": patient.patient_name,
                "risk_score": result["risk_score"],
                "risk_level": result["risk_level"],
                "bmi": result["bmi"],
                "success": True
            })
            
        except Exception as e:
            results.append({
                "index": i,
                "patient_name": patient.patient_name,
                "error": str(e),
                "success": False
            })
    
    db.commit()
    
    return {
        "results": results,
        "total_processed": len(results),
        "success_count": len([r for r in results if r["success"]]),
        "error_count": len([r for r in results if not r["success"]])
    }

@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Get user's prediction history"""
    preds = db.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc()).limit(50).all()
    
    result = []
    for p in preds:
        result.append({
            "id": p.id,
            "patient_name": p.patient_name,
            "age": p.age,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "bmi": p.bmi,
            "created_at": p.created_at
        })
    return result

@router.get("/{prediction_id}")
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Get specific prediction by ID"""
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id, 
        Prediction.user_id == current_user.id
    ).first()
    
    if not pred:
        raise HTTPException(
            status_code=404, 
            detail="Prediction not found"
        )
    
    return {
        "id": pred.id,
        "patient_name": pred.patient_name,
        "age": pred.age,
        "height": pred.height,
        "weight": pred.weight,
        "ap_hi": pred.ap_hi,
        "ap_lo": pred.ap_lo,
        "cholesterol": pred.cholesterol,
        "gluc": pred.gluc,
        "smoke": pred.smoke,
        "alco": pred.alco,
        "active": pred.active,
        "bmi": pred.bmi,
        "is_menopausal": pred.is_menopausal,
        "has_pcos": pred.has_pcos,
        "has_thyroid_issue": pred.has_thyroid_issue,
        "pregnancy_history": pred.pregnancy_history,
        "risk_score": pred.risk_score,
        "risk_level": pred.risk_level,
        "recommendations": json.loads(pred.recommendations) if pred.recommendations else {},
        "created_at": pred.created_at
    }
