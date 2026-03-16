import httpx
from datetime import datetime
import logging
from sqlmodel import Session, select
from app.models import Event, Observation, Station, Network, Reconstruction, ReconstructionStatus

logger = logging.getLogger(__name__)

NASA_API_URL = "https://ssd-api.jpl.nasa.gov/fireball.api"

def ingest_nasa_events(db: Session, start_date: str, end_date: str) -> dict:
    """
    Fetches fireball data from JPL NASA's Near Earth Object program.
    Creates basic Event and Reconstruction entries as NASA provides pre-computed kinetic energies 
    and velocities rather than raw multi-station observations.
    """
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(NASA_API_URL, params={"date-min": start_date, "date-max": end_date})
            resp.raise_for_status()
            data = resp.json()
            
        if "data" not in data:
            return {"status": "success", "count": 0, "message": "No data found for this range."}
            
        fields = data.get("fields", [])
        events_added = 0
        
        idx_date = fields.index("date")
        idx_lat = fields.index("lat")
        idx_lat_dir = fields.index("lat-dir")
        idx_lon = fields.index("lon")
        idx_lon_dir = fields.index("lon-dir")
        idx_alt = fields.index("alt")
        idx_vel = fields.index("vel")
        idx_energy = fields.index("energy")
        
        for row in data["data"]:
            date_str = row[idx_date]
            event_utc = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            gmn_id_mock = f"NASA_{event_utc.strftime('%Y%m%d%H%M%S')}"
            
            # Check if exists
            existing = db.exec(select(Event).where(Event.gmn_id == gmn_id_mock)).first()
            if existing:
                continue
                
            lat = float(row[idx_lat]) if row[idx_lat] else None
            if lat and row[idx_lat_dir] == "S":
                lat = -lat
                
            lon = float(row[idx_lon]) if row[idx_lon] else None
            if lon and row[idx_lon_dir] == "W":
                lon = -lon
                
            alt_km = float(row[idx_alt]) if row[idx_alt] else None
            vel_km_s = float(row[idx_vel]) if row[idx_vel] else None
            energy_kt = float(row[idx_energy]) if row[idx_energy] else None
            
            new_event = Event(
                gmn_id=gmn_id_mock,
                network=Network.NASA,
                begin_utc=event_utc,
                end_utc=event_utc, 
                entry_velocity_km_s=vel_km_s,
                geocentric_velocity_km_s=vel_km_s,
                begin_lat=lat,
                begin_lon=lon,
                begin_ht_km=alt_km,
                ingestion_source="NASA",
                region="Global"
            )
            db.add(new_event)
            db.commit() # Commit to get ID
            
            # Since NASA gives pre-computed data, we can fill a Reconstruction manually
            # or flag it as done.
            mass_kg = energy_kt * 4.184e12 / (0.5 * (vel_km_s * 1000.0)**2) if (energy_kt and vel_km_s) else None
            
            recon = Reconstruction(
                event_id=new_event.id,
                status=ReconstructionStatus.DONE,
                initial_velocity_km_s=vel_km_s,
                mass_estimation_available=(mass_kg is not None),
                estimated_mass_kg=mass_kg,
                completed_at=datetime.utcnow(),
                is_reference_solution=True
            )
            db.add(recon)
            db.commit()
            events_added += 1
            
        return {"status": "success", "count": events_added, "message": f"Successfully ingested {events_added} NASA events."}
        
    except httpx.HTTPError as e:
        logger.error(f"HTTP Error fetching from NASA: {e}")
        return {"status": "error", "message": f"Network error: {str(e)}"}
    except Exception as e:
        logger.exception("NASA Ingestion failed")
        return {"status": "error", "message": str(e)}
