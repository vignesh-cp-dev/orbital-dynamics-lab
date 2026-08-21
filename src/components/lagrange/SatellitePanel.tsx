import { Rocket, Square } from "lucide-react";
import {
  POINT_IDS,
  formatDistance,
  type PointId,
  type SystemSolution,
} from "@/lib/lagrange";
import {
  normalizedTimeToSeconds,
  type SatelliteState,
} from "@/lib/satellitePhysics";

interface SatellitePanelProps {
  solution: SystemSolution;
  separationKm: number;
  target: PointId;
  onTarget: (id: PointId) => void;
  active: boolean;
  onToggle: () => void;
  time: number;
  satelliteState: SatelliteState | null;
  perturbation: number;
  onPerturbationChange: (v: number) => void;
}

export function SatellitePanel({
  solution,
  separationKm,
  target,
  onTarget,
  active,
  onToggle,
  time,
  satelliteState,
  perturbation,
  onPerturbationChange,
}: SatellitePanelProps) {
  const point = solution.points[target];
  const selectedPosition = satelliteState?.position ?? point.pos;
  const distanceFromTarget = Math.hypot(
    selectedPosition.x - point.pos.x,
    selectedPosition.y - point.pos.y,
  );
  const velocityMagnitude = satelliteState
    ? Math.hypot(satelliteState.velocity.x, satelliteState.velocity.y)
    : 0;
  const status = satelliteState?.valid === false ? "INVALID" : active ? "RUNNING" : "IDLE";
  const statusColor =
    status === "RUNNING"
      ? "var(--stable)"
      : status === "INVALID"
        ? "var(--unstable)"
        : "var(--warning)";

  return (
    <div className="border-t border-border px-4 py-4">
      <h3 className="label-micro mb-3 text-foreground/70">Satellite Simulation</h3>

      <div className="mb-3 grid grid-cols-5 gap-1">
        {POINT_IDS.map((id) => (
          <button
            key={id}
            onClick={() => onTarget(id)}
            className={`readout border py-1.5 text-[0.65rem] transition ${
              target === id
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      <button
        onClick={onToggle}
        className={`readout flex w-full items-center justify-center gap-2 border px-3 py-2.5 text-[0.68rem] tracking-[0.14em] transition ${
          active
            ? "border-unstable/50 bg-unstable/10 text-unstable"
            : "accent-glow border-primary/60 bg-primary/12 text-primary hover:bg-primary/20"
        }`}
      >
        {active ? <Square className="h-3 w-3" /> : <Rocket className="h-3.5 w-3.5" />}
        {active ? "STOP SIMULATION" : "RUN SATELLITE SIMULATION"}
      </button>

      <div className="mt-3 space-y-2 border border-border bg-surface/35 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="label-micro text-foreground/70">Perturbation</span>
          <span className="readout text-[0.62rem] text-primary">{perturbation.toExponential(2)}</span>
        </div>
        <input
          type="range"
          min={1e-8}
          max={1e-4}
          step={1e-8}
          value={perturbation}
          onChange={(e) => onPerturbationChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3">
        <Metric label="Sim time" value={`${time.toFixed(2)} s`} />
        <Metric label="Velocity" value={`${(active ? velocityMagnitude : 0).toFixed(4)} nd` } />
        <Metric
          label={`Δ from ${target}`}
          value={satelliteState ? formatDistance(distanceFromTarget * separationKm) : "—"}
        />
        <Metric label="Status" value={status} color={statusColor} />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string | undefined }) {
  return (
    <div className="border-b border-border py-1.5">
      <div className="label-micro">{label}</div>
      <div
        className="readout mt-1 text-[0.72rem]"
        style={{ color: color ?? "var(--foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}
