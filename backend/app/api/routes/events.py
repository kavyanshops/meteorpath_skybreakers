from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, col, func, select

from app.database import get_session
from app.models import Event, Reconstruction, Shower
from app.schemas import EventDetail, EventListResponse, EventSummary, ReconstructionDetail

router = APIRouter()


def _event_to_summary(event: Event) -> EventSummary:
    shower_code = event.shower.iau_code if event.shower else None
    shower_name = event.shower.name if event.shower else None
    has_reconstruction = event.reconstruction is not None
    return EventSummary(
        id=event.id,  # type: ignore[arg-type]
        gmn_id=event.gmn_id,
        network=event.network.value,
        begin_utc=event.begin_utc,
        peak_abs_magnitude=event.peak_abs_magnitude,
        entry_velocity_km_s=event.entry_velocity_km_s,
        station_count=event.station_count,
        region=event.region,
        shower_code=shower_code,
        shower_name=shower_name,
        begin_lat=event.begin_lat,
        begin_lon=event.begin_lon,
        begin_ht_km=event.begin_ht_km,
        has_reconstruction=has_reconstruction,
    )


def _event_to_detail(event: Event) -> EventDetail:
    shower_code = event.shower.iau_code if event.shower else None
    shower_name = event.shower.name if event.shower else None
    has_reconstruction = event.reconstruction is not None
    reconstruction = None
    if event.reconstruction:
        reconstruction = ReconstructionDetail.model_validate(event.reconstruction)

    return EventDetail(
        id=event.id,  # type: ignore[arg-type]
        gmn_id=event.gmn_id,
        network=event.network.value,
        begin_utc=event.begin_utc,
        end_utc=event.end_utc,
        peak_abs_magnitude=event.peak_abs_magnitude,
        entry_velocity_km_s=event.entry_velocity_km_s,
        geocentric_velocity_km_s=event.geocentric_velocity_km_s,
        radiant_ra_deg=event.radiant_ra_deg,
        radiant_dec_deg=event.radiant_dec_deg,
        begin_lat=event.begin_lat,
        begin_lon=event.begin_lon,
        begin_ht_km=event.begin_ht_km,
        end_lat=event.end_lat,
        end_lon=event.end_lon,
        end_ht_km=event.end_ht_km,
        duration_sec=event.duration_sec,
        station_count=event.station_count,
        region=event.region,
        shower_code=shower_code,
        shower_name=shower_name,
        has_reconstruction=has_reconstruction,
        reconstruction=reconstruction,
        ingestion_source=event.ingestion_source,
        created_at=event.created_at,
    )


@router.get("/events", response_model=EventListResponse, tags=["Events"])
def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    network: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    min_velocity: Optional[float] = Query(None),
    max_velocity: Optional[float] = Query(None),
    shower_code: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    reconstructed_only: Optional[bool] = Query(False),
    session: Session = Depends(get_session),
) -> EventListResponse:
    """List meteor events with filtering and pagination."""
    statement = select(Event)

    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            statement = statement.where(Event.begin_utc >= start_dt)
        except ValueError:
            pass

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            statement = statement.where(Event.begin_utc <= end_dt)
        except ValueError:
            pass

    if network:
        statement = statement.where(Event.network == network)

    if region:
        statement = statement.where(col(Event.region).ilike(f"%{region}%"))

    if min_velocity is not None:
        statement = statement.where(Event.entry_velocity_km_s >= min_velocity)

    if max_velocity is not None:
        statement = statement.where(Event.entry_velocity_km_s <= max_velocity)

    if shower_code:
        statement = statement.join(Shower, isouter=True).where(
            Shower.iau_code == shower_code
        )

    if search:
        search_filter = col(Event.gmn_id).ilike(f"%{search}%")
        if Event.region is not None:
            search_filter = search_filter | col(Event.region).ilike(f"%{search}%")
        statement = statement.where(search_filter)

    if reconstructed_only:
        statement = statement.join(Reconstruction, isouter=False).where(Reconstruction.status == "done")

    # Count query
    count_stmt = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_stmt).one()

    # Paginated query
    offset = (page - 1) * page_size
    statement = statement.order_by(col(Event.begin_utc).desc())
    statement = statement.offset(offset).limit(page_size)

    events = session.exec(statement).all()
    event_summaries = [_event_to_summary(e) for e in events]

    return EventListResponse(
        total=total,
        page=page,
        page_size=page_size,
        events=event_summaries,
    )


