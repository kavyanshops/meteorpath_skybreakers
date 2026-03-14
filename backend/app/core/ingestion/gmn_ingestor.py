"""
GMN data ingestion module.

Uses gmn-python-api to fetch real meteor trajectory data from the
Global Meteor Network daily files.
"""

from datetime import date, timedelta
from typing import Dict, List

from sqlmodel import Session, select

from app.core.ingestion.normalizer import normalize_gmn_row
from app.models import Event, Shower
from app.utils.logger import logger


def _lookup_shower(iau_code: str, session: Session) -> int | None:
    """Attempt to find a shower by IAU code, returning its ID or None."""
    if not iau_code or iau_code.lower() in ("spo", "spo ", "", "..."):
        return None
    statement = select(Shower).where(Shower.iau_code == iau_code.strip())
    shower = session.exec(statement).first()
    return shower.id if shower else None


async def ingest_gmn_date_range(
    start_date: date,
    end_date: date,
    session: Session,
) -> Dict[str, int | List[str]]:
    """
    Ingest GMN data for a date range.

    Loops over each date, fetches the daily trajectory file from GMN,
    parses into a DataFrame, and inserts new events into the database.
    """
    from gmn_python_api import data_directory as dd
    from gmn_python_api import meteor_trajectory_reader as mtr

    ingested = 0
    skipped = 0
    errors: List[str] = []
    current = start_date

    while current <= end_date:
        date_str = current.strftime("%Y-%m-%d")
        logger.info(f"Ingesting GMN data for {date_str}")

        try:
            content = dd.get_daily_file_content_by_date(date_str)
            df = mtr.read_data(content)

            for _, row in df.iterrows():
                try:
                    gmn_id = row.get("Unique trajectory ID")
                    if gmn_id:
                        gmn_id_str = str(gmn_id).strip()
                        existing = session.exec(
                            select(Event).where(Event.gmn_id == gmn_id_str)
                        ).first()
                        if existing:
                            skipped += 1
                            continue

                    event = normalize_gmn_row(row)

                    iau_code = row.get("IAU (code)")
                    if iau_code:
                        shower_id = _lookup_shower(str(iau_code), session)
                        if shower_id:
                            event.shower_id = shower_id

                    session.add(event)
                    ingested += 1

                except Exception as row_err:
                    logger.warning(f"Error processing row on {date_str}: {row_err}")
                    errors.append(f"{date_str}: {str(row_err)[:200]}")

            session.commit()
            logger.info(f"Completed {date_str}: ingested={ingested}, skipped={skipped}")

        except Exception as day_err:
            logger.error(f"Failed to process {date_str}: {day_err}")
            errors.append(f"{date_str}: {str(day_err)[:200]}")

        current += timedelta(days=1)

    return {"ingested": ingested, "skipped": skipped, "errors": errors}
