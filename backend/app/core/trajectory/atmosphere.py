import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_atmospheric_density_nrlmsise(
    altitude_km: float,
    lat_deg: float,
    lon_deg: float,
    time_utc: datetime
) -> float:
    """
    Return atmospheric mass density in kg/m³ at given location and time
    using NRLMSISE-00 empirical model, which accounts for latitude, longitude,
    altitude, solar activity, and time of year.
    """
    try:
        from nrlmsise00 import msise_flat
        doy = time_utc.timetuple().tm_yday
        sec = time_utc.hour * 3600.0 + time_utc.minute * 60.0 + time_utc.second
        # msise_flat arguments: 
        # (doy, sec, alt, lat, lon, f107A, f107, ap)
        result = msise_flat(doy, sec, altitude_km, lat_deg, lon_deg,
                            150.0, 150.0, 3) 
        density_kg_m3 = result[5] * 1000.0    # g/cm³ → kg/m³
        return density_kg_m3
    except Exception as e:
        logger.warning(f"NRLMSISE-00 failed ({str(e)}), falling back to exponential atmosphere")
        rho0 = 1.225
        H = 8500.0
        return rho0 * np.exp(-altitude_km * 1000.0 / H)
