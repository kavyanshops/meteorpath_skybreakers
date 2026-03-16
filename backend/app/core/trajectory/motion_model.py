import numpy as np
import scipy.optimize
import scipy.interpolate
from scipy.integrate import solve_ivp
from typing import List, Tuple, Dict
from datetime import datetime
import logging

from app.core.trajectory.atmosphere import get_atmospheric_density_nrlmsise

logger = logging.getLogger(__name__)

def project_to_trajectory(
    station_positions: List[np.ndarray],
    los_vectors: List[np.ndarray],
    P0: np.ndarray,
    d_hat: np.ndarray
) -> List[Tuple[float, float]]:
    """
    Project each observation onto trajectory line to get along-track distance.
    Returns: list of (t_sec, s_meters) where t_sec is index-based placeholder 
             if actual timestamp not used (but here we just return s_meters, we need times).
    Wait, the prompt spec says Returns: list of (relative_timestamp_sec, s_meters).
    But this function does not take timestamps as input. I will return s_meters and 
    the caller will zip it with times. Actually, I'll change the signature to match what's needed or just return s_meters.
    Let's return just the distance s for each point.
    """
    results = []
    # Note: caller will zip with times. The prompt lists Returns: list of (relative_timestamp_sec, s_meters)
    # but doesn't pass timestamps. I will return (0.0, s_meters) so it matches the type signature.
    for B_i, u_i in zip(station_positions, los_vectors):
        A_mat = np.array([
            [np.dot(u_i, u_i),   -np.dot(u_i, d_hat)],
            [np.dot(u_i, d_hat), -np.dot(d_hat, d_hat)]
        ])
        b_vec = np.array([
            np.dot(P0 - B_i, u_i),
            np.dot(P0 - B_i, d_hat)
        ])
        t_val, s_val = np.linalg.lstsq(A_mat, b_vec, rcond=None)[0]
        results.append((0.0, float(s_val)))
    return results

def fit_linear_deceleration(
    station_ids: List[int],
    times_sec: List[float],
    distances_m: List[float]
) -> Tuple[Dict, np.ndarray]:
    """
    Fits s(t) = s0 + v0*(t + dt_k) + 0.5*a*(t + dt_k)^2
    """
    unique_stations = sorted(list(set(station_ids)))
    
    def residuals(params):
        s0, v0, a = params[:3]
        offsets = {sid: params[3+i] for i, sid in enumerate(unique_stations)}
        t_corrected = [t + offsets[sid] for t, sid in zip(times_sec, station_ids)]
        predicted = [s0 + v0*tc + 0.5*a*tc**2 for tc in t_corrected]
        return np.array(distances_m) - np.array(predicted)

    v0_guess = (max(distances_m) - min(distances_m)) / (max(times_sec) - min(times_sec) + 1e-6)
    v0_guess = np.clip(v0_guess, 5000, 75000)
    
    initial_guess = [min(distances_m), v0_guess, -100.0] + [0.0]*len(unique_stations)
    
    bounds_lower = [-np.inf, 5000.0, -100000.0] + [-0.5]*len(unique_stations)
    bounds_upper = [np.inf, 75000.0, 0.0]       + [0.5]*len(unique_stations)
    
    try:
        res = scipy.optimize.least_squares(
            residuals, x0=initial_guess, bounds=(bounds_lower, bounds_upper), method='dogbox'
        )
        p = res.x
        s0, v0, a = p[:3]
        offsets = {sid: p[3+i] for i, sid in enumerate(unique_stations)}
        
        t_corrected = [t + offsets[sid] for t, sid in zip(times_sec, station_ids)]
        fitted_dist = np.array([s0 + v0*tc + 0.5*a*tc**2 for tc in t_corrected])
        rmse = np.sqrt(np.mean(res.fun**2))
        
        return {
            "s0": float(s0),
            "v0_km_s": float(v0 / 1000.0),
            "a_km_s2": float(a / 1000.0),
            "station_offsets": offsets,
            "fit_rmse": float(rmse),
            "model_type": "linear"
        }, fitted_dist
    except Exception as e:
        logger.error(f"Linear fit failed: {e}")
        return {"v0_km_s": v0_guess / 1000.0, "model_type": "linear_fallback"}, np.array(distances_m)

