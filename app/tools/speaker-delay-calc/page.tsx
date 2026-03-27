"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Copy, RefreshCcw, Settings2, Volume2 } from "lucide-react";

/**
 * Speaker Delay Calc
 * Mobile-first module for tools.domissound.co
 *
 * Drop this into its own module folder, for example:
 * /speaker-delay-calc/SpeakerDelayCalc.tsx
 *
 * Assumptions:
 * - React / Next.js app router friendly
 * - Tailwind CSS available
 * - lucide-react available
 * - Styled to sit alongside existing tool cards/modules
 */

type Mode = "align" | "distanceToDelay" | "delayToDistance";
type Unit = "m" | "ft";
type Condition = "soundcheck" | "show";

type SourcePreset =
  | "Mains"
  | "Subs"
  | "Front Fill"
  | "Outfill"
  | "Delay"
  | "Balcony"
  | "Custom";

const SOURCE_OPTIONS: SourcePreset[] = [
  "Mains",
  "Subs",
  "Front Fill",
  "Outfill",
  "Delay",
  "Balcony",
  "Custom",
];

/**
 * Kept intentionally simple for field use.
 * Soundcheck = slightly cooler / slower
 * Show = slightly warmer / faster
 */
const SPEED_OF_SOUND_MPS: Record<Condition, number> = {
  soundcheck: 343,
  show: 346,
};

const FEET_PER_METRE = 3.28084;
const STORAGE_KEY = "domissound-speaker-delay-calc";

function metresToFeet(value: number) {
  return value * FEET_PER_METRE;
}

function feetToMetres(value: number) {
  return value / FEET_PER_METRE;
}

