import enum
from datetime import datetime
from typing import List

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


# 1. Reconstruction (Child of Event, strictly 1-to-1)
class Reconstruction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id", index=True, unique=True)
    status: ReconstructionStatus = ReconstructionStatus.PENDING
    error_message: str | None = None

    line_origin_x: float | None = None
    line_origin_y: float | None = None
    line_origin_z: float | None = None
    line_dir_x: float | None = None
    line_dir_y: float | None = None
    line_dir_z: float | None = None
    initial_velocity_km_s: float | None = None
    initial_velocity_sigma_km_s: float | None = None
    radiant_ra_deg: float | None = None
    radiant_dec_deg: float | None = None
    radiant_ra_sigma_arcsec: float | None = None
    radiant_dec_sigma_arcsec: float | None = None
    median_angular_residual_arcsec: float | None = None
    convergence_angle_deg: float | None = None

    orbit_a_au: float | None = None
    orbit_e: float | None = None
    orbit_i_deg: float | None = None
    orbit_omega_deg: float | None = Field(default=None, description="Argument of periapsis")
    orbit_big_omega_deg: float | None = Field(default=None, description="Longitude of ascending node (Omega)")
    orbit_q_au: float | None = Field(default=None, description="Perihelion distance in AU")

    completed_at: datetime | None = None

    event: "Event" = Relationship(back_populates="reconstruction")


# 2. Observation (Child of Event and Station)
class Observation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id", index=True)
    station_id: int = Field(foreign_key="station.id", index=True)
    timestamp_utc: datetime
    ra_deg: float
    dec_deg: float
    magnitude: float | None = None

    event: "Event" = Relationship(back_populates="observations")
    station: "Station" = Relationship(back_populates="observations")


# 3. Event (Parent of Observation and Reconstruction, Child of Shower)
class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    gmn_id: str | None = Field(default=None, index=True, unique=True)
    network: Network
    begin_utc: datetime
    end_utc: datetime | None = None
    peak_abs_magnitude: float | None = None
    entry_velocity_km_s: float | None = None
    geocentric_velocity_km_s: float | None = None
    radiant_ra_deg: float | None = None
    radiant_dec_deg: float | None = None
    begin_lat: float | None = None
    begin_lon: float | None = None
    begin_ht_km: float | None = None
    end_lat: float | None = None
    end_lon: float | None = None
    end_ht_km: float | None = None
    duration_sec: float | None = None
    station_count: int | None = None
    region: str | None = None
    shower_id: int | None = Field(default=None, foreign_key="shower.id")
    ingestion_source: str = "GMN"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    shower: "Shower" = Relationship(back_populates="events")
    observations: List["Observation"] = Relationship(back_populates="event")
    reconstruction: "Reconstruction" = Relationship(
        back_populates="event",
        sa_relationship_kwargs={"uselist": False},
    )


# 4. Shower (Parent of Event)
class Shower(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    iau_code: str = Field(index=True)
    name: str
    radiant_ra_deg: float
    radiant_dec_deg: float
    speed_km_s: float

    events: List["Event"] = Relationship(back_populates="shower")


# 5. Station (Parent of Observation)
class Station(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    code: str = Field(index=True)
    network: Network
    lat: float
    lon: float
    elevation_m: float
    name: str | None = None

    observations: List["Observation"] = Relationship(back_populates="station")
