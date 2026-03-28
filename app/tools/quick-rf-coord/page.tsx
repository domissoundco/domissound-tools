"use client";

import { useState, useMemo } from "react";

const BAND_PRESETS = {
  ch38: {
    name: "UK Ch38 Shared (606.5 – 613.5 MHz)",
    min: 606.5,
    max: 613.5,
  },
};

const DEFAULT_SPACING = 0.4; // MHz

function round(freq: number) {
  return Math.round(freq * 1000) / 1000;
}

export default function Page() {
  const [systems, setSystems] = useState("");
  const [occupied, setOccupied] = useState("");
  const [band] = useState(BAND_PRESETS.ch38);

  const result = useMemo(() => {
    const count = Number(systems);
    if (!count || count <= 0) return null;

    const occupiedList = occupied
      .split(",")
      .map((f) => parseFloat(f.trim()))
      .filter((f) => !isNaN(f));

    const freqs: number[] = [];

    let current = band.min + 0.2; // slight offset from edge

    while (current <= band.max) {
      const tooClose = occupiedList.some(
        (occ) => Math.abs(occ - current) < DEFAULT_SPACING
      );

      const tooCloseExisting = freqs.some(
        (f) => Math.abs(f - current) < DEFAULT_SPACING
      );

      if (!tooClose && !tooCloseExisting) {
        freqs.push(round(current));
      }

      current += DEFAULT_SPACING;
    }

    const suggested = freqs.slice(0, count);

    return {
      suggested,
      maxPossible: freqs.length,
      requested: count,
    };
  }, [systems, occupied, band]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06101f] to-[#0f172a] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-wider"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-md" />
          TOOLS.DOMISSOUND.CO
        </a>

        <h1 className="text-3xl font-semibold">
          Quick RF Coord
        </h1>

        <p className="text-white/70">
          Fast emergency frequency spacing tool for UK Ch38 use.
        </p>

        {/* Inputs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">

          <div>
            <label className="text-sm text-white/60">
              Systems needed
            </label>
            <input
              type="number"
              value={systems}
              onChange={(e) => setSystems(e.target.value)}
              placeholder="e.g. 8"
              className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">
              Band
            </label>
            <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10">
              {band.name}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60">
              Occupied frequencies (optional)
            </label>
            <input
              type="text"
              value={occupied}
              onChange={(e) => setOccupied(e.target.value)}
              placeholder="e.g. 606.7, 607.9"
              className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>
        </div>

        {/* Output */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">

          <h2 className="text-xl font-semibold">
            Suggested Frequencies
          </h2>

          {!result && (
            <p className="text-white/50">
              Enter number of systems to generate plan.
            </p>
          )}

          {result && (
            <>
              <div className="space-y-2">
                {result.suggested.map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-3 py-2 bg-black/30 rounded-lg"
                  >
                    <span>CH{i + 1}</span>
                    <span>{f.toFixed(3)} MHz</span>
                  </div>
                ))}
              </div>

              {result.requested > result.maxPossible && (
                <div className="text-yellow-400 text-sm">
                  ⚠️ Not enough clean spectrum. Max possible ≈ {result.maxPossible}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-white/40">
          Best-effort spacing only. Not a replacement for RF coordination software.
        </p>

      </div>
    </div>
  );
}