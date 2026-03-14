"""
Normalizer for GMN raw DataFrame rows into Event model instances.
"""

import math
from datetime import datetime
from typing import Optional

import pandas as pd

from app.models import Event, Network


def safe_float(value: object) -> Optional[float]:
    """Convert a value to float, returning None if NaN or invalid."""
    if value is None:
        return None
    try:
        f = float(value)
        return None if math.isnan(f) or math.isinf(f) else f
    except (ValueError, TypeError):
        return None


def safe_int(value: object) -> Optional[int]:
    """Convert a value to int, returning None if NaN or invalid."""
    f = safe_float(value)
    return int(f) if f is not None else None


def parse_utc(value: object) -> Optional[datetime]:
    """Parse a datetime value from the GMN DataFrame."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    try:
        return datetime.fromisoformat(str(value))
    except (ValueError, TypeError):
        return None


def normalize_gmn_row(row: pd.Series) -> Event:
    """Convert a single GMN DataFrame row into an Event model instance."""
    begin_utc = parse_utc(row.get("Beginning (UTC)"))
    if begin_utc is None:
        begin_utc = datetime.utcnow()

    duration = safe_float(row.get("Duration (sec)"))
    end_utc = None
    if begin_utc and duration and duration > 0:
        from datetime import timedelta
        end_utc = begin_utc + timedelta(seconds=duration)

    gmn_id = row.get("Unique trajectory ID")
    if gmn_id is not None:
        gmn_id = str(gmn_id).strip()
        if not gmn_id:
            gmn_id = None

    return Event(
        gmn_id=gmn_id,
        network=Network.GMN,
        begin_utc=begin_utc,
        end_utc=end_utc,
        peak_abs_magnitude=safe_float(row.get("Peak Abs Mag")),
        entry_velocity_km_s=safe_float(row.get("Vinit (km/s)")),
        geocentric_velocity_km_s=safe_float(row.get("Vgeo (km/s)")),
        radiant_ra_deg=safe_float(row.get("RAgeo (deg)")),
        radiant_dec_deg=safe_float(row.get("DECgeo (deg)")),
        begin_lat=safe_float(row.get("Beg lat (deg N)")),
        begin_lon=safe_float(row.get("Beg lon (deg E)")),
        begin_ht_km=safe_float(row.get("Beg ht (km)")),
        end_lat=safe_float(row.get("End lat (deg N)")),
        end_lon=safe_float(row.get("End lon (deg E)")),
        end_ht_km=safe_float(row.get("End ht (km)")),
        duration_sec=duration,
        station_count=safe_int(row.get("Num (stat)")),
        ingestion_source="GMN",
    )
