import csv
import io
from datetime import datetime
import logging
from sqlmodel import Session, select
from app.models import Event, Reconstruction, ReconstructionStatus, Network

logger = logging.getLogger(__name__)

def ingest_fripon_from_csv(db: Session, csv_content: str) -> dict:
    """
    Parses a FRIPON CSV database dump and creates Events and Reconstructions.
    Expected CSV columns roughly:
    id, datetime, ra, dec, velocity, lat, lon
    """
    events_added = 0
    try:
        reader = csv.DictReader(io.StringIO(csv_content))
        
        for row in reader:
            fripon_id = row.get("id", "").strip()
            date_str = row.get("datetime", "").strip()
            if not fripon_id or not date_str:
                continue
                
            try:
                event_utc = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")
            except ValueError:
                continue
                
            gmn_id_mock = f"FRIPON_{fripon_id}"
            
            existing = db.exec(select(Event).where(Event.gmn_id == gmn_id_mock)).first()
            if existing:
                continue
                
            v = row.get("velocity", "")
            vel_km_s = float(v) if v else None
            
            lat = row.get("lat", "")
            lon = row.get("lon", "")
            r_lat = float(lat) if lat else None
            r_lon = float(lon) if lon else None
                
            new_event = Event(
                gmn_id=gmn_id_mock,
                network=Network.FRIPON,
                begin_utc=event_utc,
                entry_velocity_km_s=vel_km_s,
                geocentric_velocity_km_s=vel_km_s,
                begin_lat=r_lat,
                begin_lon=r_lon,
                ingestion_source="FRIPON",
                region="Europe"
            )
            db.add(new_event)
            db.commit()
            
            recon = Reconstruction(
                event_id=new_event.id,
                status=ReconstructionStatus.DONE,
                initial_velocity_km_s=vel_km_s,
                completed_at=datetime.utcnow()
            )
            db.add(recon)
            db.commit()
            
            events_added += 1
            
        return {"status": "success", "count": events_added, "message": f"Successfully ingested {events_added} FRIPON events."}
        
    except Exception as e:
        logger.exception("FRIPON CSV Ingestion failed")
        return {"status": "error", "message": f"CSV parse error: {str(e)}"}
