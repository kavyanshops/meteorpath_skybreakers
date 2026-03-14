from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Network(str, enum.Enum):
    GMN = "GMN"
    NASA = "NASA"
    AMS = "AMS"
    FRIPON = "FRIPON"


class ReconstructionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class Shower(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    iau_code: str = Field(index=True)
    name: str
    radiant_ra_deg: float
    radiant_dec_deg: float
    speed_km_s: float

    events: List["Event"] = Relationship(back_populates="shower")


class Station(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True)
    network: Network
    lat: float
    lon: float
    elevation_m: float
    name: Optional[str] = None

    observations: List["Observation"] = Relationship(back_populates="station")


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    gmn_id: Optional[str] = Field(default=None, index=True, unique=True)
    network: Network
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
    shower_id: Optional[int] = Field(default=None, foreign_key="shower.id")
    ingestion_source: str = "GMN"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    shower: Optional[Shower] = Relationship(back_populates="events")
    observations: List["Observation"] = Relationship(back_populates="event")
    reconstruction: Optional["Reconstruction"] = Relationship(
        back_populates="event",
        sa_relationship_kwargs={"uselist": False},
    )


class Observation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id", index=True)
    station_id: int = Field(foreign_key="station.id", index=True)
    timestamp_utc: datetime
    ra_deg: float
    dec_deg: float
    magnitude: Optional[float] = None

    event: Optional[Event] = Relationship(back_populates="observations")
    station: Optional[Station] = Relationship(back_populates="observations")


class Reconstruction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id", index=True, unique=True)
    status: ReconstructionStatus = ReconstructionStatus.PENDING
    error_message: Optional[str] = None

    # Trajectory results
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

    # Orbit results
    orbit_a_au: Optional[float] = None
    orbit_e: Optional[float] = None
    orbit_i_deg: Optional[float] = None
    orbit_omega_deg: Optional[float] = None
    orbit_Omega_deg: Optional[float] = None
    orbit_q_au: Optional[float] = None

    completed_at: Optional[datetime] = None

    event: Optional[Event] = Relationship(back_populates="reconstruction")
