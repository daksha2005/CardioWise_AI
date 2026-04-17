from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User, Prediction
from routes.auth import get_current_user_simple
import json
import io
from datetime import datetime

router = APIRouter()

@router.get("/pdf/{prediction_id}")
def generate_pdf_report(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Generate PDF report for prediction"""
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm) 

        NAVY = colors.HexColor("#0a1628")
        BLUE = colors.HexColor("#1e40af")
        HIGH_COLOR = colors.HexColor("#ef4444")
        MOD_COLOR = colors.HexColor("#f59e0b")
        LOW_COLOR = colors.HexColor("#22c55e")

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("Title", fontSize=22, textColor=NAVY, fontName="Helvetica-Bold", alignment=TA_CENTER, spaceAfter=4)
        sub_style = ParagraphStyle("Sub", fontSize=11, textColor=BLUE, fontName="Helvetica", alignment=TA_CENTER, spaceAfter=16)
        heading_style = ParagraphStyle("Heading", fontSize=13, textColor=NAVY, fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle("Body", fontSize=10, textColor=colors.HexColor("#374151"), fontName="Helvetica", spaceAfter=4)

        prob = pred.risk_score
        cat = pred.risk_level
        risk_color = HIGH_COLOR if cat=="HIGH" else (MOD_COLOR if cat=="MODERATE" else LOW_COLOR)

        elements = []

        # Header
        elements.append(Paragraph("🫀 CardioRisk AI Clinical Report", title_style))
        elements.append(Paragraph("Women's Heart Disease Risk Assessment", sub_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=BLUE))
        elements.append(Spacer(1, 0.4*cm))

        # Patient Info
        rpt_date = pred.created_at.strftime("%Y-%m-%d")
        elements.append(Paragraph("Patient Information", heading_style))
        info_data = [
            ["Patient Name", pred.patient_name, "Report Date", rpt_date],
            ["Age", f"{pred.age} years", "Report ID", f"RPT-{pred.id:05d}"],
            ["Height", f"{pred.height} cm", "Weight", f"{pred.weight} kg"],
            ["BMI", f"{pred.bmi}", "Risk Level", cat],
        ]
        t = Table(info_data, colWidths=[3.5*cm, 5*cm, 3.5*cm, 5*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0),(-1,-1), colors.HexColor("#f0f7ff")),
            ('TEXTCOLOR', (0,0),(0,-1), NAVY),
            ('TEXTCOLOR', (2,0),(2,-1), NAVY),
            ('FONTNAME', (0,0),(0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0),(2,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0),(-1,-1), 10),
            ('ROWBACKGROUNDS', (0,0),(-1,-1), [colors.HexColor("#e8f4fd"), colors.white]),
            ('GRID', (0,0),(-1,-1), 0.5, colors.HexColor("#c0d9f0")),
            ('PADDING', (0,0),(-1,-1), 8),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.4*cm))

        # Risk Score
        elements.append(Paragraph("Risk Assessment", heading_style))
        risk_data = [
            ["RISK PROBABILITY", f"{prob:.1f}%", "RISK CATEGORY", cat],
        ]
        rt = Table(risk_data, colWidths=[4*cm, 5*cm, 4*cm, 4*cm])
        rt.setStyle(TableStyle([
            ('BACKGROUND', (0,0),(0,0), NAVY),
            ('BACKGROUND', (1,0),(1,0), risk_color),
            ('BACKGROUND', (2,0),(2,0), NAVY),
            ('BACKGROUND', (3,0),(3,0), risk_color),
            ('TEXTCOLOR', (0,0),(-1,-1), colors.white),
            ('FONTNAME', (0,0),(-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (1,0),(1,0), 20),
            ('FONTSIZE', (3,0),(3,0), 16),
            ('ALIGNMENT', (0,0),(-1,-1), 'CENTER'),
            ('VALIGN', (0,0),(-1,-1), 'MIDDLE'),
            ('PADDING', (0,0),(-1,-1), 12),
            ('ROUNDEDCORNERS', [6]),
        ]))
        elements.append(rt)
        elements.append(Spacer(1, 0.4*cm))

        # Clinical Markers
        elements.append(Paragraph("Clinical Vitals", heading_style))
        vitals = [
            ["Blood Pressure", f"{pred.ap_hi}/{pred.ap_lo} mmHg",
             "Cholesterol", ["Normal","Borderline","High"][pred.cholesterol-1]],
            ["Glucose", ["Normal","Borderline","High"][pred.gluc-1],
             "Smoking", "Yes" if pred.smoke else "No"],
            ["Alcohol", "Yes" if pred.alco else "No",
             "Physically Active", "Yes" if pred.active else "No"],
        ]
        vt = Table(vitals, colWidths=[3.5*cm, 5*cm, 3.5*cm, 5*cm])
        vt.setStyle(TableStyle([
            ('FONTNAME', (0,0),(0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0),(2,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0,0),(0,-1), NAVY),
            ('TEXTCOLOR', (2,0),(2,-1), NAVY),
            ('ROWBACKGROUNDS', (0,0),(-1,-1), [colors.HexColor("#f0f7ff"), colors.white]),
            ('GRID', (0,0),(-1,-1), 0.5, colors.HexColor("#c0d9f0")),
            ('PADDING', (0,0),(-1,-1), 8),
            ('FONTSIZE', (0,0),(-1,-1), 10),
        ]))
        elements.append(vt)

        # Women's Health
        elements.append(Paragraph("Women's Health Indicators", heading_style))
        def flag(v): return "⚠️ Yes" if v else "✅ No"
        wh = [
            ["Menopausal Status", "Post-Menopause" if pred.is_menopausal else "Pre-Menopause",
             "PCOS Indicator", flag(pred.has_pcos)],
            ["Thyroid Risk", flag(pred.has_thyroid_issue),
             "Pregnancy History", flag(pred.pregnancy_history)],
        ]
        wht = Table(wh, colWidths=[3.5*cm, 5*cm, 3.5*cm, 5*cm])
        wht.setStyle(TableStyle([
            ('FONTNAME', (0,0),(0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0),(2,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0,0),(0,-1), NAVY),
            ('TEXTCOLOR', (2,0),(2,-1), NAVY),
            ('ROWBACKGROUNDS', (0,0),(-1,-1), [colors.HexColor("#fef3ff"), colors.white]),
            ('GRID', (0,0),(-1,-1), 0.5, colors.HexColor("#ddd6fe")),
            ('PADDING', (0,0),(-1,-1), 8),
            ('FONTSIZE', (0,0),(-1,-1), 10),
        ]))
        elements.append(wht)

        # Recommendations
        if pred.recommendations:
            recs = json.loads(pred.recommendations)
            if isinstance(recs, dict):
                if recs.get("medications"):
                    elements.append(Paragraph("Recommended Medications", heading_style))
                    for m in recs["medications"]:
                        elements.append(Paragraph(f"💊 {m}", body_style))
                if recs.get("lifestyle"):
                    elements.append(Paragraph("Lifestyle & Preventive Care", heading_style))
                    for l in recs["lifestyle"]:
                        elements.append(Paragraph(f"🏃 {l}", body_style))
                if recs.get("followup"):
                    elements.append(Paragraph("Follow-up Schedule", heading_style))
                    for f in recs["followup"]:
                        elements.append(Paragraph(f"📅 {f}", body_style))

        # Disclaimer
        elements.append(Spacer(1, 0.5*cm))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#93c5fd")))
        disc = ParagraphStyle("Disc", fontSize=8, textColor=colors.HexColor("#6b7280"), fontName="Helvetica-Oblique", alignment=TA_CENTER, spaceBefore=8)
        elements.append(Paragraph("⚠️ DISCLAIMER: This report is generated by an AI system for informational purposes only. "
                                   "It does not constitute medical advice. Please consult a qualified cardiologist for diagnosis and treatment.", disc))

        doc.build(elements)
        buf.seek(0)
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            io.BytesIO(buf.read()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=CardioRisk_Report_{pred.id}_{rpt_date}.pdf"}
        )
    except ImportError:
        return {"error": "PDF generation requires reportlab: pip install reportlab"}

@router.get("/summary/{prediction_id}")
def get_prediction_summary(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple)
):
    """Get prediction summary for quick view"""
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    ).first()
    
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    recommendations = json.loads(pred.recommendations) if pred.recommendations else {}
    
    return {
        "patient_name": pred.patient_name,
        "risk_score": pred.risk_score,
        "risk_level": pred.risk_level,
        "bmi": pred.bmi,
        "clinical_vitals": {
            "age": pred.age,
            "blood_pressure": f"{pred.ap_hi}/{pred.ap_lo}",
            "cholesterol": pred.cholesterol,
            "glucose": pred.gluc,
            "smoking": pred.smoke,
            "alcohol": pred.alco,
            "physical_activity": pred.active
        },
        "womens_health": {
            "menopausal": pred.is_menopausal,
            "pcos": pred.has_pcos,
            "thyroid_issue": pred.has_thyroid_issue,
            "pregnancy_history": pred.pregnancy_history
        },
        "recommendations": recommendations,
        "created_at": pred.created_at
    }
