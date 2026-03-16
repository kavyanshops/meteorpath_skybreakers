export interface ReconstructionDetail {
    id: number;
    event_id: number;
    status: 'pending' | 'running' | 'done' | 'failed';
    error_message: string | null;
    line_origin_x: number | null;
    line_origin_y: number | null;
    line_origin_z: number | null;
    line_dir_x: number | null;
    line_dir_y: number | null;
    line_dir_z: number | null;
    initial_velocity_km_s: number | null;
    initial_velocity_sigma_km_s: number | null;
    radiant_ra_deg: number | null;
    radiant_dec_deg: number | null;
    radiant_ra_sigma_arcsec: number | null;
    radiant_dec_sigma_arcsec: number | null;
    median_angular_residual_arcsec: number | null;
    convergence_angle_deg: number | null;
    orbit_a_au: number | null;
    orbit_e: number | null;
    orbit_i_deg: number | null;
    orbit_omega_deg: number | null;
    orbit_Omega_deg: number | null;
    orbit_q_au: number | null;
    celery_task_id: string | null;
    low_quality_flag: boolean;
    quality_warning: string | null;
    station_offsets_estimated: boolean;
    mass_estimation_available: boolean;
    estimated_mass_kg: number | null;
    estimated_mass_lower_kg: number | null;
    estimated_mass_upper_kg: number | null;
    luminous_efficiency_tau: number | null;
    is_reference_solution: boolean;
    completed_at: string | null;
}

export interface VisualsPayload {
  trajectory: {lat: number; lon: number; height: number}[];
  stations: {id: string|number; name: string; lat: number; lon: number; height: number}[];
  los_lines: {fromLat: number; fromLon: number; fromH: number; toLat: number; toLon: number; toH: number}[];
  velocity_profile: {time_sec: number; velocity_km_s: number}[];
  residuals: {index: number; station_code: string; residual_arcsec: number}[];
}

export interface DarkFlightPayload {
  survived: boolean;
  impact_lat: number | null;
  impact_lon: number | null;
  impact_mass_kg?: number | null;
  path_coordinates: [number, number, number][];
  strewn_field_ellipse?: { center: [number, number]; semi_major_m: number; semi_minor_m: number; angle_deg: number; };
}

export interface EventSummary {
    id: number;
    gmn_id: string | null;
    network: string;
    begin_utc: string;
    peak_abs_magnitude: number | null;
    entry_velocity_km_s: number | null;
    station_count: number | null;
    region: string | null;
    shower_code: string | null;
    shower_name: string | null;
    begin_lat: number | null;
    begin_lon: number | null;
    begin_ht_km: number | null;
    has_reconstruction: boolean;
}

export interface EventDetail extends EventSummary {
    end_utc: string | null;
    geocentric_velocity_km_s: number | null;
    radiant_ra_deg: number | null;
    radiant_dec_deg: number | null;
    end_lat: number | null;
    end_lon: number | null;
    end_ht_km: number | null;
    duration_sec: number | null;
    reconstruction: ReconstructionDetail | null;
    ingestion_source: string;
    created_at: string;
}

export interface EventListResponse {
    total: number;
    page: number;
    page_size: number;
    events: EventSummary[];
}

export interface HealthResponse {
    status: string;
    db: string;
    events_count: number;
}
