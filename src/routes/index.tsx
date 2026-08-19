import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import { TopBar } from "@/components/lagrange/TopBar";
import { ControlPanel } from "@/components/lagrange/ControlPanel";
import { OrbitalView } from "@/components/lagrange/OrbitalView";
import { ContextPanel } from "@/components/lagrange/ContextPanel";
import { SatellitePanel } from "@/components/lagrange/SatellitePanel";
import { SimControls } from "@/components/lagrange/SimControls";
import { DataStrip } from "@/components/lagrange/DataStrip";
import {
  paramsFromPreset,
  presetById,
  solveSystem,
  type PointId,
  type PresetId,
  type SystemParams,
} from "@/lib/lagrange";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lagrange Explorer — Orbital Dynamics Laboratory" },
      {
        name: "description",
        content:
          "Interactive scientific visualization of the five Lagrange points (L1–L5) in a two-body system, with live geometry, stability data and satellite simulation.",
      },
      { property: "og:title", content: "Lagrange Explorer — Orbital Dynamics Laboratory" },
      {
        property: "og:description",
        content:
          "Explore L1–L5 equilibria of the restricted three-body problem in a mission-control style visualization environment.",
      },
    ],
  }),
  component: Explorer,
});

function Explorer() {
  const [params, setParams] = useState<SystemParams>(() => paramsFromPreset("earth-moon"));
  const [selected, setSelected] = useState<PointId | null>(null);
  const [hovered, setHovered] = useState<PointId | null>(null);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [satTarget, setSatTarget] = useState<PointId>("L1");
  const [satActive, setSatActive] = useState(false);
  const [satTime, setSatTime] = useState(0);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const solution = useMemo(() => solveSystem(params), [params]);

  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  useEffect(() => {
    const tick = (now: number) => {
      const dt = last.current ? (now - last.current) / 1000 : 0;
      last.current = now;
      if (running) {
        setTime((t) => t + dt * speed);
        if (satActive) setSatTime((t) => t + dt * speed);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = 0;
    };
  }, [running, speed, satActive]);

  const status = !running ? "PAUSED" : satActive ? "SAT RUNNING" : "READY";

  const onParamsChange = useCallback((next: Partial<SystemParams>) => {
    setParams((p) => ({ ...p, ...next }));
  }, []);

  const onPreset = useCallback((id: PresetId) => {
    setParams(paramsFromPreset(id));
  }, []);

  const reset = () => {
    setTime(0);
    setSatTime(0);
    setSatActive(false);
    setSelected(null);
    setRunning(true);
  };

  const left = (
    <ControlPanel params={params} onParamsChange={onParamsChange} onPreset={onPreset} />
  );
  const right = (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ContextPanel params={params} solution={solution} selected={selected} status={status} />
      </div>
      <SatellitePanel
        solution={solution}
        separationKm={params.separation}
        target={satTarget}
        onTarget={(id) => {
          setSatTarget(id);
          setSelected(id);
        }}
        active={satActive}
        onToggle={() => {
          setSatActive((a) => !a);
          setSatTime(0);
          setRunning(true);
          setSelected(satTarget);
        }}
        time={satTime}
      />
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar presetLabel={presetById(params.presetId).label} status={status} />

      <div className="flex min-h-0 flex-1">
        {/* left panel — desktop */}
        <aside className="hidden w-[276px] shrink-0 border-r border-border bg-panel/80 shadow-[inset_-14px_0_24px_-24px_oklch(0_0_0/80%)] lg:block">
          {left}
        </aside>

        {/* workspace */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <OrbitalView
              params={params}
              solution={solution}
              selected={selected}
              hovered={hovered}
              onSelect={setSelected}
              onHover={setHovered}
              time={time}
              satellite={satActive ? { active: true, target: satTarget } : null}
            />

            {/* mobile drawer toggles */}
            <div className="absolute left-3 top-3 flex gap-2 lg:hidden">
              <button
                onClick={() => setLeftOpen(true)}
                className="readout flex items-center gap-1.5 border border-border bg-surface/90 px-2.5 py-1.5 text-[0.62rem] text-muted-foreground backdrop-blur"
              >
                <PanelLeft className="h-3 w-3" /> PARAMETERS
              </button>
            </div>
            <div className="absolute right-3 top-3 flex gap-2 lg:hidden">
              <button
                onClick={() => setRightOpen(true)}
                className="readout flex items-center gap-1.5 border border-border bg-surface/90 px-2.5 py-1.5 text-[0.62rem] text-muted-foreground backdrop-blur"
              >
                <PanelRight className="h-3 w-3" /> DATA
              </button>
            </div>
          </div>

          <SimControls
            running={running}
            onRun={() => setRunning(true)}
            onPause={() => setRunning(false)}
            onReset={reset}
            speed={speed}
            onSpeed={setSpeed}
            selected={selected}
            onSelect={setSelected}
            solution={solution}
          />
          <DataStrip solution={solution} />
        </main>

        {/* right panel — desktop */}
        <aside className="hidden w-[300px] shrink-0 border-l border-border bg-panel xl:block">
          {right}
        </aside>
      </div>

      {/* mobile drawers */}
      {leftOpen && (
        <Drawer side="left" onClose={() => setLeftOpen(false)} title="Parameters">
          {left}
        </Drawer>
      )}
      {rightOpen && (
        <Drawer side="right" onClose={() => setRightOpen(false)} title="System Data">
          {right}
        </Drawer>
      )}
    </div>
  );
}

function Drawer({
  side,
  title,
  onClose,
  children,
}: {
  side: "left" | "right";
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`absolute inset-y-0 flex w-[300px] max-w-[85vw] flex-col border-border bg-panel ${
          side === "left"
            ? "left-0 animate-in slide-in-from-left border-r"
            : "right-0 animate-in slide-in-from-right border-l"
        } duration-300`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="label-micro text-foreground/70">{title}</span>
          <button onClick={onClose} className="readout text-[0.68rem] text-muted-foreground">
            CLOSE
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
