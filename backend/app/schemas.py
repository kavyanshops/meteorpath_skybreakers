from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ReconstructionDetail(BaseModel):
    id: int
    event_id: int
    status: str
    error_message: Optional[str] = None
    line_origin_x: Optional[float] = None
    line_origin_y: Optional[float] = None
    line_origin_z: Optional[float] = None
    line_dir_x: Optional[float] = None
    line_dir_y: Optional[float] = None
    line_dir_z: Optional[float] = None
    initial_velocity_km_s: Optional[float] = None
    initial_velocity_sigma_km_s: Optional[float] = None
    radiant_ra_deg: Optional[float] = None
    radiant_dec_deg: Optional[float] = None
    radiant_ra_sigma_arcsec: Optional[float] = None
    radiant_dec_sigma_arcsec: Optional[float] = None
    median_angular_residual_arcsec: Optional[float] = None
    convergence_angle_deg: Optional[float] = None
    orbit_a_au: Optional[float] = None
    orbit_e: Optional[float] = None
    orbit_i_deg: Optional[float] = None
    orbit_big_omega_deg: Optional[float] = None
    orbit_q_au: Optional[float] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EventSummary(BaseModel):
    id: int
    gmn_id: Optional[str] = None
    network: str
    begin_utc: datetime
    peak_abs_magnitude: Optional[float] = None
    entry_velocity_km_s: Optional[float] = None
    station_count: Optional[int] = None
    region: Optional[str] = None
    shower_code: Optional[str] = None
    shower_name: Optional[str] = None
    begin_lat: Optional[float] = None
    begin_lon: Optional[float] = None
    begin_ht_km: Optional[float] = None
    has_reconstruction: bool = False

    class Config:
        from_attributes = True


class EventDetail(BaseModel):
    id: int
    gmn_id: Optional[str] = None
    network: str
    begin_utc: datetime
    end_utc: Optional[datetime] = None
    peak_abs_magnitude: Optional[float] = None
    entry_velocity_km_s: Optional[float] = None
    geocentric_velocity_km_s: Optional[float] = None
    radiant_ra_deg: Optional[float] = None
    radiant_dec_deg: Optional[float] = None
    begin_lat: Optional[float] = None
    begin_lon: Optional[float] = None
    begin_ht_km: Optional[float] = None
    end_lat: Optional[float] = None
    end_lon: Optional[float] = None
    end_ht_km: Optional[float] = None
    duration_sec: Optional[float] = None
    station_count: Optional[int] = None
    region: Optional[str] = None
    shower_code: Optional[str] = None
    shower_name: Optional[str] = None
    has_reconstruction: bool = False
    reconstruction: Optional[ReconstructionDetail] = None
    ingestion_source: str = "GMN"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    events: List[EventSummary]


class IngestRequest(BaseModel):
    start_date: str
    end_date: str


class IngestResponse(BaseModel):
    ingested: int
    skipped: int
    errors: List[str]


class HealthResponse(BaseModel):
    status: str
    db: str
    events_count: int