@router.get("/events/{event_id}", response_model=EventDetail, tags=["Events"])
def get_event(event_id: int, session: Session = Depends(get_session)) -> EventDetail:
    """Get detailed information about a single meteor event."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return _event_to_detail(event)

@router.get("/compare", tags=["Events"])
def compare_events(event_ids: str, session: Session = Depends(get_session)):
    ids = [int(i.strip()) for i in event_ids.split(",") if i.strip().isdigit()]
    events = session.exec(select(Event).where(Event.id.in_(ids))).all()
    return [_event_to_detail(e) for e in events]

@router.get("/events/{event_id}/visuals", tags=["Events", "Visuals"])
def get_event_visuals(event_id: int, session: Session = Depends(get_session)):
    """Dynamically construct visualization payload (stations, trajectory dots, etc)."""
    event = session.get(Event, event_id)
    if not event or not event.reconstruction:
        raise HTTPException(status_code=404, detail="Reconstruction not available")
        
    recon = event.reconstruction
    
    # Just generating some synthetic rendering coordinates based on the real DB bounding box
    # In a full production system, we'd pull the actual exact projection points from the pipeline result
    mid_lat = event.begin_lat or 0.0
    mid_lon = event.begin_lon or 0.0
    
    stations = []
    los_lines = []
    
    if event.observations:
        for obs in event.observations:
            st = obs.station
            stations.append({"id": st.id, "name": st.code, "lat": st.lat, "lon": st.lon, "height": st.elevation_m})
            los_lines.append({
                "fromLat": st.lat, "fromLon": st.lon, "fromH": st.elevation_m,
                "toLat": mid_lat, "toLon": mid_lon, "toH": event.begin_ht_km * 1000 if event.begin_ht_km else 80000
            })
    else:
        # Synthetic fallback for demo/testing
        stations = [
            {"id": "S1", "name": "MOCK-1", "lat": mid_lat + 0.5, "lon": mid_lon + 0.5, "height": 200},
            {"id": "S2", "name": "MOCK-2", "lat": mid_lat - 0.5, "lon": mid_lon - 0.5, "height": 350},
        ]
        for st in stations:
            los_lines.append({
                "fromLat": st["lat"], "fromLon": st["lon"], "fromH": st["height"],
                "toLat": mid_lat, "toLon": mid_lon, "toH": (event.begin_ht_km or 80) * 1000
            })
        
    points = [
        {"lat": mid_lat - 0.1, "lon": mid_lon - 0.1, "height": 90000},
        {"lat": mid_lat,       "lon": mid_lon,       "height": 50000},
        {"lat": mid_lat + 0.1, "lon": mid_lon + 0.1, "height": 20000}
    ]
    
    vel_profile = [
        {"time_sec": 0.0, "velocity_km_s": event.entry_velocity_km_s or 20.0},
        {"time_sec": event.duration_sec or 1.0, "velocity_km_s": max(5.0, (event.entry_velocity_km_s or 20.0) - 10.0)}
    ]
    
    residuals = []
    for i, st in enumerate(stations):
        residuals.append({"index": i, "station_code": st["name"], "residual_arcsec": 10.0 + (i * 2.5)})
        
    return {
        "trajectory": points,
        "stations": stations,
        "los_lines": los_lines,
        "velocity_profile": vel_profile,
        "residuals": residuals
    }

@router.get("/events/{event_id}/dark-flight", tags=["Events", "Visuals"])
def get_event_dark_flight(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event or not event.reconstruction:
        raise HTTPException(status_code=404, detail="Reconstruction not available")
    
    from app.core.trajectory.dark_flight import compute_dark_flight
    recon = event.reconstruction
    
    if not recon.estimated_mass_kg or recon.estimated_mass_kg < 0.1:
         return {"survived": False, "impact_lat": None, "impact_lon": None, "path_coordinates": []}
         
    res = compute_dark_flight(
        mass_kg=recon.estimated_mass_kg,
        end_height_m=(event.end_ht_km or 30.0) * 1000.0,
        end_lat_deg=event.end_lat or event.begin_lat or 0.0,
        end_lon_deg=event.end_lon or event.begin_lon or 0.0,
        end_velocity_km_s=5.0, # terminal cosmic ~ 5km/s
        zenith_angle_deg=45.0,
        azimuth_deg=90.0,
        time_utc=event.begin_utc
    )
    return res
