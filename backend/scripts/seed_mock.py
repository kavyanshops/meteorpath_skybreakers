import random
import sys
from datetime import datetime, timedelta
import asyncio

# Setup path so we can import app
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, create_db_and_tables
from app.models import Event, Station, Network
from sqlmodel import Session

def seed_mock_data():
    create_db_and_tables()
    with Session(engine) as session:
        # Generate 100 fake events
        networks = [Network.GMN, Network.NASA, Network.AMS]
        now = datetime.utcnow()
        
        events = []
        for i in range(100):
            event = Event(
                gmn_id=f"MOCK-2026{random.randint(10,12)}{random.randint(10,28)}-{random.randint(100000,999999)}",
                network=random.choice(networks),
                begin_utc=now - timedelta(hours=random.randint(1, 240)),
                end_utc=now - timedelta(hours=random.randint(1, 240)) + timedelta(seconds=random.uniform(0.5, 4.0)),
                duration_sec=random.uniform(0.5, 4.0),
                peak_abs_magnitude=random.uniform(-8.0, 1.0),
                entry_velocity_km_s=random.uniform(11.2, 72.0),
                geocentric_velocity_km_s=random.uniform(11.2, 72.0) * 0.95,
                begin_lat=random.uniform(-60.0, 60.0),
                begin_lon=random.uniform(-180.0, 180.0),
                begin_ht_km=random.uniform(90.0, 120.0),
                end_lat=random.uniform(-60.0, 60.0),
                end_lon=random.uniform(-180.0, 180.0),
                end_ht_km=random.uniform(40.0, 80.0),
                station_count=random.randint(2, 12),
                region=random.choice(["Europe", "North America", "South America", "Oceania", "Asia"]),
                shower_code=random.choice(["PER", "GEM", "LYR", "ORI", None, None, None]),
                has_reconstruction=random.choice([True, False, False])
            )
            session.add(event)
            
        session.commit()
        print(f"✅ Successfully seeded {100} mock events into SQLite database.")

if __name__ == "__main__":
    seed_mock_data()
