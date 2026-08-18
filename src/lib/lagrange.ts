/**
 * Demo physics / data layer for Lagrange Explorer.
 *
 * All values here are analytic approximations with realistic demo numbers.
 * The UI never computes anything itself, so this module can be swapped for a
 * real physics engine without touching component code.
 */

export type PointId = "L1" | "L2" | "L3" | "L4" | "L5";
export const POINT_IDS: PointId[] = ["L1", "L2", "L3", "L4", "L5"];

export type PresetId = "earth-moon" | "sun-earth" | "custom";

export interface SystemParams {
  presetId: PresetId;
  primaryName: string;
  secondaryName: string;
  /** kg */
  primaryMass: number;
  /** kg */
  secondaryMass: number;
  /** km */
  separation: number;
}

export interface Preset extends Omit<SystemParams, "presetId"> {
  id: PresetId;
  label: string;
}

export const PRESETS: Preset[] = [
  {
    id: "earth-moon",
    label: "Earth–Moon",
    primaryName: "Earth",
    secondaryName: "Moon",
    primaryMass: 5.972e24,
    secondaryMass: 7.342e22,
    separation: 384400,
  },
  {
    id: "sun-earth",
    label: "Sun–Earth",
    primaryName: "Sun",
    secondaryName: "Earth",
    primaryMass: 1.989e30,
    secondaryMass: 5.972e24,
    separation: 149.6e6,
  },
  {
    id: "custom",
    label: "Custom",
    primaryName: "Body A",
    secondaryName: "Body B",
    primaryMass: 4.0e24,
    secondaryMass: 2.4e23,
    separation: 520000,
  },
];

export function presetById(id: PresetId): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export function paramsFromPreset(id: PresetId): SystemParams {
  const p = presetById(id);
  return {
    presetId: p.id,
    primaryName: p.primaryName,
    secondaryName: p.secondaryName,
    primaryMass: p.primaryMass,
    secondaryMass: p.secondaryMass,
    separation: p.separation,
  };
}

export interface Vec2 {
  /** normalised by separation, barycentre at origin */
  x: number;
  y: number;
}

export interface LagrangePoint {
  id: PointId;
  /** normalised position in the rotating frame */
  pos: Vec2;
  /** km from the barycentre */
  radiusKm: number;
  /** km from the nearest relevant body */
  distanceKm: number;
  distanceLabel: string;
  stability: "stable" | "unstable" | "metastable";
  angleDeg: number;
}

export interface SystemSolution {
  massRatio: number;
  /** m2 / (m1 + m2) */
  mu: number;
  primary: Vec2;
  secondary: Vec2;
  primaryRadius: number;
  secondaryRadius: number;
  points: Record<PointId, LagrangePoint>;
  orderedPoints: LagrangePoint[];
}

const cbrt = (v: number) => Math.cbrt(v);

export function solveSystem(params: SystemParams): SystemSolution {
  const { primaryMass: m1, secondaryMass: m2, separation: d } = params;
  const mu = m2 / (m1 + m2);

  const primary: Vec2 = { x: -mu, y: 0 };
  const secondary: Vec2 = { x: 1 - mu, y: 0 };

  const hill = cbrt(mu / 3);
  const l1x = secondary.x - hill * (1 - hill / 3);
  const l2x = secondary.x + hill * (1 + hill / 3);
  const l3x = -(1 + (5 * mu) / 12);

  const mk = (
    id: PointId,
    pos: Vec2,
    distanceKm: number,
    distanceLabel: string,
    stability: LagrangePoint["stability"],
  ): LagrangePoint => ({
    id,
    pos,
    radiusKm: Math.hypot(pos.x, pos.y) * d,
    distanceKm,
    distanceLabel,
    stability,
    angleDeg: (Math.atan2(pos.y, pos.x) * 180) / Math.PI,
  });

  const points: Record<PointId, LagrangePoint> = {
    L1: mk(
      "L1",
      { x: l1x, y: 0 },
      Math.abs(secondary.x - l1x) * d,
      `from ${params.secondaryName}`,
      "unstable",
    ),
    L2: mk(
      "L2",
      { x: l2x, y: 0 },
      Math.abs(l2x - secondary.x) * d,
      `from ${params.secondaryName}`,
      "unstable",
    ),
    L3: mk(
      "L3",
      { x: l3x, y: 0 },
      Math.abs(l3x - primary.x) * d,
      `from ${params.primaryName}`,
      "unstable",
    ),
    L4: mk(
      "L4",
      { x: 0.5 - mu, y: Math.sqrt(3) / 2 },
      d,
      `from ${params.primaryName}`,
      mu < 0.0385 ? "stable" : "metastable",
    ),
    L5: mk(
      "L5",
      { x: 0.5 - mu, y: -Math.sqrt(3) / 2 },
      d,
      `from ${params.primaryName}`,
      mu < 0.0385 ? "stable" : "metastable",
    ),
  };

  return {
    massRatio: m1 / m2,
    mu,
    primary,
    secondary,
    primaryRadius: 0.062 + 0.03 * (1 - mu),
    secondaryRadius: 0.026 + 0.05 * Math.min(mu * 3, 0.6),
    points,
    orderedPoints: POINT_IDS.map((id) => points[id]),
  };
}

