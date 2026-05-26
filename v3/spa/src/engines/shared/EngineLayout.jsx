export default function EngineLayout({ label, lead, children }) {
  return (
    <section className="stack bm-engine">
      <article className="surface">
        <p className="kicker">Tool</p>
        <h1 className="v3-hero-title">{label}</h1>
        {lead && <p className="v3-muted">{lead}</p>}
        <p className="v3-muted v3-disclaimer">
          Descriptive self-assessment only—not diagnosis or therapy.
        </p>
      </article>
      {children}
    </section>
  );
}
