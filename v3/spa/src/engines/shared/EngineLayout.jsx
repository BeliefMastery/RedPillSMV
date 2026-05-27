export default function EngineLayout({ label, lead, phase = "idle", children }) {
  const phaseClass =
    phase === "assessment" || phase === "results" || phase === "idle"
      ? `bm-engine--${phase}`
      : "bm-engine--idle";

  return (
    <section className={`stack bm-engine ${phaseClass}`}>
      <article className="surface bm-engine-hero">
        <p className="kicker">{phase === "results" ? "Report" : "Tool"}</p>
        <h1 className="v3-hero-title">{label}</h1>
        {lead && phase !== "idle" && phase !== "assessment" && (
          <p className="v3-muted bm-engine-hero-lead">{lead}</p>
        )}
        {phase !== "idle" && phase !== "assessment" && (
          <p className="v3-muted v3-disclaimer bm-engine-hero-disclaimer">
            Descriptive self-assessment only—not diagnosis or therapy.
          </p>
        )}
      </article>
      {children}
    </section>
  );
}