export interface PointProfile {
  id: PointId;
  title: string;
  location: string;
  explanation: string;
  application: string;
}

export const POINT_PROFILES: Record<PointId, PointProfile> = {
  L1: {
    id: "L1",
    title: "Inner Lagrange Point",
    location: "Between the two bodies, on the line joining them",
    explanation:
      "Gravity of the primary is partially cancelled by the secondary, so a spacecraft here orbits with the same period as the secondary body while sitting closer to the primary.",
    application: "Uninterrupted solar observation and early-warning space weather monitoring.",
  },
  L2: {
    id: "L2",
    title: "Outer Lagrange Point",
    location: "Beyond the secondary body, along the body-to-body axis",
    explanation:
      "The combined pull of both bodies matches the centripetal requirement of the larger orbit, letting a payload trail the secondary permanently in its shadow side.",
    application: "Cryogenic infrared observatories requiring a stable thermal environment.",
  },
  L3: {
    id: "L3",
    title: "Far-Side Lagrange Point",
    location: "Opposite the secondary body, just outside the primary's orbit radius",
    explanation:
      "Diametrically opposite the secondary and permanently hidden behind the primary, this equilibrium is weakly held and perturbed by any third mass in the system.",
    application: "Theoretical relay and far-side survey concepts; no long-lived missions to date.",
  },
  L4: {
    id: "L4",
    title: "Leading Trojan Point",
    location: "60° ahead of the secondary, forming an equilateral triangle",
    explanation:
      "Coriolis forces in the rotating frame curve any drift back toward equilibrium, producing genuinely stable tadpole libration when the mass ratio is below 1:24.96.",
    application: "Natural trojan asteroid reservoirs and long-duration station-keeping-free depots.",
  },
  L5: {
    id: "L5",
    title: "Trailing Trojan Point",
    location: "60° behind the secondary, forming an equilateral triangle",
    explanation:
      "The mirror of L4: stable libration islands where dust and trojan bodies accumulate over geological timescales without active control.",
    application: "Proposed logistics staging areas and space-weather stereoscopic monitoring.",
  },
};

/* ---------- formatting helpers ---------- */

export function formatMass(kg: number): string {
  const exp = Math.floor(Math.log10(kg));
  const mant = kg / 10 ** exp;
  return `${mant.toFixed(3)}e${exp}`;
}

export function formatDistance(km: number): string {
  if (km >= 1e6) return `${(km / 1e6).toFixed(3)} M km`;
  if (km >= 1e3) return `${(km / 1e3).toFixed(2)} k km`;
  return `${km.toFixed(1)} km`;
}

export function formatRatio(ratio: number): string {
  if (ratio >= 1e5) return `1 : ${ratio.toExponential(2)}`;
  return `1 : ${ratio.toFixed(2)}`;
}

/* ---------- satellite demo telemetry ---------- */

export interface SatelliteTelemetry {
  elapsed: number;
  velocity: number;
  offsetKm: number;
  stability: "nominal" | "drifting" | "unstable";
}

export function satelliteTelemetry(
  point: LagrangePoint,
  t: number,
  separationKm: number,
): SatelliteTelemetry {
  const haloKm = separationKm * 0.055;
  const offsetKm = haloKm * (1 + 0.18 * Math.sin(t * 0.9));
  const base = point.stability === "stable" ? 0.94 : 1.31;
  const velocity = base + 0.06 * Math.sin(t * 1.7);
  const stability =
    point.stability === "stable" ? "nominal" : t > 26 ? "unstable" : "drifting";
  return { elapsed: t, velocity, offsetKm, stability };
}
