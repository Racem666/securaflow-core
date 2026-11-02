from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from datetime import datetime

import models
from database import engine, get_db
from ai_engine import analyze_threat
from ioc_extractor import extract_iocs
from threat_intel import enrich_all_ips

# Ensure database tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SecuraFlow Core API with AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schemas
class IncidentCreate(BaseModel):
    title: str
    description: str
    category: str
    reporter_email: EmailStr


class StatusUpdatePayload(BaseModel):
    status: str


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    reporter_email: str
    severity: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    ai_analysis: Optional[Any] = None

    class Config:
        from_attributes = True


# Endpoints
@app.post("/api/v1/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(report: IncidentCreate, db: Session = Depends(get_db)):
    full_text = f"{report.title} {report.description}"

    # 1. Extract raw regex artifacts (IPs, URLs, hashes, firewall commands)
    extracted_iocs = extract_iocs(full_text)

    # 2. Asynchronously enrich extracted public IPs with geolocation & risk scores
    if extracted_iocs.get("ips"):
        enriched = await enrich_all_ips(extracted_iocs["ips"])
        extracted_iocs["enriched_ips"] = enriched
    else:
        extracted_iocs["enriched_ips"] = []

    # 3. Analyze threat context with Groq LLM
    ai_result = analyze_threat(report.title, report.description, report.category)

    # 4. Attach the complete IOC and threat intel bundle to the analysis payload
    ai_result["iocs"] = extracted_iocs

    # 5. Extract calculated severity
    final_severity = ai_result.get("ai_severity", "Medium")

    # 6. Persist to SQLite via SQLAlchemy ORM
    new_incident = models.Incident(
        title=report.title,
        description=report.description,
        category=report.category,
        reporter_email=report.reporter_email,
        severity=final_severity,
        status="Open",
        ai_analysis=ai_result
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


@app.get("/api/v1/incidents", response_model=List[IncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).order_by(models.Incident.created_at.desc()).all()


@app.patch("/api/v1/incidents/{incident_id}/status", response_model=IncidentResponse)
def update_status(incident_id: int, payload: StatusUpdatePayload, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = payload.status
    incident.resolved_at = datetime.utcnow() if payload.status == "Resolved" else None
    db.commit()
    db.refresh(incident)
    return incident