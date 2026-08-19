import { formatDistance, formatRatio, type SystemSolution } from "@/lib/lagrange";

export function DataStrip({ solution }: { solution: SystemSolution }) {
  const cells: { label: string; value: string }[] = [
    { label: "Mass Ratio", value: formatRatio(solution.massRatio) },
    { label: "μ", value: solution.mu.toExponential(3) },
    { label: "L1 Distance", value: formatDistance(solution.points.L1.distanceKm) },
    { label: "L2 Distance", value: formatDistance(solution.points.L2.distanceKm) },
    { label: "L3 Distance", value: formatDistance(solution.points.L3.distanceKm) },
    { label: "L4 Angle", value: `${solution.points.L4.angleDeg.toFixed(2)}°` },
    { label: "L5 Angle", value: `${solution.points.L5.angleDeg.toFixed(2)}°` },
  ];

  return (
    <div className="scroll-thin flex shrink-0 items-stretch overflow-x-auto border-t border-border bg-surface/40">
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex min-w-[8.25rem] flex-1 flex-col justify-center gap-1.5 border-r border-border px-4 py-3 last:border-r-0"
        >
          <span className="label-micro whitespace-nowrap">{c.label}</span>
          <span className="readout whitespace-nowrap text-[0.78rem] text-foreground">
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
}
