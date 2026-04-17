from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, User, Prediction
from routes.auth import get_current_user_simple

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Get user dashboard statistics"""
    total = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    
    by_level = db.query(
        Prediction.risk_level, 
        func.count()
    ).filter(
        Prediction.user_id == current_user.id
    ).group_by(Prediction.risk_level).all()
    
    level_counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    for level, count in by_level:
        level_counts[level] = count

    avg_score = db.query(func.avg(Prediction.risk_score)).filter(
        Prediction.user_id == current_user.id
    ).scalar() or 0

    recent = db.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc()).limit(10).all()
    
    trend = [{"date": p.created_at.strftime("%m/%d"), "score": p.risk_score, "level": p.risk_level} for p in recent]
    
    high_risk = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.risk_level.in_(["High", "Critical"])
    ).count()

    return {
        "total_assessments": total,
        "average_risk_score": round(avg_score, 1),
        "risk_distribution": level_counts,
        "high_risk_count": high_risk,
        "recent_trend": trend[::-1],  # Reverse to show oldest first
    }

@router.get("/global")
def get_global_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Get global statistics (admin or aggregated)"""
    total = db.query(Prediction).count()
    
    by_level = db.query(Prediction.risk_level, func.count()).group_by(Prediction.risk_level).all()
    level_counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    for level, count in by_level:
        level_counts[level] = count
    
    avg_bmi = db.query(func.avg(Prediction.bmi)).scalar() or 0
    avg_score = db.query(func.avg(Prediction.risk_score)).scalar() or 0
    
    # Women's health statistics
    pcos_count = db.query(Prediction).filter(Prediction.has_pcos == True).count()
    menopausal = db.query(Prediction).filter(Prediction.is_menopausal == True).count()
    thyroid = db.query(Prediction).filter(Prediction.has_thyroid_issue == True).count()
    pregnancy = db.query(Prediction).filter(Prediction.pregnancy_history == True).count()
    
    # Risk factor statistics
    smokers = db.query(Prediction).filter(Prediction.smoke == True).count()
    high_bp = db.query(Prediction).filter(Prediction.ap_hi >= 140).count()
    high_chol = db.query(Prediction).filter(Prediction.cholesterol >= 2).count()
    high_gluc = db.query(Prediction).filter(Prediction.gluc >= 2).count()
    
    return {
        "total_assessments": total,
        "average_risk_score": round(avg_score, 1),
        "average_bmi": round(avg_bmi, 1),
        "risk_distribution": level_counts,
        "clinical_flags": {
            "pcos": pcos_count,
            "menopausal": menopausal,
            "thyroid": thyroid,
            "pregnancy_history": pregnancy
        },
        "risk_factors": {
            "smokers": smokers,
            "high_blood_pressure": high_bp,
            "high_cholesterol": high_chol,
            "high_glucose": high_gluc
        },
        "demographics": {
            "average_age": round(db.query(func.avg(Prediction.age)).scalar() or 0, 1),
            "age_distribution": {
                "under_30": db.query(Prediction).filter(Prediction.age < 30).count(),
                "30_40": db.query(Prediction).filter(Prediction.age.between(30, 40)).count(),
                "41_50": db.query(Prediction).filter(Prediction.age.between(41, 50)).count(),
                "over_50": db.query(Prediction).filter(Prediction.age > 50).count()
            }
        }
    }

@router.get("/trends")
def get_prediction_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Get prediction trends over time"""
    # Daily trends for last 30 days
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    trends = db.query(
        func.date(Prediction.created_at).label('date'),
        func.count().label('count'),
        func.avg(Prediction.risk_score).label('avg_risk')
    ).filter(
        Prediction.user_id == current_user.id,
        Prediction.created_at >= start_date
    ).group_by(func.date(Prediction.created_at)).all()
    
    return [
        {
            "date": str(trend.date),
            "count": trend.count,
            "average_risk": round(trend.avg_risk, 1)
        } for trend in trends
    ]
