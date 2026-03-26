"use client";

import { useEffect, useMemo, useState } from "react";

const SWITCH_VALUES = [1, 2, 4, 8, 16, 32, 64, 128, 256];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function addressToDipStates(address: number) {
  let remaining = clamp(Math.floor(address), 1, 511);
  const states = new Array(9).fill(false);

  for (let i = SWITCH_VALUES.length - 1; i >= 0; i--) {
    const value = SWITCH_VALUES[i];
    if (remaining >= value) {
      states[i] = true;
      remaining -= value;
    }
  }

  return states;
}

function dipStatesToAddress(states: boolean[]) {
  return states.reduce((sum, isOn, index) => {
    return isOn ? sum + SWITCH_VALUES[index] : sum;
  }, 0);
}

export default function DmxDipCalculatorPage() {
  const [mode, setMode] = useState<"address" | "switches">("address");
  const [inputValue, setInputValue] = useState("1");
  const [dipStates, setDipStates] = useState<boolean[]>(() =>
    addressToDipStates(1)
  );

  const parsed = Number(inputValue);
  const isInvalid = Number.isNaN(parsed) || parsed < 1 || parsed > 511;
  const address = isInvalid ? 1 : Math.floor(parsed);

  useEffect(() => {
    if (mode === "address") {
      setDipStates(addressToDipStates(address));
    }
  }, [address, mode]);

  const switchesOn = useMemo(() => {
    return SWITCH_VALUES.map((_, i) => (dipStates[i] ? i + 1 : null))
      .filter((v) => v !== null)
      .join(", ");
  }, [dipStates]);

  const reverseAddress = useMemo(() => {
    return dipStatesToAddress(dipStates);
  }, [dipStates]);

  function handleAddressChange(value: string) {
    setMode("address");
    setInputValue(value);
  }

  function toggleSwitch(index: number) {
    setMode("switches");

    setDipStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      const calc = dipStatesToAddress(next);
      setInputValue(String(calc === 0 ? 1 : calc));
      return next;
    });
  }

  function reset() {
    setMode("address");
    setInputValue("1");
    setDipStates(addressToDipStates(1));
  }

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
          "radial-gradient(circle at top left, rgba(34,197,94,0.12), transparent 28%), linear-gradient(180deg, #06101f 0%, #0b1220 48%, #0f172a 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 20 }}>
        <div
          style={{
            ...panelStyle,
            padding: "24px 24px 26px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(34,197,94,0.18), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
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
              marginBottom: 16,
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
            DOMISSOUNDCO Tools
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(34px, 6vw, 64px)",
                lineHeight: 0.95,
                letterSpacing: -1.6,
                maxWidth: 760,
              }}
            >
              DMX DIP
              <br />
              Calculator
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: "rgba(255,255,255,0.74)",
                fontSize: 17,
                lineHeight: 1.6,
              }}
            >
              Fast on-site addressing for fixtures with physical DIP switches.
              Enter an address or tap the switch bank and calculate it backwards instantly.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
          }}
        >
          <div style={{ ...panelStyle, padding: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                color: "rgba(255,255,255,0.68)",
                marginBottom: 10,
              }}
            >
              DMX Address
            </div>

            <input
              type="number"
              min={1}
              max={511}
              value={inputValue}
              onChange={(e) => handleAddressChange(e.target.value)}
              style={{
                width: "100%",
                fontSize: 52,
                fontWeight: 900,
                padding: "18px 18px",
                borderRadius: 22,
                border: isInvalid
                  ? "2px solid #ef4444"
                  : "2px solid rgba(255,255,255,0.10)",
                background: "#ffffff",
                color: "#0b1220",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            {isInvalid && (
              <p
                style={{
                  color: "#fca5a5",
                  marginTop: 10,
                  marginBottom: 0,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Enter a valid DMX address from 1 to 511
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "12px 16px",
                  borderRadius: 999,
                  background: "#22c55e",
                  color: "#04130a",
                  border: "none",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>

              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.82)",
                  fontWeight: 700,
                }}
              >
                Range: 1–511
              </div>
            </div>
          </div>

          <div style={{ ...panelStyle, padding: 20, overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  letterSpacing: -0.4,
                }}
              >
                DIP Switch Bank
              </h2>
            </div>

            <div style={{ overflowX: "auto", paddingBottom: 6 }}>
              <div
                style={{
                  minWidth: 700,
                  background: "#050505",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "18px 14px 14px",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(9, minmax(72px, 1fr))",
                    gap: 10,
                  }}
                >
                  {SWITCH_VALUES.map((value, index) => {
                    const isOn = dipStates[index];

                    return (
                      <button
                        key={value}
                        onClick={() => toggleSwitch(index)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              height: 154,
                              background: "#101010",
                              borderRadius: 14,
                              position: "relative",
                              border: "1px solid rgba(255,255,255,0.07)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 10,
                                borderRadius: 12,
                                background: "#111827",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                            />

                            <div
                              style={{
                                position: "absolute",
                                top: 12,
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 0.5,
                                color: isOn ? "#86efac" : "rgba(255,255,255,0.24)",
                              }}
                            >
                              ON
                            </div>

                            <div
                              style={{
                                position: "absolute",
                                top: isOn ? 18 : 86,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "72%",
                                height: 50,
                                borderRadius: 10,
                                background: "#f3f4f6",
                                border: "1px solid #d1d5db",
                                boxShadow:
                                  "0 10px 20px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.14)",
                                transition: "top 0.15s ease",
                              }}
                            />

                            <div
                              style={{
                                position: "absolute",
                                bottom: 12,
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 0.5,
                                color: !isOn ? "#ffffff" : "rgba(255,255,255,0.24)",
                              }}
                            >
                              OFF
                            </div>
                          </div>

                          <div
                            style={{
                              textAlign: "center",
                              fontSize: 16,
                              fontWeight: 900,
                              color: isOn ? "#86efac" : "rgba(255,255,255,0.82)",
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <div style={{ ...panelStyle, padding: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                color: "rgba(255,255,255,0.68)",
                marginBottom: 10,
              }}
            >
              Switches ON
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: -0.6,
              }}
            >
              {switchesOn || "None"}
            </div>
          </div>

          <div style={{ ...panelStyle, padding: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                color: "rgba(255,255,255,0.68)",
                marginBottom: 10,
              }}
            >
              Calculated Address
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: -0.6,
              }}
            >
              {reverseAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}