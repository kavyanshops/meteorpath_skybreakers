from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import events, health, ingest, live_feed
from app.config import settings
from app.database import create_db_and_tables
from app.api import router_jobs
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.worker import celery_app

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: create tables on startup."""
    create_db_and_tables()
    
    # Setup background polling
    scheduler = AsyncIOScheduler()
    scheduler.add_job(lambda: celery_app.send_task("app.tasks.run_ams_ingestion"), "interval", minutes=5)
    scheduler.start()
    
    yield
    
    scheduler.shutdown()


app = FastAPI(
    title="MeteorPath API",
    description="Multi-station meteor trajectory reconstruction platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(ingest.router, prefix="/api")
app.include_router(live_feed.router, prefix="/api")
app.include_router(router_jobs.router, prefix="/api/jobs", tags=["jobs"])
