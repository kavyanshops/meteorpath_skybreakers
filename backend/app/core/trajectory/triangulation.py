import numpy as np
from typing import List, Tuple

def line_of_sight_least_squares(
    station_positions: List[np.ndarray],
    los_vectors: List[np.ndarray]
) -> Tuple[np.ndarray, np.ndarray, float, np.ndarray]:
    """
    Calculates the 3D line closest to all line-of-sight rays.
    """
    A_sum = np.zeros((3, 3))
    b_sum = np.zeros(3)
    I3 = np.eye(3)

    for B_i, u_i in zip(station_positions, los_vectors):
        Ai = I3 - np.outer(u_i, u_i)
        bi = Ai @ B_i
        A_sum += Ai
        b_sum += bi

    # Trajectory origin P0
    P0, _, _, _ = np.linalg.lstsq(A_sum, b_sum, rcond=None)

    # Trajectory direction d_hat
    eigenvalues, eigenvectors = np.linalg.eigh(A_sum)
    d_hat = eigenvectors[:, 0]
    d_hat = d_hat / np.linalg.norm(d_hat)

    # Orientation (meteor MUST fall downwards towards Earth, P0·d_hat < 0)
    # In ECEF, dot product of P0 and d_hat indicates radial direction.
    if np.dot(P0, d_hat) > 0:
        d_hat = -d_hat

    # Convergence angle
    max_angle = 0.0
    for i, u_i in enumerate(los_vectors):
        for j, u_j in enumerate(los_vectors[i+1:], start=i+1):
            angle = np.degrees(np.arccos(np.clip(abs(np.dot(u_i, u_j)), -1.0, 1.0)))
            if angle > max_angle:
                max_angle = angle

    # Residuals
    residuals_arcsec = []
    for B_i, u_i in zip(station_positions, los_vectors):
        t_i = np.dot(B_i - P0, d_hat)
        closest_on_traj = P0 + t_i * d_hat
        closest_on_ray = B_i + np.dot(closest_on_traj - B_i, u_i) * u_i
        
        perp_dist = np.linalg.norm(closest_on_traj - closest_on_ray)
        baseline = np.linalg.norm(B_i - closest_on_traj)
        
        # Calculate angle of error
        residual = np.degrees(np.arctan2(perp_dist, baseline)) * 3600.0
        residuals_arcsec.append(residual)

    return P0, d_hat, max_angle, np.array(residuals_arcsec)


def reject_outliers(
    station_positions: List[np.ndarray],
    los_vectors: List[np.ndarray],
    sigma_threshold: float = 3.0
) -> Tuple[List[np.ndarray], List[np.ndarray], List[int]]:
    """
    Iteratively rejects observations with residuals > threshold.
    """
    clean_pos = list(station_positions)
    clean_vec = list(los_vectors)
    original_indices = list(range(len(station_positions)))
    removed_indices = []

    for _ in range(3):
        if len(clean_pos) < 2:
            break
            
        _, _, _, residuals = line_of_sight_least_squares(clean_pos, clean_vec)
        
        std_res = np.std(residuals)
        
        to_remove = []
        for i, res in enumerate(residuals):
            if res > sigma_threshold * std_res and res > 60.0:
                to_remove.append(i)
                
        if not to_remove:
            break
            
        # Remove backwards to keep indices stable
        for i in reversed(to_remove):
            removed_indices.append(original_indices[i])
            clean_pos.pop(i)
            clean_vec.pop(i)
            original_indices.pop(i)

    return clean_pos, clean_vec, removed_indices


def compute_convergence_angle(los_vectors: List[np.ndarray]) -> float:
    """
    Maximum angle between any pair of LOS vectors in degrees
    """
    max_angle = 0.0
    for i, u_i in enumerate(los_vectors):
        for j, u_j in enumerate(los_vectors[i+1:], start=i+1):
            angle = np.degrees(np.arccos(np.clip(abs(np.dot(u_i, u_j)), -1.0, 1.0)))
            if angle > max_angle:
                max_angle = angle
    return max_angle
