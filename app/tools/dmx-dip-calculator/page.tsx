"use client";

import { useEffect, useMemo, useState } from "react";

const SWITCH_VALUES = [1, 2, 4, 8, 16, 32, 64, 128, 256];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function addressToDipStates(address: number) {
  let remaining = clamp(Math.floor(address), 1, 511);
  const states = new Array(9).fill(false);

  for (let i = SWITCH_VALUES.length - 1; i >= 0; i -= 1) {
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
  const [showLocateScreen, setShowLocateScreen] = useState(false);

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

  function openLocateScreen() {
    setShowLocateScreen(true);
  }

  function closeLocateScreen() {
    setShowLocateScreen(false);
  }

  const panelStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 28,
    boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
    backdropFilter: "blur(12px)",
  };

  return (
    <>
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
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "grid",
            gap: 18,
          }}
        >
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
              DMX DIP Calc
            </h1>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                color: "rgba(255,255,255,0.68)",
                marginBottom: 8,
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
                fontSize: "clamp(30px, 7vw, 42px)",
                fontWeight: 900,
                padding: "12px 14px",
                borderRadius: 18,
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
                marginTop: 14,
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
                  fontSize: 14,
                }}
              >
                Reset
              </button>

              <button
                onClick={openLocateScreen}
                style={{
                  padding: "12px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Locate Screen
              </button>
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: 18,
            }}
          >
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
              Switches On
            </div>

            <div
              style={{
                fontSize: "clamp(28px, 6vw, 36px)",
                fontWeight: 900,
                letterSpacing: -0.6,
              }}
            >
              {switchesOn || "None"}
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: 18,
            }}
          >
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
              DIP Switch Bank
            </div>
            
            <div style={{ overflowX: "auto", paddingBottom: 4 }}>
              <div
                style={{
                  width: "100%",
                  minWidth: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
                  gap: 8,
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
                        minWidth: 0,
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
                            height: "clamp(108px, 22vw, 154px)",
                            background: "#050505",
                            borderRadius: 12,
                            position: "relative",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: 8,
                              borderRadius: 10,
                              background: "#101010",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          />

                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 0,
                              right: 0,
                              textAlign: "center",
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: 0.5,
                              color: isOn ? "#86efac" : "rgba(255,255,255,0.22)",
                            }}
                          >
                            ON
                          </div>

                          <div
                            style={{
                              position: "absolute",
                              top: isOn ? "12%" : "58%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "70%",
                              height: "30%",
                              borderRadius: 8,
                              background: "#f3f4f6",
                              border: "1px solid #d1d5db",
                              boxShadow:
                                "0 8px 16px rgba(0,0,0,0.28), inset 0 -2px 5px rgba(0,0,0,0.14)",
                              transition: "top 0.15s ease",
                            }}
                          />

                          <div
                            style={{
                              position: "absolute",
                              bottom: 10,
                              left: 0,
                              right: 0,
                              textAlign: "center",
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: 0.5,
                              color: !isOn ? "#ffffff" : "rgba(255,255,255,0.22)",
                            }}
                          >
                            OFF
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "clamp(12px, 3.2vw, 16px)",
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

      {showLocateScreen && (
        <div
          onClick={closeLocateScreen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              closeLocateScreen();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#ffffff",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              color: "#111111",
              fontSize: "clamp(18px, 4vw, 28px)",
              fontWeight: 800,
              textAlign: "center",
              padding: 24,
            }}
          >
            Locate Screen Active
            <div
              style={{
                marginTop: 10,
                fontSize: "clamp(14px, 3vw, 18px)",
                fontWeight: 600,
                opacity: 0.72,
              }}
            >
              Tap anywhere to exit
            </div>
          </div>
        </div>
      )}
    </>
  );
}