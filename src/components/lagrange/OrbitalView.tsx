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

  const secondaryOrbitR = Math.hypot(solution.secondary.x - 0, solution.secondary.y - 0);
  const primaryOrbitR = Math.abs(solution.primary.x);

  const epochAngle = (time * 6) % 360;
  const stars = useMemo(
    () =>
      Array.from({ length: 130 }).map((_, i) => {
        const r = ((i * 2654435761) % 1000) / 1000;
        const r2 = ((i * 40503) % 997) / 997;
        const r3 = ((i * 7919) % 89) / 89;
        return {
          x: -half + r * VIEW,
          y: -half + r2 * VIEW,
          o: 0.06 + r3 * 0.26,
          s: 0.0035 + r3 * 0.005,
          d: 2.4 + r3 * 5,
        };
      }),
    [half],
  );

  const satAngle = time * 42;

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* ambient field */}
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 58% at 50% 45%, oklch(0.34 0.055 220 / 26%), transparent 72%)",
        }}
      />

      <svg
        viewBox={`${-half} ${-half} ${VIEW} ${VIEW}`}
        className="relative h-full w-full"
        onClick={() => onSelect(null)}
      >
        <defs>
          <radialGradient id="bodyPrimary" cx="34%" cy="30%" r="78%">
            <stop offset="0%" stopColor="oklch(0.9 0.08 210)" />
            <stop offset="38%" stopColor="oklch(0.66 0.1 232)" />
            <stop offset="78%" stopColor="oklch(0.4 0.07 245)" />
            <stop offset="100%" stopColor="oklch(0.22 0.04 250)" />
          </radialGradient>
          <radialGradient id="bodySecondary" cx="33%" cy="28%" r="80%">
            <stop offset="0%" stopColor="oklch(0.93 0.008 240)" />
            <stop offset="45%" stopColor="oklch(0.74 0.01 250)" />
            <stop offset="82%" stopColor="oklch(0.46 0.008 250)" />
            <stop offset="100%" stopColor="oklch(0.27 0.006 250)" />
          </radialGradient>
          {/* atmospheric limb — thin bright edge, no neon */}
          <radialGradient id="limbPrimary" cx="50%" cy="50%">
            <stop offset="82%" stopColor="oklch(0.8 0.14 205 / 0%)" />
            <stop offset="96%" stopColor="oklch(0.8 0.14 205 / 34%)" />
            <stop offset="100%" stopColor="oklch(0.8 0.14 205 / 0%)" />
          </radialGradient>
          <radialGradient id="haze" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.8 0.14 205 / 26%)" />
            <stop offset="60%" stopColor="oklch(0.8 0.14 205 / 8%)" />
            <stop offset="100%" stopColor="oklch(0.8 0.14 205 / 0%)" />
          </radialGradient>
          <radialGradient id="hazeGrey" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.85 0.01 250 / 18%)" />
            <stop offset="100%" stopColor="oklch(0.85 0.01 250 / 0%)" />
          </radialGradient>
        </defs>

        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.s}
            fill="white"
            opacity={s.o}
            style={{ animation: `marker-breathe ${s.d}s ease-in-out ${i % 7}s infinite` }}
          />
        ))}

        <g
          style={{
            transform: `translate(0px, 0px) scale(${zoom}) translate(${-fx}px, ${-fy}px)`,
            transformOrigin: "0px 0px",
            transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* reference axes — quietest layer */}
          <line
            x1={-half * 2}
            y1={0}
            x2={half * 2}
            y2={0}
            stroke="var(--border-strong)"
            strokeWidth={0.003}
            strokeDasharray="0.05 0.04"
            opacity={0.75}
          />
          <line
            x1={0}
            y1={-half * 2}
            x2={0}
            y2={half * 2}
            stroke="var(--border)"
            strokeWidth={0.003}
            strokeDasharray="0.05 0.04"
            opacity={0.6}
          />

          {/* barycentre marker */}
          <g opacity={0.7}>
            <circle cx={0} cy={0} r={0.016} fill="none" stroke="var(--border-strong)" strokeWidth={0.004} />
            <circle cx={0} cy={0} r={0.004} fill="var(--muted-foreground)" />
          </g>

          {/* construction lines (Lagrange geometry) — mid layer */}
          <polyline
            points={`${solution.primary.x},0 ${solution.points.L4.pos.x},${-solution.points.L4.pos.y} ${solution.secondary.x},0 ${solution.points.L5.pos.x},${-solution.points.L5.pos.y} ${solution.primary.x},0`}
            fill="none"
            stroke="oklch(0.72 0.05 205 / 34%)"
            strokeWidth={0.0028}
            strokeDasharray="0.028 0.024"
          />

          {/* primary reference path (secondary body orbit) — strongest path */}
          <circle
            cx={0}
            cy={0}
            r={secondaryOrbitR}
            fill="none"
            stroke="oklch(0.8 0.14 205 / 46%)"
            strokeWidth={0.0055}
          />
          <circle
            cx={0}
            cy={0}
            r={secondaryOrbitR}
            fill="none"
            stroke="oklch(0.92 0.12 205 / 70%)"
            strokeWidth={0.0055}
            strokeDasharray="0.09 0.55"
            style={{ animation: "dash-flow 4s linear infinite" }}
          />
          {/* primary body orbit — faint counterpart */}
          <circle
            cx={0}
            cy={0}
            r={primaryOrbitR}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={0.0035}
            strokeDasharray="0.035 0.03"
            opacity={0.8}
          />

          {/* rotating epoch marker on the secondary orbit */}
          <g style={{ transform: `rotate(${epochAngle}deg)`, transformOrigin: "0px 0px" }}>
            <circle cx={secondaryOrbitR} cy={0} r={0.026} fill="url(#haze)" />
            <circle cx={secondaryOrbitR} cy={0} r={0.011} fill="oklch(0.92 0.11 205)" opacity={0.85} />
          </g>

          {/* bodies */}
          <circle
            cx={solution.primary.x}
            cy={0}
            r={solution.primaryRadius * 3.4}
            fill="url(#haze)"
          />
          <circle cx={solution.primary.x} cy={0} r={solution.primaryRadius} fill="url(#bodyPrimary)" />
          <circle
            cx={solution.primary.x}
            cy={0}
            r={solution.primaryRadius * 1.06}
            fill="url(#limbPrimary)"
          />
          <circle
            cx={solution.primary.x}
            cy={0}
            r={solution.primaryRadius}
            fill="none"
            stroke="oklch(0.86 0.1 205 / 30%)"
            strokeWidth={0.0035}
          />
          <text
            x={solution.primary.x}
            y={solution.primaryRadius + 0.105}
            textAnchor="middle"
            fill="var(--foreground)"
            fontSize={0.055}
            fontFamily="var(--font-numeric)"
            letterSpacing="0.035"
            opacity={0.9}
          >
            {params.primaryName.toUpperCase()}
          </text>

          <circle
            cx={solution.secondary.x}
            cy={0}
            r={solution.secondaryRadius * 3}
            fill="url(#hazeGrey)"
          />
          <circle
            cx={solution.secondary.x}
            cy={0}
            r={solution.secondaryRadius}
            fill="url(#bodySecondary)"
          />
          <circle
            cx={solution.secondary.x}
            cy={0}
            r={solution.secondaryRadius}
            fill="none"
            stroke="oklch(0.9 0.01 250 / 26%)"
            strokeWidth={0.003}
          />
          <text
            x={solution.secondary.x}
            y={-solution.secondaryRadius - 0.055}
            textAnchor="middle"
            fill="var(--foreground)"
            fontSize={0.048}
            fontFamily="var(--font-numeric)"
            letterSpacing="0.03"
            opacity={0.8}
          >
            {params.secondaryName.toUpperCase()}
          </text>

          {/* lagrange points */}
          {solution.orderedPoints.map((p) => {
            const isSel = selected === p.id;
            const isHov = hovered === p.id;
            const active = isSel || isHov;
            const cx = p.pos.x;
            const cy = -p.pos.y;
            const color = stabilityColor(p);
            const labelW = 0.115;
            const labelH = 0.072;
            const above = p.id === "L4" || p.id === "L5";
            const lx = cx + 0.052;
            const ly = above ? cy - 0.098 : cy + 0.038;
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
                <circle cx={cx} cy={cy} r={0.085} fill="transparent" />

                {/* always-on breathing halo keeps markers findable on a projector */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={0.042}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.0045}
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    animation: `marker-breathe ${active ? 2.2 : 3.6}s ease-in-out infinite`,
                  }}
                />
                {active && (
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

                {/* crosshair reticle */}
                <g stroke={color} strokeWidth={0.0035} opacity={active ? 0.95 : 0.55}>
                  <line x1={cx - 0.046} y1={cy} x2={cx - 0.024} y2={cy} />
                  <line x1={cx + 0.024} y1={cy} x2={cx + 0.046} y2={cy} />
                  <line x1={cx} y1={cy - 0.046} x2={cx} y2={cy - 0.024} />
                  <line x1={cx} y1={cy + 0.024} x2={cx} y2={cy + 0.046} />
                </g>

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 0.026 : 0.02}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.0055}
                  opacity={active ? 1 : 0.8}
                  style={{ transition: "all 220ms ease" }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 0.012 : 0.009}
                  fill={color}
                  style={{ transition: "all 220ms ease" }}
                />

                {/* boxed technical label — high contrast, fixed footprint */}
                <line
                  x1={cx + 0.018}
                  y1={above ? cy - 0.026 : cy + 0.026}
                  x2={lx + 0.006}
                  y2={above ? ly + labelH : ly}
                  stroke={color}
                  strokeWidth={0.0028}
                  opacity={0.5}
                />
                <rect
                  x={lx}
                  y={ly}
                  width={labelW}
                  height={labelH}
                  fill="oklch(0.14 0.008 250 / 88%)"
                  stroke={color}
                  strokeWidth={0.0032}
                  opacity={active ? 1 : 0.85}
                />
                <text
                  x={lx + labelW / 2}
                  y={ly + labelH * 0.72}
                  textAnchor="middle"
                  fill={color}
                  fontSize={0.05}
                  fontFamily="var(--font-numeric)"
                  letterSpacing="0.02"
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
                      stroke="var(--warning)"
                      strokeWidth={0.0038}
                      strokeDasharray="0.016 0.014"
                      opacity={0.85}
                      style={{ animation: "dash-flow 1.6s linear infinite" }}
                    />
                    <circle cx={sx} cy={sy} r={0.03} fill="url(#haze)" />
                    <circle cx={sx} cy={sy} r={0.0105} fill="var(--warning)" />
                    <text
                      x={sx + 0.03}
                      y={sy + 0.024}
                      fill="var(--warning)"
                      fontSize={0.042}
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

      {/* focus vignette keeps attention on the simulation */}
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* corner readouts */}
      <div className="pointer-events-none absolute left-5 top-5 space-y-1.5">
        <div className="readout text-[0.78rem] tracking-[0.16em] text-foreground/90">
          {params.primaryName.toUpperCase()} — {params.secondaryName.toUpperCase()} SYSTEM
        </div>
        <div className="label-micro">Rotating Frame · Barycentric</div>
        <div className="readout text-[0.68rem] text-muted-foreground">
          SCALE 1.000 = {(params.separation / 1000).toFixed(0)} k km
        </div>
      </div>
      <div className="pointer-events-none absolute right-5 top-5 text-right">
        <div className="label-micro">Epoch T+</div>
        <div className="readout text-[0.78rem] text-primary">{time.toFixed(2)} s</div>
      </div>
      <div className="pointer-events-none absolute bottom-5 left-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Legend color="var(--stable)" label="Stable point" />
        <Legend color="var(--unstable)" label="Unstable point" />
        <Legend color="oklch(0.8 0.14 205)" label="Orbit path" />
        <Legend color="var(--warning)" label="Satellite track" />
      </div>
      {!selected && (
        <div className="pointer-events-none absolute bottom-5 right-5 text-right">
          <div className="label-micro">Select L1–L5 to inspect</div>
        </div>
      )}
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
