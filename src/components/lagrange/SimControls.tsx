import { Pause, Play, RotateCcw } from "lucide-react";
import { POINT_IDS, type PointId, type SystemSolution } from "@/lib/lagrange";

const SPEEDS = [0.5, 1, 2, 5];

interface SimControlsProps {
  running: boolean;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  selected: PointId | null;
  onSelect: (id: PointId | null) => void;
  solution: SystemSolution;
}

export function SimControls({
  running,
  onRun,
  onPause,
  onReset,
  speed,
  onSpeed,
  selected,
  onSelect,
  solution,
}: SimControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface/55 px-5 py-3">
      <div className="flex items-center gap-1">
        <button
          onClick={onRun}
          className={`readout flex items-center gap-1.5 border px-3 py-1.5 text-[0.65rem] tracking-[0.12em] transition ${
            running
              ? "border-stable/50 bg-stable/10 text-stable"
              : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
          }`}
        >
          <Play className="h-3 w-3" /> RUN
        </button>
        <button
          onClick={onPause}
          className={`readout flex items-center gap-1.5 border px-3 py-1.5 text-[0.65rem] tracking-[0.12em] transition ${
            !running
              ? "border-warning/50 bg-warning/10 text-warning"
              : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
          }`}
        >
          <Pause className="h-3 w-3" /> PAUSE
        </button>
        <button
          onClick={onReset}
          className="readout flex items-center gap-1.5 border border-border px-3 py-1.5 text-[0.65rem] tracking-[0.12em] text-muted-foreground transition hover:border-border-strong hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" /> RESET
        </button>
      </div>

      <div className="flex items-center gap-1 border-l border-border pl-4">
        <span className="label-micro mr-1">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            className={`readout border px-2 py-1 text-[0.62rem] transition ${
              speed === s
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <span className="label-micro mr-1 hidden sm:inline">Focus</span>
        {POINT_IDS.map((id) => {
          const p = solution.points[id];
          const active = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(active ? null : id)}
              className={`readout group relative border px-2.5 py-1.5 text-[0.65rem] transition ${
                active
                  ? "accent-glow border-primary/60 bg-primary/12 text-primary"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              {id}
              <span
                className="absolute inset-x-1 bottom-0.5 h-[2px] transition-opacity"
                style={{
                  background: p.stability === "stable" ? "var(--stable)" : "var(--unstable)",
                  opacity: active ? 1 : 0.32,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
