"use client";

import { useMemo, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type FixtureRow = {
  name: string;
  start: number;
  end: number;
  valid: boolean;
};

export default function FixtureOffsetPage() {
  const [fixtureName, setFixtureName] = useState("Fixture");
  const [startAddress, setStartAddress] = useState("12");
  const [offset, setOffset] = useState("16");
  const [quantity, setQuantity] = useState("8");

  const parsedStart = Number(startAddress);
  const parsedOffset = Number(offset);
  const parsedQuantity = Number(quantity);

  const startInvalid =
    Number.isNaN(parsedStart) || parsedStart < 1 || parsedStart > 512;
  const offsetInvalid =
    Number.isNaN(parsedOffset) || parsedOffset < 1 || parsedOffset > 512;
  const quantityInvalid =
    Number.isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 128;

  const isInvalid = startInvalid || offsetInvalid || quantityInvalid;

  const safeStart = startInvalid ? 1 : Math.floor(parsedStart);
  const safeOffset = offsetInvalid ? 1 : Math.floor(parsedOffset);
  const safeQuantity = quantityInvalid ? 1 : Math.floor(parsedQuantity);

  const rows = useMemo<FixtureRow[]>(() => {
    return Array.from({ length: safeQuantity }, (_, index) => {
      const start = safeStart + index * safeOffset;
      const end = start + safeOffset - 1;
      return {
        name: `${fixtureName || "Fixture"} ${index + 1}`,
        start,
        end,
        valid: start <= 512 && end <= 512,
      };
    });
  }, [fixtureName, safeQuantity, safeStart, safeOffset]);

  const nextFree = useMemo(() => {
    if (!rows.length) return safeStart;
    return rows[rows.length - 1].end + 1;
  }, [rows, safeStart]);

  const overflow = nextFree > 513 || rows.some((row) => !row.valid);

  const panelStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 28,
    boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
    backdropFilter: "blur(12px)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 28%), linear-gradient(180deg, #06101f 0%, #0b1220 48%, #0f172a 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: "#ffffff",
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 12px rgba(34,197,94,0.8)",
              }}
            />
            TOOLS.DOMISSOUND.CO
          </a>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 7vw, 58px)",
              lineHeight: 0.95,
              letterSpacing: -1.4,
              fontWeight: 900,
            }}
          >
            Fixture Offset
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={{ ...panelStyle, padding: 18 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.68)",
                    marginBottom: 6,
                  }}
                >
                  Fixture
                </label>
                <input
                  value={fixtureName}
                  onChange={(e) => setFixtureName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: "2px solid rgba(255,255,255,0.10)",
                    background: "#ffffff",
                    color: "#0b1220",
                    boxSizing: "border-box",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.68)",
                    marginBottom: 6,
                  }}
                >
                  Start Address
                </label>
                <input
                  type="number"
                  min={1}
                  max={512}
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: startInvalid
                      ? "2px solid #ef4444"
                      : "2px solid rgba(255,255,255,0.10)",
                    background: "#ffffff",
                    color: "#0b1220",
                    boxSizing: "border-box",
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.68)",
                    marginBottom: 6,
                  }}
                >
                  Offset / Channels
                </label>
                <input
                  type="number"
                  min={1}
                  max={512}
                  value={offset}
                  onChange={(e) => setOffset(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: offsetInvalid
                      ? "2px solid #ef4444"
                      : "2px solid rgba(255,255,255,0.10)",
                    background: "#ffffff",
                    color: "#0b1220",
                    boxSizing: "border-box",
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.68)",
                    marginBottom: 6,
                  }}
                >
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={128}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: quantityInvalid
                      ? "2px solid #ef4444"
                      : "2px solid rgba(255,255,255,0.10)",
                    background: "#ffffff",
                    color: "#0b1220",
                    boxSizing: "border-box",
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ ...panelStyle, padding: 18 }}>
            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.68)",
                    marginBottom: 6,
                  }}
                >
                  Next Address
                </div>
                <div
                  style={{
                    fontSize: "clamp(34px, 8vw, 54px)",
                    fontWeight: 900,
                    letterSpacing: -1.2,
                  }}
                >
                  {overflow ? "OVER" : nextFree}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.68)",
                    marginBottom: 6,
                  }}
                >
                  Occupied Range
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: -0.8,
                  }}
                >
                  {rows.length ? `${rows[0].start}–${rows[rows.length - 1].end}` : "—"}
                </div>
              </div>

              {isInvalid && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#fca5a5",
                    fontWeight: 700,
                  }}
                >
                  Check your values.
                </div>
              )}

              {!isInvalid && overflow && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#fca5a5",
                    fontWeight: 700,
                  }}
                >
                  This run exceeds DMX 512.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, padding: 18 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: "rgba(255,255,255,0.68)",
              marginBottom: 12,
            }}
          >
            Address Plan
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {rows.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.4fr) minmax(90px, 0.6fr) minmax(110px, 0.8fr)",
                  gap: 10,
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: row.valid
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(239,68,68,0.12)",
                  border: row.valid
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.name}
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 22,
                    textAlign: "center",
                  }}
                >
                  {row.start}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    textAlign: "right",
                    color: row.valid ? "rgba(255,255,255,0.76)" : "#fca5a5",
                  }}
                >
                  {row.start}–{row.end}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}