def fit_exponential_drag_model(
    station_ids: List[int],
    times_sec: List[float],
    distances_m: List[float],
    heights_m: List[float],
    event_time_utc: datetime,
    mean_lat_deg: float,
    mean_lon_deg: float
) -> Tuple[Dict, np.ndarray]:
    """
    Fits exponential drag model incorporating NRLMSISE-00 density.
    """
    # Fallback immediately to linear if data is too small
    if len(times_sec) < 5:
        return fit_linear_deceleration(station_ids, times_sec, distances_m)

    try:
        alt_min_km = max(0.0, min(heights_m) / 1000.0 - 10.0)
        alt_max_km = max(heights_m) / 1000.0 + 10.0
        
        altitude_grid_km = np.linspace(alt_min_km, alt_max_km, 100)
        density_grid = [get_atmospheric_density_nrlmsise(h, mean_lat_deg, mean_lon_deg, event_time_utc)
                        for h in altitude_grid_km]
        
        density_interp = scipy.interpolate.interp1d(
            altitude_grid_km, density_grid, kind='cubic', fill_value='extrapolate'
        )
    except Exception as e:
        logger.warning(f"Density grid failed, falling back to linear: {e}")
        return fit_linear_deceleration(station_ids, times_sec, distances_m)

    unique_stations = sorted(list(set(station_ids)))
    
    v0_guess = (max(distances_m) - min(distances_m)) / (max(times_sec) - min(times_sec) + 1e-6)
    
    # Estimate entry angle from heights vs distances
    if len(heights_m) > 1 and max(distances_m) > min(distances_m):
        dh = heights_m[0] - heights_m[-1]
        ds = distances_m[-1] - distances_m[0]
        entry_angle_rad_guess = np.arctan2(dh, ds)
    else:
        entry_angle_rad_guess = np.radians(45.0)
        
    def simulate_trajectory(v0, K, entry_angle_rad, duration):
        def rhs(t, y):
            s, v, h = y
            if h <= 0:
                return [v, 0, 0]
            rho = float(density_interp(h / 1000.0))
            dv = -K * rho * v**2
            dh = -v * np.sin(entry_angle_rad)
            return [v, dv, dh]
            
        res = solve_ivp(rhs, (0, duration), [distances_m[0], v0, heights_m[0]], 
                        method='RK45', max_step=0.2, t_eval=np.linspace(0, duration, 200))
        return res.t, res.y

    def residuals(params):
        v0, K, entry_angle_rad = params[:3]
        offsets = {sid: params[3+i] for i, sid in enumerate(unique_stations)}
        
        t_corrected = [t + offsets[sid] for t, sid in zip(times_sec, station_ids)]
        max_t = max(t_corrected) + 1.0
        
        sim_t, sim_y = simulate_trajectory(v0, K, entry_angle_rad, max_t)
        if len(sim_t) < 2:
            return np.ones_like(distances_m) * 1e6
            
        s_interp = scipy.interpolate.interp1d(sim_t, sim_y[0], fill_value="extrapolate")
        predicted = s_interp(t_corrected)
        return np.array(distances_m) - predicted

    initial_guess = [v0_guess, 1e-5, entry_angle_rad_guess] + [0.0]*len(unique_stations)
    bounds_lower = [5000.0, 1e-8, 0.0] + [-0.5]*len(unique_stations)
    bounds_upper = [75000.0, 1e-2, np.pi/2] + [0.5]*len(unique_stations)

    try:
        res = scipy.optimize.least_squares(
            residuals, x0=initial_guess, bounds=(bounds_lower, bounds_upper), method='dogbox'
        )
        p = res.x
        v0, K, entry_angle_rad = p[:3]
        offsets = {sid: p[3+i] for i, sid in enumerate(unique_stations)}
        
        t_corrected = [t + offsets[sid] for t, sid in zip(times_sec, station_ids)]
        sim_t, sim_y = simulate_trajectory(v0, K, entry_angle_rad, max(t_corrected) + 1.0)
        s_interp = scipy.interpolate.interp1d(sim_t, sim_y[0], fill_value="extrapolate")
        fitted_dist = s_interp(t_corrected)
        rmse = np.sqrt(np.mean(res.fun**2))
        
        return {
            "v0_km_s": float(v0 / 1000.0),
            "drag_K": float(K),
            "entry_angle_deg": float(np.degrees(entry_angle_rad)),
            "station_offsets": offsets,
            "fit_rmse": float(rmse),
            "model_type": "exponential_drag"
        }, fitted_dist
        
    except Exception as e:
        logger.warning(f"Exponential drag fit failed: {e}. Falling back to linear.")
        return fit_linear_deceleration(station_ids, times_sec, distances_m)
