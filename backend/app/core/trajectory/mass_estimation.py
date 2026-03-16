import numpy as np
from typing import List, Tuple, Dict

def absolute_magnitude_to_power(abs_magnitude: float, zero_point_watts: float = 1500.0) -> float:
    """
    Convert absolute magnitude to radiated power in Watts.
    Zero-point: 0 mag ≈ 1500 W for meteors (Ceplecha 1976 standard)
    """
    return zero_point_watts * 10.0**(-abs_magnitude / 2.5)

def luminous_efficiency(velocity_km_s: float) -> float:
    """
    Verniani (1965) empirical relation: τ = 0.7 * v^(-0.6) for v in km/s
    Clamped to physically meaningful range [0.005, 0.5]
    """
    tau = 0.7 * (velocity_km_s ** -0.6)
    return float(np.clip(tau, 0.005, 0.5))

def estimate_mass_from_light_curve(
    magnitude_time_series: List[Tuple[float, float]],  # [(time_sec, abs_mag)]
    velocity_time_series:  List[Tuple[float, float]],  # [(time_sec, v_km_s)]
    duration_sec: float
) -> Dict:
    """
    Estimates the initial mass of the meteoroid based on luminous efficiency.
    P = τ * 0.5 * v² * |dm/dt| -> Mass = 2 * E_rad / (τ * v_init²)
    """
    if not magnitude_time_series or not velocity_time_series:
        raise ValueError("Empty time series provided for mass estimation")

    # Sort series just in case
    magnitude_time_series.sort(key=lambda x: x[0])
    velocity_time_series.sort(key=lambda x: x[0])

    times = [m[0] for m in magnitude_time_series]
    mags = [m[1] for m in magnitude_time_series]
    powers = [absolute_magnitude_to_power(mag) for mag in mags]

    # Handle edge case where there's only one point
    if len(times) > 1:
        E_radiated = np.trapz(powers, times)
    else:
        E_radiated = powers[0] * duration_sec

    v_mean_km_s = np.mean([v[1] for v in velocity_time_series])
    tau = luminous_efficiency(v_mean_km_s)
    
    v_init_m_s = velocity_time_series[0][1] * 1000.0
    if v_init_m_s <= 0:
        v_init_m_s = 1000.0 # safeguard against div by zero

    mass_kg = 2.0 * E_radiated / (tau * v_init_m_s**2)
    mass_lower = mass_kg / 5.0
    mass_upper = mass_kg * 5.0

    def fmt(m: float) -> str:
        if m < 0.001: return f"{m*1000:.2f} g"
        elif m < 1.0: return f"{m*1000:.0f} g"
        elif m < 1000: return f"{m:.2f} kg"
        else: return f"{m/1000:.2f} t"

    return {
        "mass_kg": float(mass_kg),
        "mass_lower_kg": float(mass_lower),
        "mass_upper_kg": float(mass_upper),
        "mass_display": fmt(mass_kg),
        "mass_lower_display": fmt(mass_lower),
        "mass_upper_display": fmt(mass_upper),
        "luminous_efficiency_tau": round(float(tau), 4),
        "total_radiated_energy_J": round(float(E_radiated), 2),
        "uncertainty_note": "Mass estimates carry factor ~5 uncertainty due to luminous efficiency model.",
        "survivability": "likely_survived" if mass_kg > 0.01 else "likely_ablated_completely"
    }
