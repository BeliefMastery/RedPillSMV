export default function IntegratedMapChart({
  archetypeSnapshot,
  polaritySnapshot,
  attractionSnapshot,
}) {
  const polarityRaw =
    polaritySnapshot?.analysisData?.overallTemperament?.normalizedScore ?? 0.5;
  const polarityClamped = Math.max(0, Math.min(1, Number(polarityRaw) || 0.5));

  const smvRaw = attractionSnapshot?.smv?.overall ?? 50;
  const smvClamped = Math.max(0, Math.min(100, Number(smvRaw) || 50));

  const primaryArch =
    archetypeSnapshot?.analysisData?.primaryArchetype?.name ||
    archetypeSnapshot?.analysisData?.primaryArchetype?.id ||
    "Archetype";

  // SVG plot area: width 360, height 240; plot box x=[48, 336], y=[24, 196]
  const px = 48 + polarityClamped * (336 - 48);
  const py = 196 - (smvClamped / 100) * (196 - 24);

  const polarityPct = Math.round(polarityClamped * 100);
  const smvPct = Math.round(smvClamped);

  return (
    <div className="surface integrated-map-chart-wrap">
      <h2 className="v3-section-title">Position Coordinate Matrix</h2>
      <p className="v3-muted" style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
        Plots your Polarity axis ({polarityPct}% directive) against Market Leverage (SMV {smvPct}th percentile), anchored by your primary archetype.
      </p>
      <svg
        viewBox="0 0 380 232"
        role="img"
        aria-label={`Coordinate matrix: ${primaryArch}, Polarity ${polarityPct}%, SMV ${smvPct}th percentile`}
        style={{
          width: "100%",
          maxWidth: "28rem",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
      >
        {/* Grid box */}
        <rect
          x="48"
          y="24"
          width="288"
          height="172"
          rx="6"
          fill="rgba(0,0,0,0.22)"
          stroke="var(--v3-surface-border, rgba(255,255,255,0.18))"
          strokeWidth="1"
        />
        {/* Crosshairs at 50% / 50% */}
        <line
          x1="192"
          y1="24"
          x2="192"
          y2="196"
          stroke="var(--v3-surface-border, rgba(255,255,255,0.2))"
          strokeDasharray="4 4"
        />
        <line
          x1="48"
          y1="110"
          x2="336"
          y2="110"
          stroke="var(--v3-surface-border, rgba(255,255,255,0.2))"
          strokeDasharray="4 4"
        />

        {/* Quadrant hints */}
        <text x="56" y="38" fontSize="9" fill="var(--v3-muted, #aaa)" opacity="0.8">
          Receptive · High SMV
        </text>
        <text x="328" y="38" fontSize="9" textAnchor="end" fill="var(--v3-muted, #aaa)" opacity="0.8">
          Directive · High SMV
        </text>
        <text x="56" y="188" fontSize="9" fill="var(--v3-muted, #aaa)" opacity="0.8">
          Receptive · Building
        </text>
        <text x="328" y="188" fontSize="9" textAnchor="end" fill="var(--v3-muted, #aaa)" opacity="0.8">
          Directive · Building
        </text>

        {/* Axis labels */}
        <text x="48" y="214" fontSize="10" fill="var(--v3-muted, #aaa)">
          ← Receptive / Flow
        </text>
        <text x="192" y="214" fontSize="10" textAnchor="middle" fill="var(--v3-muted, #aaa)">
          Balanced
        </text>
        <text x="336" y="214" fontSize="10" textAnchor="end" fill="var(--v3-muted, #aaa)">
          Directive / Structure →
        </text>

        <text
          x="16"
          y="110"
          fontSize="10"
          fill="var(--v3-muted, #aaa)"
          textAnchor="middle"
          transform="rotate(-90 16 110)"
        >
          Market Leverage (SMV)
        </text>

        {/* Plot marker */}
        <circle cx={px} cy={py} r="14" fill="var(--v3-accent, #ffd700)" opacity="0.18" />
        <circle
          cx={px}
          cy={py}
          r="6"
          fill="var(--v3-accent, #ffd700)"
          stroke="var(--v3-bg, #120809)"
          strokeWidth="2"
        />
        <text
          x={px}
          y={py > 52 ? py - 12 : py + 20}
          fontSize="11"
          fontWeight="700"
          textAnchor={px > 260 ? "end" : px < 110 ? "start" : "middle"}
          fill="var(--v3-text, #fff)"
        >
          {primaryArch}
        </text>
      </svg>
    </div>
  );
}
