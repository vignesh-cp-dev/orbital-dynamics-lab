import { useMemo } from "react";
import type { LagrangePoint, PointId, SystemParams, SystemSolution } from "@/lib/lagrange";

interface OrbitalViewProps {
  params: SystemParams;
  solution: SystemSolution;
  selected: PointId | null;
  hovered: PointId | null;
  onSelect: (id: PointId | null) => void;
  onHover: (id: PointId | null) => void;
  /** seconds of simulated time, drives subtle motion */
  time: number;
  satellite: { active: boolean; target: PointId } | null;
}

const VIEW = 4; // world units across (separation = 1)

function stabilityColor(p: LagrangePoint) {
  return p.stability === "stable" ? "var(--stable)" : "var(--unstable)";
}

export function OrbitalView({
  params,
  solution,
  selected,
  hovered,
  onSelect,
  onHover,
  time,
  satellite,
}: OrbitalViewProps) {
  const half = VIEW / 2;
  const focus = selected ? solution.points[selected] : null;
  const zoom = focus ? 2.1 : 1;
  const fx = focus ? focus.pos.x : 0;
  const fy = focus ? -focus.pos.y : 0;

  const secondaryOrbitR = Math.hypot(
    solution.secondary.x - 0,
    solution.secondary.y - 0,
  );
  const primaryOrbitR = Math.abs(solution.primary.x);

  const epochAngle = (time * 6) % 360;
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => {
        const r = ((i * 2654435761) % 1000) / 1000;
        const r2 = ((i * 40503) % 997) / 997;
        const r3 = ((i * 7919) % 89) / 89;
        return { x: -half + r * VIEW, y: -half + r2 * VIEW, o: 0.08 + r3 * 0.3, s: 0.004 + r3 * 0.006 };
      }),
    [half],
  );

  const satAngle = time * 42;

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* ambient field */}
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, oklch(0.3 0.05 220 / 22%), transparent 70%)",
        }}
      />

      <svg
        viewBox={`${-half} ${-half} ${VIEW} ${VIEW}`}
        className="relative h-full w-full"
        onClick={() => onSelect(null)}
      >
        <defs>
          <radialGradient id="bodyPrimary" cx="38%" cy="34%">
            <stop offset="0%" stopColor="oklch(0.86 0.09 215)" />
            <stop offset="55%" stopColor="oklch(0.58 0.09 235)" />
            <stop offset="100%" stopColor="oklch(0.3 0.05 250)" />
          </radialGradient>
          <radialGradient id="bodySecondary" cx="36%" cy="32%">
            <stop offset="0%" stopColor="oklch(0.92 0.01 240)" />
            <stop offset="60%" stopColor="oklch(0.68 0.012 250)" />
            <stop offset="100%" stopColor="oklch(0.36 0.01 250)" />
          </radialGradient>
          <radialGradient id="haze" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.8 0.14 205 / 40%)" />
            <stop offset="100%" stopColor="oklch(0.8 0.14 205 / 0%)" />
          </radialGradient>
        </defs>

        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="white" opacity={s.o} />
        ))}

        <g
          style={{
            transform: `translate(0px, 0px) scale(${zoom}) translate(${-fx}px, ${-fy}px)`,
            transformOrigin: "0px 0px",
            transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* reference axes */}
          <line
            x1={-half * 2}
            y1={0}
            x2={half * 2}
            y2={0}
            stroke="var(--border-strong)"
            strokeWidth={0.0035}
            strokeDasharray="0.05 0.03"
          />
          <line
            x1={0}
            y1={-half * 2}
            x2={0}
            y2={half * 2}
            stroke="var(--border)"
            strokeWidth={0.0035}
            strokeDasharray="0.05 0.03"
          />

          {/* orbits */}
          <circle
            cx={0}
            cy={0}
            r={secondaryOrbitR}
            fill="none"
            stroke="oklch(0.8 0.14 205 / 30%)"
            strokeWidth={0.005}
          />
          <circle
            cx={0}
            cy={0}
            r={primaryOrbitR}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={0.004}
            strokeDasharray="0.04 0.03"
          />

          {/* rotating epoch marker on the secondary orbit */}
          <g style={{ transform: `rotate(${epochAngle}deg)`, transformOrigin: "0px 0px" }}>
            <circle
              cx={secondaryOrbitR}
              cy={0}
              r={0.012}
              fill="oklch(0.8 0.14 205)"
              opacity={0.55}
            />
          </g>

          {/* trojan triangle */}
          <polyline
            points={`${solution.primary.x},0 ${solution.points.L4.pos.x},${-solution.points.L4.pos.y} ${solution.secondary.x},0 ${solution.points.L5.pos.x},${-solution.points.L5.pos.y} ${solution.primary.x},0`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={0.003}
            strokeDasharray="0.03 0.025"
          />

          {/* bodies */}
          <circle
            cx={solution.primary.x}
            cy={0}
            r={solution.primaryRadius * 3}
            fill="url(#haze)"
            opacity={0.5}
          />
          <circle
            cx={solution.primary.x}
            cy={0}
            r={solution.primaryRadius}
            fill="url(#bodyPrimary)"
          />
          <text
            x={solution.primary.x}
            y={solution.primaryRadius + 0.09}
            textAnchor="middle"
            fill="var(--foreground)"
            fontSize={0.052}
            fontFamily="var(--font-numeric)"
            letterSpacing="0.02"
            opacity={0.85}
          >
            {params.primaryName.toUpperCase()}
          </text>

          <circle
            cx={solution.secondary.x}
            cy={0}
            r={solution.secondaryRadius * 2.6}
            fill="url(#haze)"
            opacity={0.35}
          />
          <circle
            cx={solution.secondary.x}
            cy={0}
            r={solution.secondaryRadius}
            fill="url(#bodySecondary)"
          />
          <text
            x={solution.secondary.x}
            y={-solution.secondaryRadius - 0.05}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize={0.046}
            fontFamily="var(--font-numeric)"
            opacity={0.9}
          >
            {params.secondaryName.toUpperCase()}
          </text>

          {/* lagrange points */}
          {solution.orderedPoints.map((p) => {
            const isSel = selected === p.id;
            const isHov = hovered === p.id;
            const cx = p.pos.x;
            const cy = -p.pos.y;
            const color = stabilityColor(p);
            return (
              <g
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(isSel ? null : p.id);
                }}
                onMouseEnter={() => onHover(p.id)}
                onMouseLeave={() => onHover(null)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={cx} cy={cy} r={0.075} fill="transparent" />
                {(isSel || isHov) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={0.05}
                    fill="none"
                    stroke={color}
                    strokeWidth={0.004}
                    opacity={0.7}
                    style={{
                      transformOrigin: `${cx}px ${cy}px`,
                      animation: "pulse-ring 1.9s ease-out infinite",
                    }}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 0.034 : 0.024}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.005}
                  opacity={isSel || isHov ? 1 : 0.62}
                  style={{ transition: "all 220ms ease" }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 0.013 : 0.009}
                  fill={color}
                  style={{ transition: "all 220ms ease" }}
                />
                {isSel && (
                  <>
                    <line
                      x1={cx - 0.09}
                      y1={cy}
                      x2={cx - 0.05}
                      y2={cy}
                      stroke={color}
                      strokeWidth={0.004}
                    />
                    <line
                      x1={cx + 0.05}
                      y1={cy}
                      x2={cx + 0.09}
                      y2={cy}
                      stroke={color}
                      strokeWidth={0.004}
                    />
                  </>
                )}
                <text
                  x={cx + 0.045}
                  y={cy - 0.038}
                  fill={isSel || isHov ? "var(--foreground)" : "var(--muted-foreground)"}
                  fontSize={0.056}
                  fontFamily="var(--font-numeric)"
                  style={{ transition: "fill 200ms ease" }}
                >
                  {p.id}
                </text>
              </g>
            );
          })}

          {/* satellite */}
          {satellite?.active && (
            <g>
              {(() => {
                const t = solution.points[satellite.target];
                const cx = t.pos.x;
                const cy = -t.pos.y;
                const rx = 0.115;
                const ry = 0.05;
                const rad = (satAngle * Math.PI) / 180;
                const sx = cx + rx * Math.cos(rad);
                const sy = cy + ry * Math.sin(rad);
                return (
                  <>
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      fill="none"
                      stroke="oklch(0.8 0.14 205 / 55%)"
                      strokeWidth={0.004}
                      strokeDasharray="0.02 0.015"
                    />
                    <circle cx={sx} cy={sy} r={0.028} fill="url(#haze)" />
                    <circle cx={sx} cy={sy} r={0.011} fill="oklch(0.92 0.11 205)" />
                    <text
                      x={sx + 0.03}
                      y={sy + 0.02}
                      fill="var(--primary)"
                      fontSize={0.04}
                      fontFamily="var(--font-numeric)"
                    >
                      SAT-01
                    </text>
                  </>
                );
              })()}
            </g>
          )}
        </g>
      </svg>

      {/* corner readouts */}
      <div className="pointer-events-none absolute left-4 top-4 space-y-1">
        <div className="label-micro">Rotating Frame · Barycentric</div>
        <div className="readout text-[0.68rem] text-muted-foreground">
          SCALE 1.000 = {(params.separation / 1000).toFixed(0)} k km
        </div>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 text-right">
        <div className="label-micro">Epoch T+</div>
        <div className="readout text-[0.72rem] text-primary">{time.toFixed(2)} s</div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-4">
        <Legend color="var(--stable)" label="Stable" />
        <Legend color="var(--unstable)" label="Unstable" />
        <Legend color="oklch(0.8 0.14 205)" label="Orbit path" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span className="label-micro">{label}</span>
    </div>
  );
}
