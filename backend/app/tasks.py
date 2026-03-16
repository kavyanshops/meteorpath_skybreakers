import logging
from contextlib import contextmanager
from celery.exceptions import SoftTimeLimitExceeded

from app.worker import celery_app
from app.database import engine
from sqlmodel import Session, select
from app.models import Reconstruction, ReconstructionStatus
from app.core.trajectory.pipeline import TrajectoryPipeline
# We will import data ingestors later when they are written
# from app.core.ingestion.nasa import ingest_nasa_events
# from app.core.ingestion.ams import ingest_ams_events

logger = logging.getLogger(__name__)

@contextmanager
def get_db_session():
    with Session(engine) as session:
        yield session

@celery_app.task(bind=True, name="app.tasks.run_trajectory_pipeline")
def run_trajectory_pipeline(self, event_id: int):
    """
    Celery task that instantiates the Pipeline and computes orbital elements
    and physical properties for a given event, saving the result to the DB.
    """
    logger.info(f"Starting Celery task to reconstruct event {event_id}")
    
    with get_db_session() as db:
        # Save Celery Task ID to DB
        recon = db.exec(select(Reconstruction).where(Reconstruction.event_id == event_id)).first()
        if not recon:
            recon = Reconstruction(event_id=event_id, status=ReconstructionStatus.PENDING)
            db.add(recon)
        
        recon.celery_task_id = self.request.id
        db.commit()
    
    # Run heavy computation
    with get_db_session() as db:
        pipeline = TrajectoryPipeline(db, event_id)
        result = pipeline.run()
        
    return result

@celery_app.task(bind=True, name="app.tasks.run_nasa_ingestion")
def run_nasa_ingestion(self, start_date_str: str, end_date_str: str):
    logger.info(f"NASA ingestion task started: {start_date_str} to {end_date_str}")
    from app.core.ingestion.nasa_ingestor import ingest_nasa_events
    with get_db_session() as db:
        result = ingest_nasa_events(db, start_date_str, end_date_str)
    return result

@celery_app.task(bind=True, name="app.tasks.run_ams_ingestion")
def run_ams_ingestion(self):
    logger.info("AMS Live feed check started")
    from app.core.ingestion.ams_ingestor import ingest_ams_events
    with get_db_session() as db:
        result = ingest_ams_events(db)
    return result

@celery_app.task(bind=True, name="app.tasks.run_fripon_ingestion")
def run_fripon_ingestion(self, csv_data: str):
    logger.info("FRIPON CSV ingestion task started")
    from app.core.ingestion.fripon_ingestor import ingest_fripon_from_csv
    with get_db_session() as db:
        result = ingest_fripon_from_csv(db, csv_data)
    return result
