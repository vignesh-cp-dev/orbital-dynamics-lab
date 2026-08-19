import {
  POINT_PROFILES,
  formatDistance,
  formatRatio,
  type LagrangePoint,
  type PointId,
  type SystemParams,
  type SystemSolution,
} from "@/lib/lagrange";

interface ContextPanelProps {
  params: SystemParams;
  solution: SystemSolution;
  selected: PointId | null;
  status: string;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="label-micro">{label}</span>
      <span
        className={`readout text-right text-[0.72rem] ${accent ? "text-primary" : "text-foreground/90"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StabilityIndicator({ point }: { point: LagrangePoint }) {
  const level = point.stability === "stable" ? 5 : point.stability === "metastable" ? 3 : 1;
  const color =
    point.stability === "stable"
      ? "var(--stable)"
      : point.stability === "metastable"
        ? "var(--warning)"
        : "var(--unstable)";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="label-micro">Stability</span>
        <span
          className="readout text-[0.7rem] uppercase tracking-[0.12em]"
          style={{ color }}
        >
          {point.stability}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="h-1 flex-1 transition-colors duration-300"
            style={{ background: i < level ? color : "var(--secondary)" }}
          />
        ))}
      </div>
      <p className="text-[0.66rem] text-muted-foreground">
        {point.stability === "stable"
          ? "Passive libration — station-keeping not required."
          : "Saddle equilibrium — periodic correction burns required."}
      </p>
    </div>
  );
}

export function ContextPanel({ params, solution, selected, status }: ContextPanelProps) {
  if (!selected) {
    return (
      <div className="scroll-thin h-full overflow-y-auto px-5 py-5">
        <h3 className="label-micro mb-3 text-foreground/70">System Overview</h3>
        <div>
          <Row label="Current system" value={`${params.primaryName} – ${params.secondaryName}`} />
          <Row label="Mass ratio" value={formatRatio(solution.massRatio)} />
          <Row label="Mass fraction μ" value={solution.mu.toExponential(3)} />
          <Row label="Separation" value={formatDistance(params.separation)} />
          <Row label="Simulation status" value={status} accent />
        </div>

        <div className="mt-6 panel-float rounded-sm p-3.5">
          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
            Five equilibrium solutions exist for the restricted three-body problem. Select a point in
            the visualization or from the navigator below to inspect its geometry, stability class and
            mission use.
          </p>
        </div>

        <div className="mt-6 space-y-1.5">
          <span className="label-micro">Equilibria</span>
          {solution.orderedPoints.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-b-0">
              <span className="readout text-[0.72rem] text-foreground/80">{p.id}</span>
              <span className="readout text-[0.68rem] text-muted-foreground">
                {formatDistance(p.radiusKm)}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: p.stability === "stable" ? "var(--stable)" : "var(--unstable)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const point = solution.points[selected];
  const profile = POINT_PROFILES[selected];

  return (
    <div key={selected} className="scroll-thin h-full animate-in fade-in slide-in-from-right-2 overflow-y-auto px-5 py-5 duration-300">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="readout text-lg font-medium text-primary">{point.id}</span>
        <span className="label-micro text-foreground/70">{profile.title}</span>
      </div>

      <div className="mb-4">
        <Row label="Location" value={profile.location.length > 46 ? "" : profile.location} />
        {profile.location.length > 46 && (
          <p className="pb-2 text-[0.7rem] leading-relaxed text-foreground/80">{profile.location}</p>
        )}
        <Row label="Distance" value={`${formatDistance(point.distanceKm)}`} accent />
        <Row label="Reference" value={point.distanceLabel} />
        <Row label="Barycentric radius" value={formatDistance(point.radiusKm)} />
        <Row label="Frame angle" value={`${point.angleDeg.toFixed(2)}°`} />
      </div>

      <div className="mb-4 panel-float rounded-sm p-3.5">
        <StabilityIndicator point={point} />
      </div>

      <div className="space-y-3">
        <div>
          <span className="label-micro">Dynamics</span>
          <p className="mt-1.5 text-[0.72rem] leading-relaxed text-foreground/80">
            {profile.explanation}
          </p>
        </div>
        <div>
          <span className="label-micro">Typical application</span>
          <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">
            {profile.application}
          </p>
        </div>
      </div>
    </div>
  );
}
