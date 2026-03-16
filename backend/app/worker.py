import os
from celery import Celery

broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "meteorpath_tasks",
    broker=broker_url,
    backend=result_backend,
    include=["app.tasks"]
)

# Route tasks to distinct queues for priority management
celery_app.conf.task_routes = {
    "app.tasks.run_trajectory_pipeline": {"queue": "compute"},
    "app.tasks.run_nasa_ingestion": {"queue": "ingest"},
    "app.tasks.run_ams_ingestion": {"queue": "ingest"},
    "app.tasks.run_fripon_ingestion": {"queue": "ingest"},
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1, # Fair dispatch for long tasks
)
