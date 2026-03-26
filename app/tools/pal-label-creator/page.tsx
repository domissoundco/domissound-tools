"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

const PRESETS = {
  ld5: { label: "LD5", widthMm: 178, heightMm: 127 },
  ld6: { label: "LD6", widthMm: 210, heightMm: 150 },
  ld7: { label: "LD7", widthMm: 290, heightMm: 190 },
  custom: { label: "CUSTOM", widthMm: 210, heightMm: 150 },
} as const;

type PresetKey = keyof typeof PRESETS;

const PX_PER_MM = 3;

function mmToPx(mm: number) {
  return Math.round(mm * PX_PER_MM);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getContrastTextColor(hex: string) {
  const clean = hex.replace("#", "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#111111" : "#ffffff";
}

function estimateFontSize(
  text: string,
  startSize: number,
  maxWidth: number,
  minSize: number
) {
  let size = startSize;
  while (size > minSize) {
    const estimatedWidth = text.length * size * 0.56;
    if (estimatedWidth <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

function splitIntoTwoLines(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [""];
  const words = trimmed.split(/\s+/);
  if (words.length <= 2) return [trimmed];

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

export default function PalLabelCreatorPage() {
  const [size, setSize] = useState<PresetKey>("ld5");
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(150);

  const [artistName, setArtistName] = useState("Band / Artist Name");
  const [tourName, setTourName] = useState("Tour / Production");
  const [companyName, setCompanyName] = useState("DOMISSOUNDCO");
  const [dishId, setDishId] = useState("LD5-01");
  const [notes, setNotes] = useState("PAL DISH • HANDLE WITH CARE");

  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [bandLogo, setBandLogo] = useState<string | null>(null);

  const [topColor, setTopColor] = useState("#ffffff");
  const [middleColor, setMiddleColor] = useState("#ffffff");
  const [bottomColor, setBottomColor] = useState("#d9d9d9");
  const [autoTextColor, setAutoTextColor] = useState(true);
  const [manualTextColor, setManualTextColor] = useState("#111111");

  const [showSafeArea, setShowSafeArea] = useState(true);

  const [bandScale, setBandScale] = useState(100);
  const [bandX, setBandX] = useState(50);
  const [bandY, setBandY] = useState(45);
  const [isDraggingBand, setIsDraggingBand] = useState(false);

  const [companyScale, setCompanyScale] = useState(100);
  const [companyX, setCompanyX] = useState(14);
  const [companyY, setCompanyY] = useState(10);
  const [isDraggingCompany, setIsDraggingCompany] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const preset = useMemo(() => {
    if (size === "custom") {
      return {
        label: "CUSTOM",
        widthMm: clamp(customWidth || 210, 50, 1200),
        heightMm: clamp(customHeight || 150, 50, 1200),
      };
    }
    return PRESETS[size];
  }, [size, customWidth, customHeight]);

  useEffect(() => {
    setDishId(size === "custom" ? "CUSTOM-01" : `${size.toUpperCase()}-01`);
  }, [size]);

  const widthPx = mmToPx(preset.widthMm);
  const heightPx = mmToPx(preset.heightMm);

  const safeInset = Math.max(16, Math.round(Math.min(widthPx, heightPx) * 0.045));
  const topHeight = Math.round(heightPx * 0.22);
  const bottomHeight = Math.round(heightPx * 0.18);
  const contentTop = topHeight;
  const contentBottom = heightPx - bottomHeight;
  const contentHeight = contentBottom - contentTop;

  const topTextColor = autoTextColor ? getContrastTextColor(topColor) : manualTextColor;
  const middleTextColor = autoTextColor
    ? getContrastTextColor(middleColor)
    : manualTextColor;
  const bottomTextColor = autoTextColor
    ? getContrastTextColor(bottomColor)
    : manualTextColor;

  const artistLines = splitIntoTwoLines(artistName.toUpperCase());
  const longestArtistLine = artistLines.reduce((a, b) => (a.length >= b.length ? a : b), "");
  const artistFontSize = estimateFontSize(
    longestArtistLine,
    Math.round(heightPx * 0.09),
    widthPx - safeInset * 2 - 30,
    16
  );

  const tourFontSize = estimateFontSize(
    tourName.toUpperCase(),
    Math.round(heightPx * 0.04),
    widthPx - safeInset * 2 - 60,
    12
  );

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
    target: "company" | "band"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    if (target === "company") setCompanyLogo(dataUrl);
    if (target === "band") setBandLogo(dataUrl);
    event.target.value = "";
  }

  function exportSvg() {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `${dishId || "pal-label"}.svg`);
  }

  function exportPng() {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${dishId || "pal-label"}.png`);
        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };
    img.src = svgUrl;
  }

  function printLabel() {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>PAL Label</title>
          <style>
            @page { size: ${preset.widthMm}mm ${preset.heightMm}mm; margin: 0; }
            html, body { margin: 0; padding: 0; }
            body { width: ${preset.widthMm}mm; height: ${preset.heightMm}mm; }
            .page { width: ${preset.widthMm}mm; height: ${preset.heightMm}mm; }
            svg { width: 100%; height: 100%; display: block; }
          </style>
        </head>
        <body>
          <div class="page">${svgString}</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const bandBoxWidth = widthPx * 0.5 * (bandScale / 100);
  const bandBoxHeight = contentHeight * 0.55 * (bandScale / 100);
  const bandBoxX = clamp(
    (bandX / 100) * widthPx - bandBoxWidth / 2,
    safeInset,
    widthPx - safeInset - bandBoxWidth
  );
  const bandBoxY = clamp(
    (bandY / 100) * heightPx - bandBoxHeight / 2,
    contentTop + 10,
    contentBottom - bandBoxHeight - 10
  );

  const companyBoxWidth = widthPx * 0.35 * (companyScale / 100);
  const companyBoxHeight = topHeight * 0.9 * (companyScale / 100);
  const companyBoxX = clamp(
    (companyX / 100) * widthPx - companyBoxWidth / 2,
    safeInset,
    widthPx - safeInset - companyBoxWidth
  );
  const companyBoxY = clamp(
    (companyY / 100) * heightPx - companyBoxHeight / 2,
    8,
    heightPx - companyBoxHeight - 8
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#111111",
      }}
    >
      <div
        style={{
          maxWidth: 1450,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 24,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: 28, margin: 0, marginBottom: 8, color: "#111111" }}>
            PAL Label Creator
          </h1>
          <p style={{ color: "#555555", marginTop: 0 }}>DOMISSOUNDCO web tool</p>

          <div style={{ marginBottom: 18 }}>
            <label style={{ color: "#111111", fontWeight: 600 }}>Label size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as PresetKey)}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                color: "#111111",
                background: "#ffffff",
              }}
            >
              <option value="ld5">LD5 / 178 × 127 mm</option>
              <option value="ld6">LD6 / 210 × 150 mm</option>
              <option value="ld7">LD7 / 290 × 190 mm</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {size === "custom" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ color: "#111111", fontWeight: 600 }}>Width (mm)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 6,
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    color: "#111111",
                    background: "#ffffff",
                  }}
                />
              </div>
              <div>
                <label style={{ color: "#111111", fontWeight: 600 }}>Height (mm)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 6,
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    color: "#111111",
                    background: "#ffffff",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Artist / band name</label>
              <input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  color: "#111111",
                  background: "#ffffff",
                }}
              />
            </div>

            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Tour / production</label>
              <input
                value={tourName}
                onChange={(e) => setTourName(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  color: "#111111",
                  background: "#ffffff",
                }}
              />
            </div>

            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Company name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  color: "#111111",
                  background: "#ffffff",
                }}
              />
            </div>

            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Dish / case ID</label>
              <input
                value={dishId}
                onChange={(e) => setDishId(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  color: "#111111",
                  background: "#ffffff",
                }}
              />
            </div>

            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Bottom notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  color: "#111111",
                  background: "#ffffff",
                }}
              />
            </div>
          </div>

          <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Company logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "company")}
                style={{ display: "block", marginTop: 6, color: "#111111" }}
              />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Band logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "band")}
                style={{ display: "block", marginTop: 6, color: "#111111" }}
              />
            </div>
          </div>

          <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Top area colour</label>
              <input type="color" value={topColor} onChange={(e) => setTopColor(e.target.value)} style={{ display: "block", marginTop: 6 }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Middle area colour</label>
              <input type="color" value={middleColor} onChange={(e) => setMiddleColor(e.target.value)} style={{ display: "block", marginTop: 6 }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Bottom area colour</label>
              <input type="color" value={bottomColor} onChange={(e) => setBottomColor(e.target.value)} style={{ display: "block", marginTop: 6 }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="autoTextColor"
                type="checkbox"
                checked={autoTextColor}
                onChange={(e) => setAutoTextColor(e.target.checked)}
              />
              <label htmlFor="autoTextColor" style={{ color: "#111111", fontWeight: 600 }}>
                Auto text contrast
              </label>
            </div>

            {!autoTextColor && (
              <div>
                <label style={{ color: "#111111", fontWeight: 600 }}>Manual text colour</label>
                <input
                  type="color"
                  value={manualTextColor}
                  onChange={(e) => setManualTextColor(e.target.value)}
                  style={{ display: "block", marginTop: 6 }}
                />
              </div>
            )}
          </div>

          <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Band logo scale: {bandScale}%</label>
              <input type="range" min="40" max="180" value={bandScale} onChange={(e) => setBandScale(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Band logo X: {bandX}%</label>
              <input type="range" min="20" max="80" value={bandX} onChange={(e) => setBandX(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Band logo Y: {bandY}%</label>
              <input type="range" min="20" max="70" value={bandY} onChange={(e) => setBandY(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Company logo scale: {companyScale}%</label>
              <input type="range" min="40" max="300" value={companyScale} onChange={(e) => setCompanyScale(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Company logo X: {companyX}%</label>
              <input type="range" min="5" max="40" value={companyX} onChange={(e) => setCompanyX(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ color: "#111111", fontWeight: 600 }}>Company logo Y: {companyY}%</label>
              <input type="range" min="5" max="95" value={companyY} onChange={(e) => setCompanyY(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="showSafeArea"
                type="checkbox"
                checked={showSafeArea}
                onChange={(e) => setShowSafeArea(e.target.checked)}
              />
              <label htmlFor="showSafeArea" style={{ color: "#111111", fontWeight: 600 }}>
                Show safe area guides
              </label>
            </div>
          </div>

          <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

          <div style={{ display: "grid", gap: 10 }}>
            <button onClick={exportSvg} style={{ padding: 12, borderRadius: 10, border: "1px solid #d1d5db", background: "#ffffff", color: "#111111", cursor: "pointer" }}>
              Export SVG
            </button>
            <button onClick={exportPng} style={{ padding: 12, borderRadius: 10, border: "1px solid #d1d5db", background: "#ffffff", color: "#111111", cursor: "pointer" }}>
              Export PNG
            </button>
            <button onClick={printLabel} style={{ padding: 12, borderRadius: 10, border: "1px solid #d1d5db", background: "#ffffff", color: "#111111", cursor: "pointer" }}>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            overflow: "auto",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#111111" }}>Live preview</h2>
          <p style={{ color: "#555555" }}>
            {preset.widthMm} × {preset.heightMm} mm
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 700,
              background: "#f3f4f6",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              width={widthPx}
              height={heightPx}
              viewBox={`0 0 ${widthPx} ${heightPx}`}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                if (isDraggingBand) {
                  setBandX(x);
                  setBandY(y);
                }

                if (isDraggingCompany) {
                  setCompanyX(x);
                  setCompanyY(y);
                }
              }}
              onMouseUp={() => {
                setIsDraggingBand(false);
                setIsDraggingCompany(false);
              }}
              onMouseLeave={() => {
                setIsDraggingBand(false);
                setIsDraggingCompany(false);
              }}
              style={{ maxWidth: "100%", maxHeight: "75vh", boxShadow: "0 12px 30px rgba(0,0,0,0.18)" }}
            >
              <rect width={widthPx} height={heightPx} fill={middleColor} />
              <rect x="0" y="0" width={widthPx} height={topHeight} fill={topColor} />
              <rect x="0" y={heightPx - bottomHeight} width={widthPx} height={bottomHeight} fill={bottomColor} />
              <rect x="1.5" y="1.5" width={widthPx - 3} height={heightPx - 3} fill="none" stroke="#111111" strokeWidth="3" />

              {showSafeArea && (
                <rect
                  x={safeInset}
                  y={safeInset}
                  width={widthPx - safeInset * 2}
                  height={heightPx - safeInset * 2}
                  fill="none"
                  stroke="#9ca3af"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                />
              )}

              {companyLogo ? (
                <image
                  href={companyLogo}
                  x={companyBoxX}
                  y={companyBoxY}
                  width={companyBoxWidth}
                  height={companyBoxHeight}
                  preserveAspectRatio="xMidYMid meet"
                  onMouseDown={() => setIsDraggingCompany(true)}
                  style={{ cursor: "grab" }}
                />
              ) : (
                <text
                  x={safeInset}
                  y={topHeight * 0.62}
                  fontSize={Math.round(topHeight * 0.3)}
                  fontWeight="700"
                  fill={topTextColor}
                >
                  {companyName.toUpperCase()}
                </text>
              )}

              {bandLogo ? (
                <image
                  href={bandLogo}
                  x={bandBoxX}
                  y={bandBoxY}
                  width={bandBoxWidth}
                  height={bandBoxHeight}
                  preserveAspectRatio="xMidYMid meet"
                  onMouseDown={() => setIsDraggingBand(true)}
                  style={{ cursor: "grab" }}
                />
              ) : (
                <>
                  <text
                    x={widthPx / 2}
                    y={artistLines.length > 1 ? contentTop + contentHeight * 0.4 : contentTop + contentHeight * 0.48}
                    textAnchor="middle"
                    fontSize={artistFontSize}
                    fontWeight="800"
                    fill={middleTextColor}
                  >
                    {artistLines[0]}
                  </text>
                  {artistLines[1] && (
                    <text
                      x={widthPx / 2}
                      y={contentTop + contentHeight * 0.56}
                      textAnchor="middle"
                      fontSize={artistFontSize}
                      fontWeight="800"
                      fill={middleTextColor}
                    >
                      {artistLines[1]}
                    </text>
                  )}
                </>
              )}

              <text
                x={widthPx / 2}
                y={contentTop + contentHeight * 0.78}
                textAnchor="middle"
                fontSize={tourFontSize}
                fontWeight="600"
                fill={middleTextColor}
              >
                {tourName.toUpperCase()}
              </text>

              <text
                x={safeInset}
                y={heightPx - bottomHeight * 0.55}
                fontSize={Math.round(bottomHeight * 0.28)}
                fontWeight="800"
                fill={bottomTextColor}
              >
                {dishId.toUpperCase()}
              </text>

              <text
                x={widthPx - safeInset}
                y={heightPx - bottomHeight * 0.55}
                textAnchor="end"
                fontSize={Math.round(bottomHeight * 0.18)}
                fontWeight="600"
                fill={bottomTextColor}
              >
                {notes.toUpperCase()}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}