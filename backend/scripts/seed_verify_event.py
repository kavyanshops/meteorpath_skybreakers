import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import engine
from app.models import Event, Reconstruction, Shower, Network, ReconstructionStatus
from sqlmodel import Session, select

def seed_verify():
    with Session(engine) as session:
        # 1. Ensure PER shower exists
        per = session.exec(select(Shower).where(Shower.iau_code == "PER")).first()
        if not per:
            per = Shower(
                iau_code="PER",
                name="Perseids",
                radiant_ra_deg=48.0,
                radiant_dec_deg=58.0,
                speed_km_s=59.0
            )
            session.add(per)
            session.commit()
            session.refresh(per)
        
        # 2. Add a high-fidelity Perseid event
        event_time = datetime(2024, 8, 12, 2, 30, 0, tzinfo=timezone.utc)
        
        # Check if already exists to avoid duplicates
        existing = session.exec(select(Event).where(Event.gmn_id == "GMN-VERIFY-PER-2024")).first()
        if existing:
            print(f"✅ Verification event already exists ID: {existing.id}")
            return existing.id

        event = Event(
            gmn_id="GMN-VERIFY-PER-2024",
            network=Network.GMN,
            begin_utc=event_time,
            end_utc=event_time,
            entry_velocity_km_s=59.2,
            geocentric_velocity_km_s=58.8,
            radiant_ra_deg=48.2,
            radiant_dec_deg=58.1,
            shower_id=per.id,
            station_count=5,
            region="Europe"
        )
        session.add(event)
        session.commit()
        session.refresh(event)
        
        # 3. Add a completed reconstruction
        recon = Reconstruction(
            event_id=event.id,
            status=ReconstructionStatus.DONE,
            initial_velocity_km_s=59.2,
            initial_velocity_sigma_km_s=0.05,
            radiant_ra_deg=48.2,
            radiant_dec_deg=58.1,
            radiant_ra_sigma_arcsec=15.0,
            radiant_dec_sigma_arcsec=12.0,
            median_angular_residual_arcsec=22.5,
            convergence_angle_deg=45.0,
            orbit_a_au=26.0,
            orbit_e=0.965,
            orbit_i_deg=113.1,
            orbit_omega_deg=151.2,
            orbit_big_omega_deg=139.5,
            orbit_q_au=0.948,
            completed_at=datetime.utcnow()
        )
        session.add(recon)
        session.commit()
        
        print(f"✅ Seeded verification event ID: {event.id}")
        return event.id

if __name__ == "__main__":
    seed_verify()
