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
  type Vec2,
} from "@/lib/lagrange";
import {
  createInitialSatelliteState,
  normalizedTimeToSeconds,
  secondsToNormalizedTime,
  stepSatellite,
  type SatelliteState,
} from "@/lib/satellitePhysics";

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
  const [satPerturbation, setSatPerturbation] = useState(1e-6);
  const [satelliteState, setSatelliteState] = useState<SatelliteState | null>(null);
  const [satelliteTrail, setSatelliteTrail] = useState<Vec2[]>([]);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const satelliteStateRef = useRef<SatelliteState | null>(null);
  const paramsRef = useRef<SystemParams>(params);
  const runningRef = useRef(running);
  const satActiveRef = useRef(satActive);
  const speedRef = useRef(speed);
  const rafRef = useRef<number | null>(null);
  const firstStepLoggedRef = useRef(false);

  const solution = useMemo(() => solveSystem(params), [params]);

  useEffect(() => {
    satelliteStateRef.current = satelliteState;
  }, [satelliteState]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    satActiveRef.current = satActive;
  }, [satActive]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const initializeSatellite = useCallback(
    (target: PointId) => {
      const point = solution.points[target];
      const base = createInitialSatelliteState(point, params, { x: 0, y: 0 });
      const nextState: SatelliteState = {
        ...base,
        position: {
          x: base.position.x + satPerturbation,
          y: base.position.y + satPerturbation * 0.5,
        },
        valid: true,
        error: null,
      };
      setTime(0);
      setSatelliteState(nextState);
      setSatelliteTrail([nextState.position]);
      satelliteStateRef.current = nextState;
      return nextState;
    },
    [params, satPerturbation, solution],
  );

  useEffect(() => {
    const tick = (now: number) => {
      const currentState = satelliteStateRef.current;
      const currentRunning = runningRef.current;
      const currentActive = satActiveRef.current;
      const currentParams = paramsRef.current;

      if (!currentRunning || !currentActive || !currentState || !currentState.valid) {
        if (!currentRunning || !currentActive) {
          rafRef.current = null;
          return;
        }
        setRunning(false);
        setSatActive(false);
        setTime(normalizedTimeToSeconds(currentState ? currentState.time : 0, currentParams));
        rafRef.current = null;
        return;
      }

const dtNow = lastRef.current === null ? 0 : (now - lastRef.current) / 1000;
lastRef.current = now;

if (dtNow <= 0) {
  rafRef.current = requestAnimationFrame(tick);
  return;
}

const dtTau = secondsToNormalizedTime(dtNow * speedRef.current, currentParams);

      if (!firstStepLoggedRef.current) {
        firstStepLoggedRef.current = true;
        console.log("[satellite-debug] FIRST stepSatellite call", {
          targetPoint: satTarget,
          initialPosition: currentState.position,
          initialVelocity: currentState.velocity,
          perturbation: satPerturbation,
          dtSeconds: dtNow,
          dtNormalized: dtTau,
          params: {
            ...currentParams,
            primaryMass: currentParams.primaryMass,
            secondaryMass: currentParams.secondaryMass,
            separation: currentParams.separation,
          },
        });
      }

      const next = stepSatellite(currentState, dtTau, currentParams, {
        minDistanceNormalized: 1e-9,
        maxAccelerationMagnitude: 1e6,
      });

      if (!firstStepLoggedRef.current) {
        firstStepLoggedRef.current = true;
      }

      console.log("[satellite-debug] stepSatellite result", {
        targetPoint: satTarget,
        returnedPosition: next.state.position,
        returnedVelocity: next.state.velocity,
        returnedValid: next.valid,
        returnedTime: next.state.time,
        error: next.state.error,
      });

      if (!next.valid) {
        setSatelliteState(next.state);
        setSatelliteTrail((trail) => [...trail.slice(-199), next.state.position]);
        setTime(normalizedTimeToSeconds(next.state.time, currentParams));
        setRunning(false);
        setSatActive(false);
        rafRef.current = null;
        return;
      }

      setSatelliteState(next.state);
      setSatelliteTrail((trail) => [...trail.slice(-199), next.state.position]);
      setTime(normalizedTimeToSeconds(next.state.time, currentParams));
      rafRef.current = requestAnimationFrame(tick);
    };

    if (!running || !satActive) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastRef.current = null;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running, satActive]);

  const lastRef = useRef<number | null>(null);

  const status =
    satelliteState && !satelliteState.valid ? "INVALID" : !running ? "PAUSED" : satActive ? "SAT RUNNING" : "READY";

  const onParamsChange = useCallback((next: Partial<SystemParams>) => {
    setParams((p) => ({ ...p, ...next }));
  }, []);

  const onPreset = useCallback((id: PresetId) => {
    setParams(paramsFromPreset(id));
  }, []);

  const reset = () => {
    setSatActive(false);
    setRunning(false);
    setSelected(satTarget);
    const resetState = initializeSatellite(satTarget);
    setSatelliteState(resetState);
    setSatelliteTrail([resetState.position]);
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
          setSatActive(false);
          setRunning(false);
          const nextState = initializeSatellite(id);
          setSatelliteState(nextState);
          setSatelliteTrail([nextState.position]);
        }}
        active={satActive}
        onToggle={() => {
          if (satActive) {
            setSatActive(false);
            setRunning(false);
            return;
          }
          if (!satelliteState) {
            const nextState = initializeSatellite(satTarget);
            setSatelliteState(nextState);
            setSatelliteTrail([nextState.position]);
          }
          setSatActive(true);
          setRunning(true);
          setSelected(satTarget);
        }}
        time={time}
        satelliteState={satelliteState}
        perturbation={satPerturbation}
        onPerturbationChange={setSatPerturbation}
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
              satellite={
                satelliteState
                  ? { active: satActive, target: satTarget, state: satelliteState, trail: satelliteTrail }
                  : null
              }
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
            onRun={() => {
              if (!satelliteState) {
                const nextState = initializeSatellite(satTarget);
                setSatelliteState(nextState);
                setSatelliteTrail([nextState.position]);
              }
              setSatActive(true);
              setRunning(true);
              setSelected(satTarget);
            }}
            onPause={() => {
              setSatActive(false);
              setRunning(false);
            }}
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
        <aside className="hidden w-[312px] shrink-0 border-l border-border bg-panel/80 shadow-[inset_14px_0_24px_-24px_oklch(0_0_0/80%)] xl:block">
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
