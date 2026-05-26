import QuestionnaireEngineView from "../shared/QuestionnaireEngineView.jsx";

const intro = (
  <>
    <section className="intro-section" id="introSection">
      <div className="hero-image">
        <img src="./images/redpill-tool.jpg" alt="" className="hero-img" />
      </div>
      <h2 className="tool-intro-heading">🎭 Modern Archetype Identification</h2>
      <p className="assessment-subheading tool-intro-tagline">
        Identify your primary, secondary, and tertiary modern archetypes through four phases of
        behavioral analysis.
      </p>
    </section>
  </>
);

export default function ArchetypeEngineView() {
  return (
    <QuestionnaireEngineView
      engineId="archetype"
      label="Modern Archetype Identification"
      lead="Behavioral role patterning across seven core archetype groups."
      intro={intro}
      resultsId="resultsContainer"
    />
  );
}
