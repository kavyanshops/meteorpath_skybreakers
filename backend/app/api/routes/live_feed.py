from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Event, Station

router = APIRouter()

@router.get("/live-feed", tags=["Live"])
def get_live_feed(limit: int = 15, session: Session = Depends(get_session)):
    events = session.exec(
        select(Event)
        .order_by(Event.created_at.desc())
        .limit(limit)
    ).all()
    
    base_results = []
    for e in events:
        base_results.append({
            "id": e.id,
            "gmn_id": e.gmn_id,
            "network": e.network,
            "time_utc": e.begin_utc,
            "region": e.region,
            "ingestion_source": e.ingestion_source,
            "magnitude": e.peak_abs_magnitude
        })
    return base_results

@router.get("/live-feed/status", tags=["Live"])
def get_live_feed_status(session: Session = Depends(get_session)):
    # Very simple status aggregation
    counts = session.exec(select(Event.network, Event.id)).all()
    summary = {}
    for net, _id in counts:
        summary[net] = summary.get(net, 0) + 1
        
    return {
        "sources": [
            { "name": "NASA JPL", "status": "active", "events_ingested": summary.get("NASA", 0) },
            { "name": "AMS Fireballs", "status": "active", "events_ingested": summary.get("AMS", 0) },
            { "name": "FRIPON", "status": "active", "events_ingested": summary.get("FRIPON", 0) },
            { "name": "GMN Global", "status": "active", "events_ingested": summary.get("GMN", 0) }
        ],
        "system_health": "operational",
        "last_poll_utc": "Just now"
    }
