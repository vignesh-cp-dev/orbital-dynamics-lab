import { InstrumentSlider } from "./InstrumentSlider";
import {
  PRESETS,
  formatDistance,
  formatMass,
  type PresetId,
  type SystemParams,
} from "@/lib/lagrange";

interface ControlPanelProps {
  params: SystemParams;
  onParamsChange: (next: Partial<SystemParams>) => void;
  onPreset: (id: PresetId) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border px-5 py-5">
      <h3 className="label-micro mb-3 text-foreground/70">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ControlPanel({ params, onParamsChange, onPreset }: ControlPanelProps) {
  const logMass = (m: number) => Math.log10(m);

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <Section title="Presets">
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => {
            const active = params.presetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPreset(p.id)}
                className={`readout border px-1.5 py-2 text-[0.62rem] tracking-[0.06em] transition ${
                  active
                    ? "accent-glow border-primary/60 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Primary Body">
        <div className="flex items-center justify-between">
          <input
            value={params.primaryName}
            onChange={(e) => onParamsChange({ primaryName: e.target.value, presetId: "custom" })}
            className="w-full border-b border-border bg-transparent pb-1 text-sm font-medium text-foreground outline-none transition focus:border-primary/60"
          />
        </div>
        <InstrumentSlider
          label="Mass"
          value={logMass(params.primaryMass)}
          min={20}
          max={31}
          step={0.01}
          onChange={(v) => onParamsChange({ primaryMass: 10 ** v, presetId: "custom" })}
          readout={formatMass(params.primaryMass)}
          unit="kg"
        />
      </Section>

      <Section title="Secondary Body">
        <input
          value={params.secondaryName}
          onChange={(e) => onParamsChange({ secondaryName: e.target.value, presetId: "custom" })}
          className="w-full border-b border-border bg-transparent pb-1 text-sm font-medium text-foreground outline-none transition focus:border-primary/60"
        />
        <InstrumentSlider
          label="Mass"
          value={logMass(params.secondaryMass)}
          min={19}
          max={Math.max(19.5, logMass(params.primaryMass))}
          step={0.01}
          onChange={(v) => onParamsChange({ secondaryMass: 10 ** v, presetId: "custom" })}
          readout={formatMass(params.secondaryMass)}
          unit="kg"
        />
      </Section>

      <Section title="Separation">
        <InstrumentSlider
          label="Distance"
          value={Math.log10(params.separation)}
          min={4}
          max={9}
          step={0.005}
          onChange={(v) => onParamsChange({ separation: 10 ** v, presetId: "custom" })}
          readout={formatDistance(params.separation)}
        />
        <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
          Body separation defines the characteristic length scale; all Lagrange geometry is solved in
          normalised units and rescaled for display.
        </p>
      </Section>
    </div>
  );
}
