import QuestionnaireEngineView from "../shared/QuestionnaireEngineView.jsx";

const intro = (
  <section className="intro-section" id="introSection">
    <div className="hero-image">
      <img src="./images/relationship-optimization-cover.jpg" alt="" className="hero-img" />
    </div>
    <h2 className="tool-intro-heading">Relationship Viability</h2>
    <p className="assessment-subheading tool-intro-tagline">
      Evaluate relationship fit, friction patterns, and viability signals.
    </p>
  </section>
);

export default function RelationshipEngineView() {
  return (
    <QuestionnaireEngineView
      engineId="relationship"
      label="Relationship Viability"
      lead="Relationship optimization and viability read."
      intro={intro}
      resultsId="resultsSection"
    />
  );
}
