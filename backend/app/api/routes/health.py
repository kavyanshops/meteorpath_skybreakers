from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import Event
from app.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System"])
def health_check(session: Session = Depends(get_session)) -> HealthResponse:
    """System health check with database connectivity and event count."""
    try:
        count = session.exec(select(func.count()).select_from(Event)).one()
        return HealthResponse(status="ok", db="connected", events_count=count)
    except Exception:
        return HealthResponse(status="degraded", db="disconnected", events_count=0)
