import numpy as np
import scipy.integrate
from typing import Dict, List, Tuple
from app.core.trajectory.coordinate_transforms import geodetic_to_ecef, ecef_to_geodetic
from app.core.trajectory.atmosphere import get_atmospheric_density_nrlmsise
from datetime import datetime

def compute_dark_flight(
    mass_kg: float,
    end_height_m: float,
    end_lat_deg: float,
    end_lon_deg: float,
    end_velocity_km_s: float,
    zenith_angle_deg: float,
    azimuth_deg: float,
    time_utc: datetime
) -> Dict:
    """
    Simulates dark flight portion (after luminous phase) to predict meteorite strewn field.
    Returns impact location and simulated path.
    """
    if mass_kg < 0.01:
        return {
            "survived": False,
            "impact_lat": None,
            "impact_lon": None,
            "path_coordinates": []
        }

    # Start coordinates
    P0_ecef = geodetic_to_ecef(end_lat_deg, end_lon_deg, end_height_m)
    
    # Very simplistic 2D Cartesian fall model mapped to ECEF for demonstration
    # Real dark flight involves specific atmospheric wind profiles, rotating Earth Coriolis etc.
    # Below is a streamlined numerical integration of drag + gravity
    # in local horizontal plane.
    
    drag_coeff = 1.0  # Roughly typical
    density_stone = 3000.0 # kg/m^3
    area = np.pi * ((3.0 * mass_kg) / (4.0 * np.pi * density_stone))**(2.0/3.0)
    drag_constant = 0.5 * drag_coeff * area / mass_kg
    
    g = 9.81
    
    # State: [x(horiz), y(horiz_perp), z(downward_vert), vx, vy, vz]
    v_init_m_s = end_velocity_km_s * 1000.0
    vx0 = v_init_m_s * np.sin(np.radians(zenith_angle_deg))
    vy0 = 0.0 # Ignore cross-track wind for now
    vz0 = v_init_m_s * np.cos(np.radians(zenith_angle_deg))
    
    def rhs(t, state):
        x, y, z, vx, vy, vz = state
        if z >= end_height_m:
            return [vx, vy, vz, 0, 0, 0] # Hit ground
            
        h = end_height_m - z
        rho = get_atmospheric_density_nrlmsise(h/1000.0, end_lat_deg, end_lon_deg, time_utc)
        v = np.sqrt(vx**2 + vy**2 + vz**2)
        
        ax = -drag_constant * rho * v * vx
        ay = -drag_constant * rho * v * vy
        az = g - drag_constant * rho * v * vz
        
        return [vx, vy, vz, ax, ay, az]

    state0 = [0.0, 0.0, 0.0, vx0, vy0, vz0]
    res = scipy.integrate.solve_ivp(
        rhs, (0, 600), state0, method='RK45', 
        events=lambda t, y: end_height_m - y[2], 
        max_step=0.5
    )
    
    if len(res.y[0]) == 0 or res.t[-1] == 600:
        return {
            "survived": False, 
            "impact_lat": None, "impact_lon": None, "path_coordinates": []
        }
        
    final_x = res.y[0][-1]
    final_z = res.y[2][-1]
    
    # Simple un-rotation of local coordinates back to geodetic approx
    # (Azimuth mapping: N is 0, E is 90)
    az_rad = np.radians(azimuth_deg)
    d_lat_m = final_x * np.cos(az_rad)
    d_lon_m = final_x * np.sin(az_rad)
    
    r_earth = 6371000.0
    impact_lat = end_lat_deg + np.degrees(d_lat_m / r_earth)
    impact_lon = end_lon_deg + np.degrees(d_lon_m / (r_earth * np.cos(np.radians(end_lat_deg))))
    
    # Path coordinates for UI
    path_coords = []
    for x, z in zip(res.y[0][::10], res.y[2][::10]):
        step_lat = end_lat_deg + np.degrees((x * np.cos(az_rad)) / r_earth)
        step_lon = end_lon_deg + np.degrees((x * np.sin(az_rad)) / (r_earth * np.cos(np.radians(end_lat_deg))))
        height = end_height_m - z
        path_coords.append([step_lon, step_lat, float(height)])
        
    path_coords.append([impact_lon, impact_lat, 0.0])

    return {
        "survived": True,
        "impact_lat": float(impact_lat),
        "impact_lon": float(impact_lon),
        "impact_mass_kg": float(mass_kg * 0.8), # Approx 20% ablation in dark flight
        "path_coordinates": path_coords,
        "strewn_field_ellipse": {
            "center": [impact_lon, impact_lat],
            "semi_major_m": 5000.0,
            "semi_minor_m": 1500.0,
            "angle_deg": azimuth_deg
        }
    }
