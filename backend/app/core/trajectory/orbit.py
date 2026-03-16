from skyfield.api import Topos, load
from skyfield.elementslib import osculating_elements_of
from skyfield.positionlib import Barycentric
from skyfield.constants import AU_M
import numpy as np
from datetime import datetime
import logging
from app.core.trajectory.coordinate_transforms import radec_to_unit_vector

logger = logging.getLogger(__name__)

def compute_orbital_elements(
    radiant_ra_deg: float,
    radiant_dec_deg: float,
    velocity_geocentric_km_s: float,
    event_time_utc: datetime
) -> dict:
    """
    Computes Heliocentric Keplerian orbital elements from Earth-relative radiant and velocity.
    Uses Python Skyfield library (JPL DE421 ephemeris).
    """
    try:
        ts = load.timescale()
        eph = load('de421.bsp')
        
        earth = eph['earth']
        sun = eph['sun']
        
        t = ts.from_datetime(event_time_utc)
        
        earth_pos = earth.at(t).position.m
        earth_vel = earth.at(t).velocity.m_per_s
        
        # Geocentric velocity vector (anti-radiant direction)
        unit_vg = -radec_to_unit_vector(radiant_ra_deg, radiant_dec_deg)
        vg_vec_m_s = unit_vg * (velocity_geocentric_km_s * 1000.0)
        
        # Heliocentric meteoroid state
        heliocentric_pos = earth_pos  # Approx earth center
        heliocentric_vel = earth_vel + vg_vec_m_s
        
        # We need barycentric state for Skyfield objects to generate elements
        meteor_barycentric = Barycentric(heliocentric_pos / AU_M, heliocentric_vel / (AU_M / 86400.0), t=t)
        
        elements = osculating_elements_of(meteor_barycentric, sun)
        
        return {
            "a_au": float(elements.semi_major_axis.au),
            "e": float(elements.eccentricity),
            "i_deg": float(elements.inclination.degrees),
            "omega_deg": float(elements.argument_of_periapsis.degrees),
            "big_omega_deg": float(elements.longitude_of_ascending_node.degrees),
            "q_au": float(elements.periapsis_distance.au),
            "success": True
        }
    except Exception as e:
        logger.error(f"Failed to compute orbital elements: {e}")
        return {
            "a_au": None, "e": None, "i_deg": None,
            "omega_deg": None, "big_omega_deg": None, "q_au": None,
            "success": False
        }
