import numpy as np
from typing import Optional
from sqlmodel import Session, select
from app.models import Shower

def d_criterion(
    a1: float, e1: float, i1: float, omega1: float, node1: float, q1: float,
    a2: float, e2: float, i2: float, omega2: float, node2: float, q2: float
) -> float:
    """
    Drummond D' criterion for measuring orbital similarity.
    Angles must be in degrees. Distances in AU.
    """
    i1_r = np.radians(i1)
    i2_r = np.radians(i2)
    omega1_r = np.radians(omega1)
    omega2_r = np.radians(omega2)
    node1_r = np.radians(node1)
    node2_r = np.radians(node2)
    
    theta = np.arccos(
        np.sin(i1_r)*np.sin(i2_r)*np.cos(node1_r - node2_r) + 
        np.cos(i1_r)*np.cos(i2_r)
    )
    
    pi1 = omega1_r + node1_r
    pi2 = omega2_r + node2_r
    # We use q = a(1-e) instead of e
    
    dq = abs(q1 - q2) / max(q1, q2, 1e-6)
    de = abs(e1 - e2) / max(e1, e2, 1e-6)
    di = abs(theta)  # Simplified from Drummond
    
    d_prime = dq**2 + de**2 + (di/np.pi)**2 
    return float(np.sqrt(d_prime))

def associate_shower(
    db: Session,
    radiant_ra: float,
    radiant_dec: float,
    v_geo_km_s: float,
    orbit: dict = None
) -> Optional[int]:
    """
    Finds meteor shower association by comparing radiant, velocity, and orbital elements
    against known IAU showers in the database.
    """
    # For now, simple closest match in Ra/Dec/V space (Welch criterion proxy)
    showers = db.exec(select(Shower)).all()
    if not showers:
        return None
        
    best_id = None
    min_dist = float('inf')
    
    # Sun-centered longitude (we don't have event time here, so simpler proxy)
    for sh in showers:
        # Distance in angular space
        cos_dist = (np.sin(np.radians(radiant_dec)) * np.sin(np.radians(sh.radiant_dec_deg)) +
                    np.cos(np.radians(radiant_dec)) * np.cos(np.radians(sh.radiant_dec_deg)) *
                    np.cos(np.radians(radiant_ra - sh.radiant_ra_deg)))
        angle_deg = np.degrees(np.arccos(np.clip(cos_dist, -1.0, 1.0)))
        
        # Distance in velocity space
        vel_diff = abs(v_geo_km_s - sh.speed_km_s)
        
        # Arbitrary combined metric (should use D-criterion if orbits available)
        combined_dist = angle_deg + vel_diff * 3.0
        
        if combined_dist < min_dist and angle_deg < 5.0 and vel_diff < 5.0:
            min_dist = combined_dist
            best_id = sh.id
            
    return best_id
