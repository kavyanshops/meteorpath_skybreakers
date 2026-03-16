import numpy as np
from typing import Tuple
from datetime import datetime
from astropy.time import Time

def geodetic_to_ecef(lat_deg: float, lon_deg: float, alt_m: float) -> np.ndarray:
    """
    Convert geographic coordinates to ECEF Cartesian (WGS-84 ellipsoid)
    Returns: np.array([X, Y, Z]) in meters
    """
    a = 6378137.0           # WGS-84 semi-major axis in meters
    f = 1 / 298.257223563   # WGS-84 flattening
    b = a * (1 - f)
    e2 = 1 - (b/a)**2       # first eccentricity squared
    
    lat = np.radians(lat_deg)
    lon = np.radians(lon_deg)
    
    N = a / np.sqrt(1 - e2 * np.sin(lat)**2)   # prime vertical radius of curvature
    X = (N + alt_m) * np.cos(lat) * np.cos(lon)
    Y = (N + alt_m) * np.cos(lat) * np.sin(lon)
    Z = (N * (1 - e2) + alt_m) * np.sin(lat)
    
    return np.array([X, Y, Z])

def ecef_to_geodetic(x: float, y: float, z: float) -> Tuple[float, float, float]:
    """
    Convert ECEF coordinates back to geodetic (lat, lon, alt)
    Returns: (lat_deg, lon_deg, alt_m)
    """
    a = 6378137.0
    f = 1.0 / 298.257223563
    b = a * (1.0 - f)
    e2 = 1.0 - (b/a)**2
    ep2 = (a/b)**2 - 1.0
    
    p = np.sqrt(x**2 + y**2)
    theta = np.arctan2(z * a, p * b)
    
    lat = np.arctan2(
        z + ep2 * b * np.sin(theta)**3,
        p - e2 * a * np.cos(theta)**3
    )
    lon = np.arctan2(y, x)
    
    N = a / np.sqrt(1.0 - e2 * np.sin(lat)**2)
    alt = p / np.cos(lat) - N
    
    return float(np.degrees(lat)), float(np.degrees(lon)), float(alt)

def radec_to_unit_vector(ra_deg: float, dec_deg: float) -> np.ndarray:
    """
    Convert RA/Dec celestial coordinates to 3D unit vector in equatorial frame
    Returns: np.array([x, y, z])
    """
    ra = np.radians(ra_deg)
    dec = np.radians(dec_deg)
    x = np.cos(dec) * np.cos(ra)
    y = np.cos(dec) * np.sin(ra)
    z = np.sin(dec)
    return np.array([x, y, z])

def atmospheric_refraction_correction(elevation_deg: float) -> float:
    """
    Returns refraction correction in degrees for a given elevation angle.
    Uses Bennett's formula. Add to apparent elevation for true elevation.
    """
    el = elevation_deg
    if el < 0:
        return 0.0
    R = 1.02 / np.tan(np.radians(el + 10.3 / (el + 5.11)))
    R /= 60.0   # convert arcminutes to degrees
    return float(R)

def equatorial_to_ecef_rotation(time_utc: datetime) -> np.ndarray:
    """
    3x3 rotation matrix from ICRS equatorial to ECEF at given UTC time
    """
    t = Time(time_utc, scale='utc')
    gmst_rad = t.sidereal_time('mean', 'greenwich').rad
    
    Rz = np.array([
        [ np.cos(gmst_rad), np.sin(gmst_rad), 0],
        [-np.sin(gmst_rad), np.cos(gmst_rad), 0],
        [0,                 0,                1]
    ])
    return Rz

def los_unit_vector_ecef(ra_deg: float, dec_deg: float, time_utc: datetime) -> np.ndarray:
    """
    Convert celestial RA/Dec + time to LOS unit vector in ECEF frame
    """
    equatorial_vec = radec_to_unit_vector(ra_deg, dec_deg)
    # Apply rotation matrix (from equatorial to ECEF)
    Rz = equatorial_to_ecef_rotation(time_utc)
    # We transpose Rz because we want to rotate the coordinate system, 
    # but the usual convention is rotating the vector. Wait, Rz is ECEF = Rz * EQUATORIAL
    ecef_vec = Rz @ equatorial_vec
    return ecef_vec / np.linalg.norm(ecef_vec)
