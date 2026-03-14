from datetime import date

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.ingestion.gmn_ingestor import ingest_gmn_date_range
from app.database import get_session
from app.schemas import IngestRequest, IngestResponse

router = APIRouter()


@router.post("/ingest/gmn", response_model=IngestResponse, tags=["Ingestion"])
async def ingest_gmn(
    body: IngestRequest,
    session: Session = Depends(get_session),
) -> IngestResponse:
    """Trigger GMN data ingestion for a specified date range."""
    start = date.fromisoformat(body.start_date)
    end = date.fromisoformat(body.end_date)
    result = await ingest_gmn_date_range(start, end, session)
    return IngestResponse(
        ingested=result["ingested"],  # type: ignore[arg-type]
        skipped=result["skipped"],  # type: ignore[arg-type]
        errors=result["errors"],  # type: ignore[arg-type]
    )
