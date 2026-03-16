import numpy as np
from typing import List, Dict
from copy import deepcopy
import logging

from app.models import Observation, Station
from app.core.trajectory.coordinate_transforms import los_unit_vector_ecef, geodetic_to_ecef
from app.core.trajectory.triangulation import line_of_sight_least_squares
from app.core.trajectory.motion_model import project_to_trajectory, fit_linear_deceleration

logger = logging.getLogger(__name__)

def run_monte_carlo(
    observations: List[Observation],
    stations: List[Station],
    n_runs: int = 100,
    noise_arcsec: float = 30.0
) -> Dict:
    """
    Run Monte Carlo iterations to determine uncertainty in radiant and velocity.
    """
    sigma_deg = noise_arcsec / 3600.0
    results = {"ra_deg": [], "dec_deg": [], "v0_km_s": []}
    
    station_dict = {s.id: s for s in stations}

    for _ in range(n_runs):
        perturbed_obs = []
        for obs in observations:
            o_copy = Observation(
                id=obs.id, event_id=obs.event_id, station_id=obs.station_id,
                timestamp_utc=obs.timestamp_utc,
                ra_deg=obs.ra_deg + np.random.normal(0, sigma_deg),
                dec_deg=obs.dec_deg + np.random.normal(0, sigma_deg),
                magnitude=obs.magnitude
            )
            perturbed_obs.append(o_copy)

        try:
            los_vectors = [
                los_unit_vector_ecef(o.ra_deg, o.dec_deg, o.timestamp_utc)
                for o in perturbed_obs
            ]
            
            station_positions = []
            for o in perturbed_obs:
                s = station_dict[o.station_id]
                station_positions.append(geodetic_to_ecef(s.lat, s.lon, s.elevation_m))
                
            P0, d_hat, _, _ = line_of_sight_least_squares(station_positions, los_vectors)
            
            projected = project_to_trajectory(station_positions, los_vectors, P0, d_hat)
            times_sec = [(o.timestamp_utc - perturbed_obs[0].timestamp_utc).total_seconds() for o in perturbed_obs]
            dists_m = [p[1] for p in projected]
            station_ids = [o.station_id for o in perturbed_obs]
            
            params, _ = fit_linear_deceleration(station_ids, times_sec, dists_m)
            
            # radiant vector is the opposite of the velocity direction vector
            radiant_vec = -d_hat / np.linalg.norm(d_hat)
            ra_rad = np.arctan2(radiant_vec[1], radiant_vec[0])
            dec_rad = np.arcsin(np.clip(radiant_vec[2], -1.0, 1.0))
            
            results["ra_deg"].append(np.degrees(ra_rad) % 360.0)
            results["dec_deg"].append(np.degrees(dec_rad))
            results["v0_km_s"].append(params["v0_km_s"])
            
        except Exception as e:
            continue

    n_ok = len(results["v0_km_s"])
    
    if n_ok == 0:
        return {
            "radiant_ra_mean_deg": None,
            "radiant_dec_mean_deg": None,
            "radiant_ra_sigma_arcsec": None,
            "radiant_dec_sigma_arcsec": None,
            "v0_mean_km_s": None,
            "v0_sigma_km_s": None,
            "n_successful": 0,
            "uncertainty_reliable": False
        }

    return {
        "radiant_ra_mean_deg": float(np.mean(results["ra_deg"])),
        "radiant_dec_mean_deg": float(np.mean(results["dec_deg"])),
        "radiant_ra_sigma_arcsec": float(np.std(results["ra_deg"]) * 3600.0),
        "radiant_dec_sigma_arcsec": float(np.std(results["dec_deg"]) * 3600.0),
        "v0_mean_km_s": float(np.mean(results["v0_km_s"])),
        "v0_sigma_km_s": float(np.std(results["v0_km_s"])),
        "n_successful": n_ok,
        "uncertainty_reliable": n_ok >= 20
    }
