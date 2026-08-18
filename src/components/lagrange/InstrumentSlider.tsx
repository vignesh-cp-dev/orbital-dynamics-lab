interface InstrumentSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  readout: string;
  unit?: string;
}

export function InstrumentSlider({
  value,
  min,
  max,
  step = 0.001,
  onChange,
  label,
  readout,
  unit,
}: InstrumentSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="group space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-micro">{label}</span>
        <span className="readout text-[0.72rem] text-foreground/90">
          {readout}
          {unit ? <span className="ml-1 text-muted-foreground">{unit}</span> : null}
        </span>
      </div>

      <div className="relative flex h-4 items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-secondary" />
        <div
          className="absolute left-0 h-[3px] rounded-full bg-primary/80 transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        <div className="pointer-events-none absolute inset-x-0 flex justify-between px-[1px]">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="h-2 w-px bg-border-strong/70" />
          ))}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="relative z-10 h-4 w-full cursor-ew-resize appearance-none bg-transparent outline-none
            [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary
            [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_var(--background),0_0_12px_var(--ring)] [&::-webkit-slider-thumb]:transition-transform group-hover:[&::-webkit-slider-thumb]:scale-110"
        />
      </div>
    </div>
  );
}
