import type { LagrangePoint, SystemParams, Vec2 } from "./lagrange";

/*
 * Satellite dynamics in the normalized rotating CR3BP frame.
 *
 * We intentionally do not use an inertial barycentric model here because the existing
 * Lagrange-point solver already represents the bodies in the rotating barycentric frame:
 *
 *   primary = (-mu, 0)
 *   secondary = (1 - mu, 0)
 *
 * The CR3BP equations are therefore written in normalized rotating coordinates, where the
 * primaries remain fixed and the satellite motion is described relative to that rotating frame.
 * This keeps the physics consistent with the UI's normalized Lagrange-point coordinates and
 * avoids mixing two incompatible reference systems.
 */

export const G = 6.67430e-11;

export interface SatelliteState {
  /** x, y in normalized rotating CR3BP coordinates. */
  position: Vec2;
  /** vx, vy = dx/dtau, dy/dtau in normalized rotating coordinates. */
  velocity: Vec2;
  /** Normalized time tau. Physical time is t = tau / n, where n = sqrt(G (m1 + m2) / d^3). */
  time: number;
  /** True while the state remains finite and physically usable. */
  valid: boolean;
  /** Human-readable explanation if a step becomes invalid. */
  error: string | null;
}

export interface SatelliteConfig {
  /** Distance floor in normalized coordinates to avoid singular division near a body. */
  minDistanceNormalized?: number;
  /** Hard acceleration cap to reject pathological numerical blow-ups. */
  maxAccelerationMagnitude?: number;
}

export interface SimulationStep {
  state: SatelliteState;
  acceleration: Vec2;
  dt: number;
  valid: boolean;
}

function isFiniteVec2(v: Vec2): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y);
}

export function meanMotion(systemParams: SystemParams): number {
  const { primaryMass: m1, secondaryMass: m2, separation: d } = systemParams;
  return Math.sqrt((G * (m1 + m2)) / d ** 3);
}

export function normalizedTimeToSeconds(tau: number, systemParams: SystemParams): number {
  return tau / meanMotion(systemParams);
}

export function secondsToNormalizedTime(t: number, systemParams: SystemParams): number {
  return meanMotion(systemParams) * t;
}

export function normalizedToKilometers(position: Vec2, systemParams: SystemParams): Vec2 {
  return {
    x: position.x * systemParams.separation,
    y: position.y * systemParams.separation,
  };
}

export function kilometersToNormalized(position: Vec2, systemParams: SystemParams): Vec2 {
  return {
    x: position.x / systemParams.separation,
    y: position.y / systemParams.separation,
  };
}

export function lagrangePointToNormalizedPosition(point: LagrangePoint): Vec2 {
  return { x: point.pos.x, y: point.pos.y };
}

function primarySecondaryLocations(systemParams: SystemParams): { primary: Vec2; secondary: Vec2 } {
  const { primaryMass: m1, secondaryMass: m2 } = systemParams;
  const mu = m2 / (m1 + m2);

  return {
    primary: { x: -mu, y: 0 },
    secondary: { x: 1 - mu, y: 0 },
  };
}

export function createInitialSatelliteState(
  point: LagrangePoint,
  systemParams: SystemParams,
  initialVelocity: Vec2 = { x: 0, y: 0 },
): SatelliteState {
  // The default velocity is zero in the rotating frame because an ideal Lagrange point is
  // stationary in that frame. This is the simplest physically consistent starting condition
  // for a satellite placed at an equilibrium location.
  const position = lagrangePointToNormalizedPosition(point);

  return {
    position,
    velocity: {
      x: initialVelocity.x,
      y: initialVelocity.y,
    },
    time: 0,
    valid: true,
    error: null,
  };
}

export function satelliteAcceleration(
  state: Pick<SatelliteState, "position" | "velocity">,
  systemParams: SystemParams,
  config: SatelliteConfig = {},
): Vec2 {
  const { primaryMass: m1, secondaryMass: m2 } = systemParams;
  const mu = m2 / (m1 + m2);
  const { x, y } = state.position;
  const { x: vx, y: vy } = state.velocity;
  const minimumDistance = config.minDistanceNormalized ?? 1e-12;

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(vx) || !Number.isFinite(vy)) {
    return { x: Number.NaN, y: Number.NaN };
  }

  // In the rotating CR3BP frame, the primaries are fixed at the normalized positions above.
  // The coordinate equations are the standard planar CR3BP equations:
  //
  // x'' - 2 y' = x - (1-mu)(x+mu)/r1^3 - mu (x-1+mu)/r2^3
  // y'' + 2 x' = y - (1-mu)y/r1^3 - mu y/r2^3
  //
  // with r1 and r2 computed from the distances from the satellite to the primary and secondary.
  const r1Squared = (x + mu) ** 2 + y ** 2;
  const r2Squared = (x - 1 + mu) ** 2 + y ** 2;

  const safeR1Squared = Math.max(r1Squared, minimumDistance ** 2);
  const safeR2Squared = Math.max(r2Squared, minimumDistance ** 2);
  const r1 = Math.sqrt(safeR1Squared);
  const r2 = Math.sqrt(safeR2Squared);

  const ax =
    2 * vy +
    x -
    ((1 - mu) * (x + mu)) / r1 ** 3 -
    (mu * (x - 1 + mu)) / r2 ** 3;

  const ay =
    -2 * vx +
    y -
    ((1 - mu) * y) / r1 ** 3 -
    (mu * y) / r2 ** 3;

  return {
    x: ax,
    y: ay,
  };
}

