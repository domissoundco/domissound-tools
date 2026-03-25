export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0b1220 0%, #111827 45%, #0f172a 100%)",
        color: "#ffffff",
        fontFamily:
          'Inter, Arial, Helvetica, sans-serif',
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gap: 24,
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 13,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            DOMISSOUNDCO • Useful Tools
          </div>

          <div>
            <h1
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 1,
                margin: "0 0 14px 0",
                letterSpacing: -1.5,
              }}
            >
              Practical tools for
              <br />
              audio and live production
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                fontSize: 18,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Fast, useful utilities for engineers, techs, touring crews, and
              production teams. Start with the PAL Label Creator and build from
              there.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          <a
            href="/tools/pal-label-creator"
            style={{
              textDecoration: "none",
              color: "#ffffff",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              backdropFilter: "blur(10px)",
              display: "block",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: 14,
                padding: "6px 10px",
                borderRadius: 999,
                background: "#22c55e",
                color: "#04130a",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              Live now
            </div>

            <h2 style={{ margin: "0 0 10px 0", fontSize: 28 }}>
              PAL Label Creator
            </h2>

            <p
              style={{
                margin: "0 0 18px 0",
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.6,
              }}
            >
              Create print-ready PAL labels with instant preview, logo uploads,
              colour zones, and export tools.
            </p>

            <div
              style={{
                fontWeight: 700,
                color: "#93c5fd",
              }}
            >
              Open tool →
            </div>
          </a>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
              opacity: 0.75,
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: 14,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              Coming soon
            </div>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 28 }}>
              Cable Labels
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
              Quick cable and loom labelling for workshop and touring use.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
              opacity: 0.75,
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: 14,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              Coming soon
            </div>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 28 }}>RF Planner</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
              Future tools for RF planning, coordination, and workflow support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}