import httpx
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import logging
from sqlmodel import Session, select
from app.models import Event, Network

logger = logging.getLogger(__name__)

AMS_URL = "https://fireballs.amsmeteors.org/members/imo_view/browse_events"

def ingest_ams_events(db: Session, year: int = None) -> dict:
    """
    Scrapes the AMS (American Meteor Society) website for public witness-reported fireballs.
    """
    if not year:
        year = datetime.utcnow().year
        
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(f"{AMS_URL}?year={year}")
            resp.raise_for_status()
            
        soup = BeautifulSoup(resp.text, "html.parser")
        table = soup.find("table", {"id": "events-table"})
        if not table:
            return {"status": "error", "message": "Could not find events table on AMS site."}
            
        events_added = 0
        rows = table.find("tbody").find_all("tr")
        
        for row in rows[:50]: # Limit to top 50 recent to avoid taking forever
            cols = row.find_all("td")
            if len(cols) < 5:
                continue
                
            event_id_str = cols[0].text.strip()
            # Date format: 2024-11-20 03:00:00 UTC (roughly)
            date_str = cols[1].text.strip()
            
            try:
                event_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                # AMS might be lacking exact hours, default to midnight
                try:
                    event_date = datetime.strptime(date_str.split(" ")[0], "%Y-%m-%d")
                except ValueError:
                    continue
            
            gmn_id_mock = f"AMS_{year}_{event_id_str}"
            
            existing = db.exec(select(Event).where(Event.gmn_id == gmn_id_mock)).first()
            if existing:
                continue
                
            # Usually column 2 or 3 has witness count, roughly parse it if helpful
            witness_count_text = cols[2].text.strip()
            witness_count = int(witness_count_text) if witness_count_text.isdigit() else None
            
            new_event = Event(
                gmn_id=gmn_id_mock,
                network=Network.AMS,
                begin_utc=event_date,
                ingestion_source="AMS",
                station_count=witness_count, # Overloading station_count for witness count roughly
                region="Witness Report"
            )
            db.add(new_event)
            events_added += 1
            
        db.commit()
        return {"status": "success", "count": events_added, "message": f"Successfully ingested {events_added} AMS reports."}
        
    except httpx.HTTPError as e:
        logger.error(f"HTTP Error fetching from AMS: {e}")
        return {"status": "error", "message": f"Network error: {str(e)}"}
    except Exception as e:
        logger.exception("AMS Web Scraping failed")
        return {"status": "error", "message": str(e)}
