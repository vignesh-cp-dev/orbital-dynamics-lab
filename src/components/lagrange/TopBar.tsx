import { CircleHelp, Settings2, Activity } from "lucide-react";

interface TopBarProps {
  presetLabel: string;
  status: string;
}

export function TopBar({ presetLabel, status }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface/70 px-4 backdrop-blur">
      <div className="flex items-baseline gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-primary" />
            <span
              className="absolute inset-0 rounded-full bg-primary"
              style={{ animation: "pulse-ring 2.4s ease-out infinite" }}
            />
          </span>
          <h1 className="text-sm font-semibold tracking-[0.2em] text-foreground">
            LAGRANGE EXPLORER
          </h1>
        </div>
        <span className="hidden text-[0.68rem] tracking-[0.12em] text-muted-foreground sm:block">
          Orbital Dynamics Laboratory
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 border border-border px-2.5 py-1 md:flex">
          <span className="label-micro">Preset</span>
          <span className="readout text-[0.72rem] text-primary">{presetLabel}</span>
        </div>
        <div className="flex items-center gap-2 border border-border px-2.5 py-1">
          <Activity className="h-3 w-3 text-stable" />
          <span className="readout text-[0.72rem] tracking-[0.14em] text-stable">{status}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Settings"
            className="flex h-7 w-7 items-center justify-center border border-transparent text-muted-foreground transition hover:border-border hover:text-foreground"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Help"
            className="flex h-7 w-7 items-center justify-center border border-transparent text-muted-foreground transition hover:border-border hover:text-foreground"
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
