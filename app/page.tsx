export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      padding: 40
    }}>
      
      <h1 style={{ fontSize: 42, marginBottom: 10 }}>
        DOMISSOUNDCO Tools
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 40 }}>
        Practical tools for audio engineers and live production
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20
      }}>
        
        {/* LIVE TOOL */}
        <a href="/tools/pal-label-creator" style={{
          background: "#1e293b",
          padding: 20,
          borderRadius: 16,
          textDecoration: "none",
          color: "#fff",
          display: "block"
        }}>
          <h2>PAL Label Creator</h2>
          <p style={{ opacity: 0.7 }}>
            Generate printable PAL dish labels instantly
          </p>
        </a>

        {/* COMING SOON */}
        <div style={{
          background: "#1e293b",
          padding: 20,
          borderRadius: 16,
          opacity: 0.5
        }}>
          <h2>Cable Labels</h2>
          <p>Coming soon</p>
        </div>

        <div style={{
          background: "#1e293b",
          padding: 20,
          borderRadius: 16,
          opacity: 0.5
        }}>
          <h2>RF Planner</h2>
          <p>Coming soon</p>
        </div>

      </div>
    </div>
  );
}