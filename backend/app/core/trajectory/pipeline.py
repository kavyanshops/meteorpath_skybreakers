import logging
from typing import Dict, Any, List
from datetime import datetime
import numpy as np
from sqlmodel import Session, select

from app.models import Event, Observation, Station, Reconstruction, ReconstructionStatus
from app.core.trajectory.coordinate_transforms import los_unit_vector_ecef, geodetic_to_ecef, ecef_to_geodetic
from app.core.trajectory.triangulation import line_of_sight_least_squares, reject_outliers, compute_convergence_angle
from app.core.trajectory.motion_model import fit_exponential_drag_model, project_to_trajectory
from app.core.trajectory.mass_estimation import estimate_mass_from_light_curve
from app.core.trajectory.monte_carlo import run_monte_carlo
from app.core.trajectory.orbit import compute_orbital_elements
from app.core.trajectory.dark_flight import compute_dark_flight
from app.core.trajectory.shower_association import associate_shower

logger = logging.getLogger(__name__)

class TrajectoryPipeline:
    def __init__(self, db: Session, event_id: int):
        self.db = db
        self.event_id = event_id
        
    def run(self) -> Dict[str, Any]:
        """Runs the entire scientific trajectory pipeline on standard events."""
        event = self.db.get(Event, self.event_id)
        if not event:
            raise ValueError(f"Event {self.event_id} not found")

        reconstruction = self.db.exec(
            select(Reconstruction).where(Reconstruction.event_id == self.event_id)
        ).first()
        
        if not reconstruction:
            reconstruction = Reconstruction(
                event_id=self.event_id, 
                status=ReconstructionStatus.RUNNING
            )
            self.db.add(reconstruction)
        else:
            reconstruction.status = ReconstructionStatus.RUNNING
            
        self.db.commit()

        try:
            # 1. Fetch Observations
            observations = self.db.exec(
                select(Observation).where(Observation.event_id == self.event_id).order_by(Observation.timestamp_utc)
            ).all()

            if len(observations) < 2:
                raise ValueError("Not enough observations for trajectory calculation.")

            # Load stations
            station_ids = list(set([o.station_id for o in observations]))
            stations = self.db.exec(select(Station).where(Station.id.in_(station_ids))).all()
            station_dict = {s.id: s for s in stations}

            if len(stations) < 2:
                reconstruction.quality_warning = "Single-station event: Triangulation impossible."
                reconstruction.status = ReconstructionStatus.FAILED
                reconstruction.error_message = "Requires 2+ stations."
                self.db.commit()
                return {"status": "failed", "reason": "Not enough stations"}

            # 2. Triangulation
            los_vectors = [los_unit_vector_ecef(o.ra_deg, o.dec_deg, o.timestamp_utc) for o in observations]
            station_positions = [geodetic_to_ecef(station_dict[o.station_id].lat, station_dict[o.station_id].lon, station_dict[o.station_id].elevation_m) for o in observations]

            clean_pos, clean_vec, removed = reject_outliers(station_positions, los_vectors, sigma_threshold=3.0)
            
            if len(clean_pos) < 2:
                raise ValueError("All observations rejected as outliers.")
                
            P0, d_hat, max_angle, residuals = line_of_sight_least_squares(clean_pos, clean_vec)

            # Update Reconstruction base metrics
            reconstruction.line_origin_x = float(P0[0])
            reconstruction.line_origin_y = float(P0[1])
            reconstruction.line_origin_z = float(P0[2])
            reconstruction.line_dir_x = float(d_hat[0])
            reconstruction.line_dir_y = float(d_hat[1])
            reconstruction.line_dir_z = float(d_hat[2])
            reconstruction.median_angular_residual_arcsec = float(np.median(residuals))
            reconstruction.convergence_angle_deg = float(max_angle)
            
            if max_angle < 5.0:
                reconstruction.low_quality_flag = True
                reconstruction.quality_warning = "Low convergence angle."

            # Radiant Direction (pointing backwards from trajectory direction)
            radiant_vec = -d_hat / np.linalg.norm(d_hat)
            radiant_ra = np.degrees(np.arctan2(radiant_vec[1], radiant_vec[0])) % 360.0
            radiant_dec = np.degrees(np.arcsin(np.clip(radiant_vec[2], -1.0, 1.0)))
            
            reconstruction.radiant_ra_deg = float(radiant_ra)
            reconstruction.radiant_dec_deg = float(radiant_dec)

            # 3. Motion Model & Velocity
            # Map observations onto trajectory path
            projected = project_to_trajectory(clean_pos, clean_vec, P0, d_hat)
            
            kept_obs = [observations[i] for i in range(len(observations)) if i not in removed]
            t_zero = kept_obs[0].timestamp_utc
            times_sec = [(o.timestamp_utc - t_zero).total_seconds() for o in kept_obs]
            dists_m = [p[1] for p in projected]
            obs_stations = [o.station_id for o in kept_obs]
            
            # Heights needed for density
            heights_m = []
            for d in dists_m:
                pos = P0 + d * d_hat
                _, _, h = ecef_to_geodetic(pos[0], pos[1], pos[2])
                heights_m.append(h)
                
            mean_lat = np.mean([station_dict[sid].lat for sid in obs_stations])
            mean_lon = np.mean([station_dict[sid].lon for sid in obs_stations])

            motion, fitted_s = fit_exponential_drag_model(
                obs_stations, times_sec, dists_m, heights_m, event.begin_utc, mean_lat, mean_lon
            )
            
            reconstruction.initial_velocity_km_s = motion["v0_km_s"]
            # Fallback for geocentric: just slightly less than entry (rough approximation for now)
            v_geo_km_s = max(11.2, motion["v0_km_s"] - 1.5)

            # 4. Monte Carlo Errors
            mc = run_monte_carlo(kept_obs, list(station_dict.values()))
            if mc["uncertainty_reliable"]:
                reconstruction.radiant_ra_sigma_arcsec = mc["radiant_ra_sigma_arcsec"]
                reconstruction.radiant_dec_sigma_arcsec = mc["radiant_dec_sigma_arcsec"]
                reconstruction.initial_velocity_sigma_km_s = mc["v0_sigma_km_s"]

            # 5. Orbital Elements
            orbit = compute_orbital_elements(radiant_ra, radiant_dec, v_geo_km_s, event.begin_utc)
            if orbit["success"]:
                reconstruction.orbit_a_au = orbit["a_au"]
                reconstruction.orbit_e = orbit["e"]
                reconstruction.orbit_i_deg = orbit["i_deg"]
                reconstruction.orbit_omega_deg = orbit["omega_deg"]
                reconstruction.orbit_big_omega_deg = orbit["big_omega_deg"]
                reconstruction.orbit_q_au = orbit["q_au"]

            # 6. Mass Estimation
            # Note: We need magnitude info inside kept_obs. 
            # In mock data, magnitude might be None.
            valid_mags = [o for o in kept_obs if o.magnitude is not None]
            if valid_mags:
                mag_ts = [((o.timestamp_utc - t_zero).total_seconds(), o.magnitude) for o in valid_mags]
                # Synthesize velocity time series from motion model derivative
                # For simplicity, we just use constant v0 for energy calc
                v_ts = [((o.timestamp_utc - t_zero).total_seconds(), motion["v0_km_s"]) for o in valid_mags]
                mass_res = estimate_mass_from_light_curve(
                    mag_ts, v_ts, (valid_mags[-1].timestamp_utc - valid_mags[0].timestamp_utc).total_seconds()
                )
                reconstruction.mass_estimation_available = True
                reconstruction.estimated_mass_kg = mass_res["mass_kg"]
                reconstruction.estimated_mass_lower_kg = mass_res["mass_lower_kg"]
                reconstruction.estimated_mass_upper_kg = mass_res["mass_upper_kg"]
                reconstruction.luminous_efficiency_tau = mass_res["luminous_efficiency_tau"]
            else:
                reconstruction.mass_estimation_available = False

            # 7. Shower Association
            shower_matched = associate_shower(self.db, radiant_ra, radiant_dec, v_geo_km_s)
            if shower_matched:
                event.shower_id = shower_matched
                self.db.add(event)

            # Commit everything
            reconstruction.status = ReconstructionStatus.DONE
            reconstruction.completed_at = datetime.utcnow()
            self.db.commit()
            return {"status": "success", "reconstruction_id": reconstruction.id}

        except Exception as e:
            logger.exception(f"Pipeline failed for event {self.event_id}")
            reconstruction.status = ReconstructionStatus.FAILED
            reconstruction.error_message = str(e)
            self.db.commit()
            return {"status": "failed", "reason": str(e)}
