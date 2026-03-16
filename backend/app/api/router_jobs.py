from fastapi import APIRouter, Depends, Body
from sqlmodel import Session
from app.database import get_session
from app.tasks import run_trajectory_pipeline, run_nasa_ingestion, run_ams_ingestion
from pydantic import BaseModel

router = APIRouter()

class NasaIngestRequest(BaseModel):
    start_date: str
    end_date: str

@router.post("/reconstruct/{event_id}")
def trigger_reconstruction(event_id: int, db: Session = Depends(get_session)):
    # Running synchronously for verification because Celery is not available
    print(f"DEBUG: Triggering sync reconstruction for {event_id}")
    result = run_trajectory_pipeline(None, event_id) 
    return {"message": "Reconstruction complete (sync)", "result": "DONE"}

@router.post("/ingest/nasa")
def trigger_nasa_ingestion(payload: NasaIngestRequest):
    task = run_nasa_ingestion.delay(payload.start_date, payload.end_date)
    return {"message": "NASA ingestion queued", "task_id": task.id}

@router.post("/ingest/ams")
def trigger_ams_poll():
    task = run_ams_ingestion.delay()
    return {"message": "AMS manual poll queued", "task_id": task.id}
