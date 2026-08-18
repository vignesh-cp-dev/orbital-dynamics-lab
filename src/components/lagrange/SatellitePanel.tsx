import { Rocket, Square } from "lucide-react";
import {
  POINT_IDS,
  formatDistance,
  satelliteTelemetry,
  type PointId,
  type SystemSolution,
} from "@/lib/lagrange";

interface SatellitePanelProps {
  solution: SystemSolution;
  separationKm: number;
  target: PointId;
  onTarget: (id: PointId) => void;
  active: boolean;
  onToggle: () => void;
  time: number;
}

export function SatellitePanel({
  solution,
  separationKm,
  target,
  onTarget,
  active,
  onToggle,
  time,
}: SatellitePanelProps) {
  const tel = satelliteTelemetry(solution.points[target], time, separationKm);
  const statusColor =
    tel.stability === "nominal"
      ? "var(--stable)"
      : tel.stability === "drifting"
        ? "var(--warning)"
        : "var(--unstable)";

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

      <div className="mt-3 grid grid-cols-2 gap-x-3">
        <Metric label="Sim time" value={`${(active ? tel.elapsed : 0).toFixed(2)} s`} />
        <Metric label="Velocity" value={`${(active ? tel.velocity : 0).toFixed(3)} km/s`} />
        <Metric
          label={`Δ from ${target}`}
          value={active ? formatDistance(tel.offsetKm) : "—"}
        />
        <Metric
          label="Status"
          value={active ? tel.stability.toUpperCase() : "IDLE"}
          color={active ? statusColor : undefined}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
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
