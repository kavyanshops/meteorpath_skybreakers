"""
Seed the MeteorPath database with real GMN data.

Usage:
    cd meteorpath/backend
    python -m scripts.seed_db

This script:
  1. Creates all database tables
  2. Ingests 90 days of GMN trajectory data (~500-1000+ events)
"""

import asyncio
import sys
from datetime import date, timedelta
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.ingestion.gmn_ingestor import ingest_gmn_date_range
from app.database import create_db_and_tables, engine
from app.utils.logger import logger
from sqlmodel import Session


async def seed() -> None:
    logger.info("Creating database tables...")
    create_db_and_tables()

    end = date.today()
    start = end - timedelta(days=90)

    logger.info(f"Seeding database with GMN data from {start} to {end}")
    logger.info("This may take several minutes depending on network speed...")

    with Session(engine) as session:
        result = await ingest_gmn_date_range(start, end, session)

    logger.info(
        f"Seeding complete: "
        f"ingested={result['ingested']}, "
        f"skipped={result['skipped']}, "
        f"errors={len(result['errors'])}"
    )

    if result["errors"]:
        logger.warning("Errors encountered during seeding:")
        for err in result["errors"][:10]:
            logger.warning(f"  - {err}")


if __name__ == "__main__":
    asyncio.run(seed())
