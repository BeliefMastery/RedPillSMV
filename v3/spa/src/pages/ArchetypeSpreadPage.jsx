export default function ArchetypeSpreadPage() {
  return (
    <div className="stack">
      <h1 className="v3-hero-title">Archetype spread table</h1>
      <p className="v3-muted">Full taxonomy reference (legacy interactive table).</p>
      <iframe
        title="Archetype spread"
        src="./archetype-spread.html"
        style={{
          width: "100%",
          minHeight: "70vh",
          border: "1px solid var(--v3-surface-border)",
          borderRadius: "var(--v3-radius)",
          background: "var(--v3-surface)",
        }}
      />
    </div>
  );
}