function derivative(
  state: Pick<SatelliteState, "position" | "velocity">,
  systemParams: SystemParams,
  config: SatelliteConfig,
): { position: Vec2; velocity: Vec2 } {
  const acceleration = satelliteAcceleration(state, systemParams, config);

  return {
    position: { x: state.velocity.x, y: state.velocity.y },
    velocity: acceleration,
  };
}

export function stepSatellite(
  state: SatelliteState,
  dt: number,
  systemParams: SystemParams,
  config: SatelliteConfig = {},
): SimulationStep {
  const minimumDistance = config.minDistanceNormalized ?? 1e-12;

  if (!state.valid || !Number.isFinite(state.time) || !Number.isFinite(dt) || dt <= 0) {
    return {
      state: {
        ...state,
        valid: false,
        error: "Satellite state is invalid or the requested timestep is non-positive.",
      },
      acceleration: { x: 0, y: 0 },
      dt,
      valid: false,
    };
  }

  if (!isFiniteVec2(state.position) || !isFiniteVec2(state.velocity)) {
    return {
      state: {
        ...state,
        position: { x: Number.NaN, y: Number.NaN },
        velocity: { x: Number.NaN, y: Number.NaN },
        valid: false,
        error: "Satellite state contains NaN or Infinity values.",
      },
      acceleration: { x: Number.NaN, y: Number.NaN },
      dt,
      valid: false,
    };
  }

  const k1 = derivative(state, systemParams, { ...config, minDistanceNormalized: minimumDistance });

  const k2State = {
    position: {
      x: state.position.x + (dt * k1.position.x) / 2,
      y: state.position.y + (dt * k1.position.y) / 2,
    },
    velocity: {
      x: state.velocity.x + (dt * k1.velocity.x) / 2,
      y: state.velocity.y + (dt * k1.velocity.y) / 2,
    },
  };
  const k2 = derivative(k2State, systemParams, { ...config, minDistanceNormalized: minimumDistance });

  const k3State = {
    position: {
      x: state.position.x + (dt * k2.position.x) / 2,
      y: state.position.y + (dt * k2.position.y) / 2,
    },
    velocity: {
      x: state.velocity.x + (dt * k2.velocity.x) / 2,
      y: state.velocity.y + (dt * k2.velocity.y) / 2,
    },
  };
  const k3 = derivative(k3State, systemParams, { ...config, minDistanceNormalized: minimumDistance });

  const k4State = {
    position: {
      x: state.position.x + dt * k3.position.x,
      y: state.position.y + dt * k3.position.y,
    },
    velocity: {
      x: state.velocity.x + dt * k3.velocity.x,
      y: state.velocity.y + dt * k3.velocity.y,
    },
  };
  const k4 = derivative(k4State, systemParams, { ...config, minDistanceNormalized: minimumDistance });

  const nextPosition = {
    x:
      state.position.x +
      (dt / 6) * (k1.position.x + 2 * k2.position.x + 2 * k3.position.x + k4.position.x),
    y:
      state.position.y +
      (dt / 6) * (k1.position.y + 2 * k2.position.y + 2 * k3.position.y + k4.position.y),
  };

  const nextVelocity = {
    x:
      state.velocity.x +
      (dt / 6) * (k1.velocity.x + 2 * k2.velocity.x + 2 * k3.velocity.x + k4.velocity.x),
    y:
      state.velocity.y +
      (dt / 6) * (k1.velocity.y + 2 * k2.velocity.y + 2 * k3.velocity.y + k4.velocity.y),
  };

  const acceleration = satelliteAcceleration(
    { position: nextPosition, velocity: nextVelocity },
    systemParams,
    { ...config, minDistanceNormalized: minimumDistance },
  );

  if (!isFiniteVec2(nextPosition) || !isFiniteVec2(nextVelocity) || !isFiniteVec2(acceleration)) {
    return {
      state: {
        position: nextPosition,
        velocity: nextVelocity,
        time: state.time + dt,
        valid: false,
        error: "RK4 integration produced a non-finite state or acceleration; numerical instability detected.",
      },
      acceleration,
      dt,
      valid: false,
    };
  }

  const maxAccelerationMagnitude = config.maxAccelerationMagnitude ?? 1e6;
  const accelerationMagnitude = Math.hypot(acceleration.x, acceleration.y);
  const violation = accelerationMagnitude > maxAccelerationMagnitude;

  if (violation) {
    return {
      state: {
        position: nextPosition,
        velocity: nextVelocity,
        time: state.time + dt,
        valid: false,
        error: "Acceleration magnitude exceeded the configured safety threshold.",
      },
      acceleration,
      dt,
      valid: false,
    };
  }

  return {
    state: {
      position: nextPosition,
      velocity: nextVelocity,
      time: state.time + dt,
      valid: true,
      error: null,
    },
    acceleration,
    dt,
    valid: true,
  };
}

/*
 * Notes on the model choice:
 *
 * - The rotating CR3BP frame is the correct reference frame for this project because the
 *   Lagrange-point solver already uses the normalized barycentric coordinates and fixes the
 *   primaries at (-mu, 0) and (1-mu, 0).
 * - In the inertial frame, the primary bodies would orbit the barycentre and the satellite would
 *   need a different set of equations. The rotating-frame formulation matches the existing UI data
 *   model and keeps the physics consistent with the fixed equilibrium points.
 * - This is a massless-satellite CR3BP model and intentionally does not include artificial thrust,
 *   drag, or stylized sine/cosine motion. It is designed to be a clean educational basis for later
 *   UI integration and more advanced dynamical analysis.
 */