function round(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getSpeedOfSound(condition: Condition) {
  return SPEED_OF_SOUND_MPS[condition];
}

function distanceToDelayMs(distanceMetres: number, condition: Condition) {
  return (distanceMetres / getSpeedOfSound(condition)) * 1000;
}

function delayMsToDistanceMetres(delayMs: number, condition: Condition) {
  return (delayMs / 1000) * getSpeedOfSound(condition);
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function toMetres(value: number, unit: Unit) {
  return unit === "m" ? value : feetToMetres(value);
}

function fromMetres(valueMetres: number, unit: Unit) {
  return unit === "m" ? valueMetres : metresToFeet(valueMetres);
}

function formatDistance(value: number, unit: Unit, decimals = 2) {
  return `${round(value, decimals)} ${unit}`;
}

function formatMilliseconds(value: number, decimals = 2) {
  return `${round(value, decimals)} ms`;
}

function getDisplaySourceName(preset: SourcePreset, custom: string) {
  if (preset !== "Custom") return preset;
  const trimmed = custom.trim();
  return trimmed.length ? trimmed : "Custom Source";
}

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-zinc-100 text-zinc-900 shadow-sm"
                  : "bg-transparent text-zinc-300 hover:bg-zinc-900",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TripleSegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-zinc-100 text-zinc-900 shadow-sm"
                  : "bg-transparent text-zinc-300 hover:bg-zinc-900",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SourceCard({
  title,
  preset,
  customName,
  distance,
  unit,
  onPresetChange,
  onCustomNameChange,
  onDistanceChange,
}: {
  title: string;
  preset: SourcePreset;
  customName: string;
  distance: string;
  unit: Unit;
  onPresetChange: (value: SourcePreset) => void;
  onCustomNameChange: (value: string) => void;
  onDistanceChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-100">{title}</p>

      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Source Name</span>
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as SourcePreset)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-zinc-100 outline-none transition focus:border-zinc-600"
        >
          {SOURCE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {preset === "Custom" && (
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Custom Label</span>
          <input
            type="text"
            inputMode="text"
            value={customName}
            onChange={(e) => onCustomNameChange(e.target.value)}
            placeholder="Enter source name"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-zinc-600"
          />
        </label>
      )}

      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Distance to {getDisplaySourceName(preset, customName)}</span>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={distance}
            onChange={(e) => onDistanceChange(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 pr-14 text-lg font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-zinc-600"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
            {unit}
          </span>
        </div>
      </label>
    </div>
  );
}

export function SpeakerDelayCalc() {
  const [mode, setMode] = useState<Mode>("align");
  const [unit, setUnit] = useState<Unit>("m");
  const [condition, setCondition] = useState<Condition>("soundcheck");

  const [source1Preset, setSource1Preset] = useState<SourcePreset>("Mains");
  const [source1Custom, setSource1Custom] = useState("");
  const [source1Distance, setSource1Distance] = useState("");

  const [source2Preset, setSource2Preset] = useState<SourcePreset>("Subs");
  const [source2Custom, setSource2Custom] = useState("");
  const [source2Distance, setSource2Distance] = useState("");

  const [singleDistance, setSingleDistance] = useState("");
  const [delayMs, setDelayMs] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.mode) setMode(parsed.mode);
      if (parsed.unit) setUnit(parsed.unit);
      if (parsed.condition) setCondition(parsed.condition);
    } catch {
      // ignore storage issues
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, unit, condition })
      );
    } catch {
      // ignore storage issues
    }
  }, [mode, unit, condition]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const source1Name = getDisplaySourceName(source1Preset, source1Custom);
  const source2Name = getDisplaySourceName(source2Preset, source2Custom);

  const alignResult = useMemo(() => {
    const left = parsePositiveNumber(source1Distance);
    const right = parsePositiveNumber(source2Distance);

    if (left === null || right === null) return null;
    if (left === right) {
      return {
        aligned: true,
        delayMs: 0,
        differenceInUnit: 0,
        differenceMetres: 0,
        applyDelayTo: "Neither",
      } as const;
    }

    const leftMetres = toMetres(left, unit);
    const rightMetres = toMetres(right, unit);
    const differenceMetres = Math.abs(leftMetres - rightMetres);
    const delay = distanceToDelayMs(differenceMetres, condition);
    const applyDelayTo = leftMetres < rightMetres ? source1Name : source2Name;

    return {
      aligned: false,
      delayMs: delay,
      differenceInUnit: fromMetres(differenceMetres, unit),
      differenceMetres,
      applyDelayTo,
    } as const;
  }, [source1Distance, source2Distance, unit, condition, source1Name, source2Name]);

  const distanceResult = useMemo(() => {
    const input = parsePositiveNumber(singleDistance);
    if (input === null) return null;

    const metres = toMetres(input, unit);
    const delay = distanceToDelayMs(metres, condition);
    const alternateUnit: Unit = unit === "m" ? "ft" : "m";

    return {
      delayMs: delay,
      convertedDistance: fromMetres(metres, alternateUnit),
      alternateUnit,
    };
  }, [singleDistance, unit, condition]);

  const reverseResult = useMemo(() => {
    const input = parsePositiveNumber(delayMs);
    if (input === null) return null;

    const metres = delayMsToDistanceMetres(input, condition);
    const feet = metresToFeet(metres);

    return {
      metres,
      feet,
    };
  }, [delayMs, condition]);

  const clearCurrentMode = () => {
    if (mode === "align") {
      setSource1Distance("");
      setSource2Distance("");
      setSource1Preset("Mains");
      setSource1Custom("");
      setSource2Preset("Subs");
      setSource2Custom("");
      return;
    }

    if (mode === "distanceToDelay") {
      setSingleDistance("");
      return;
    }

    setDelayMs("");
  };

  const swapSources = () => {
    setSource1Preset(source2Preset);
    setSource1Custom(source2Custom);
    setSource1Distance(source2Distance);

    setSource2Preset(source1Preset);
    setSource2Custom(source1Custom);
    setSource2Distance(source1Distance);
  };

  const copyResult = async () => {
    let text = "";

    if (mode === "align" && alignResult) {
      text = alignResult.aligned
        ? "Sources are aligned. No delay required."
        : `Delay ${alignResult.applyDelayTo} by ${formatMilliseconds(alignResult.delayMs)}.`;
    }

    if (mode === "distanceToDelay" && distanceResult) {
      text = `Delay: ${formatMilliseconds(distanceResult.delayMs)}.`;
    }

    if (mode === "delayToDistance" && reverseResult) {
      text = `${round(reverseResult.metres, 2)} m / ${round(reverseResult.feet, 2)} ft`;
    }

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-4 text-zinc-100 shadow-2xl shadow-black/20 sm:p-6">
      <div className="space-y-5">
        <div className="space-y-5">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:bg-white/15"
          >
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" />
            TOOLS.DOMISSOUND.CO
          </a>

          <div className="min-w-0">
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl md:text-7xl">
              Speaker Delay Calc
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Fast field calc for aligning mains, subs, fills, delays and more.
            </p>
          </div>
        </div>

        <TripleSegmentedControl
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Align", value: "align" },
            { label: "Dist → Delay", value: "distanceToDelay" },
            { label: "Delay → Dist", value: "delayToDistance" },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <SegmentedControl
            label="Units"
            value={unit}
            onChange={setUnit}
            options={[
              { label: "Metres", value: "m" },
              { label: "Feet", value: "ft" },
            ]}
          />

          <SegmentedControl
            label="Conditions"
            value={condition}
            onChange={setCondition}
            options={[
              { label: "Soundcheck", value: "soundcheck" },
              { label: "Show", value: "show" },
            ]}
          />
        </div>

        {mode === "align" && (
          <div className="space-y-4">
            <SourceCard
              title="Source 1"
              preset={source1Preset}
              customName={source1Custom}
              distance={source1Distance}
              unit={unit}
              onPresetChange={setSource1Preset}
              onCustomNameChange={setSource1Custom}
              onDistanceChange={setSource1Distance}
            />

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={swapSources}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Swap Sources
              </button>
            </div>

            <SourceCard
              title="Source 2"
              preset={source2Preset}
              customName={source2Custom}
              distance={source2Distance}
              unit={unit}
              onPresetChange={setSource2Preset}
              onCustomNameChange={setSource2Custom}
              onDistanceChange={setSource2Distance}
            />
          </div>
        )}

        {mode === "distanceToDelay" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Distance</span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={singleDistance}
                  onChange={(e) => setSingleDistance(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 pr-14 text-lg font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-zinc-600"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                  {unit}
                </span>
              </div>
            </label>
          </div>
        )}

        {mode === "delayToDistance" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Delay</span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={delayMs}
                  onChange={(e) => setDelayMs(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 pr-16 text-lg font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-zinc-600"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                  ms
                </span>
              </div>
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={clearCurrentMode}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Clear
          </button>

          <button
            type="button"
            onClick={copyResult}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy Result"}
          </button>
        </div>

        <div className="rounded-[28px] border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-inner shadow-black/20">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            <Settings2 className="h-4 w-4" />
            Result
          </div>

          {mode === "align" && !alignResult && (
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-zinc-50">Enter two distances</p>
              <p className="text-sm leading-6 text-zinc-400">
                The tool will calculate the time difference and tell you which source to delay.
              </p>
            </div>
          )}

          {mode === "align" && alignResult && (
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">Delay Required</p>
              <p className="text-4xl font-semibold tracking-tight text-zinc-50">
                {formatMilliseconds(alignResult.delayMs)}
              </p>

              {alignResult.aligned ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-lg font-semibold text-zinc-50">Sources are aligned</p>
                  <p className="mt-1 text-sm text-zinc-400">No delay required.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">Apply Delay To</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-50">{alignResult.applyDelayTo}</p>
                  <p className="mt-3 text-sm text-zinc-300">
                    Delay the closer source by <span className="font-semibold text-zinc-50">{formatMilliseconds(alignResult.delayMs)}</span>.
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Distance Difference</p>
                  <p className="mt-2 text-xl font-semibold text-zinc-50">
                    {formatDistance(alignResult.differenceInUnit, unit)}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Equivalent</p>
                  <p className="mt-2 text-xl font-semibold text-zinc-50">
                    {unit === "m"
                      ? formatDistance(metresToFeet(alignResult.differenceMetres), "ft")
                      : formatDistance(alignResult.differenceMetres, "m")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === "distanceToDelay" && !distanceResult && (
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-zinc-50">Enter a distance</p>
              <p className="text-sm leading-6 text-zinc-400">
                Get the equivalent delay in milliseconds for quick speaker timing.
              </p>
            </div>
          )}

          {mode === "distanceToDelay" && distanceResult && (
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">Delay</p>
              <p className="text-4xl font-semibold tracking-tight text-zinc-50">
                {formatMilliseconds(distanceResult.delayMs)}
              </p>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Equivalent Distance</p>
                <p className="mt-2 text-xl font-semibold text-zinc-50">
                  {formatDistance(distanceResult.convertedDistance, distanceResult.alternateUnit)}
                </p>
              </div>
            </div>
          )}

          {mode === "delayToDistance" && !reverseResult && (
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-zinc-50">Enter a delay value</p>
              <p className="text-sm leading-6 text-zinc-400">
                Convert milliseconds back to distance for checking DSP presets and existing settings.
              </p>
            </div>
          )}

          {mode === "delayToDistance" && reverseResult && (
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">Equivalent Distance</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Metres</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-50">{round(reverseResult.metres, 2)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Feet</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-50">{round(reverseResult.feet, 2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs leading-5 text-zinc-500">
          Field-ready estimate. Use measurement software for final alignment and verification at the listening position.
        </p>
      </div>
    </section>
  );}

export default function Page() {
  return <SpeakerDelayCalc />;
}
