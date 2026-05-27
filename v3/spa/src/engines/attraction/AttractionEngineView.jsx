import QuestionnaireEngineView from "../shared/QuestionnaireEngineView.jsx";

const intro = (
  <section className="intro-section" id="introSection">
    <div className="hero-image">
      <img src="./images/attraction-tool.jpg" alt="" className="hero-img" />
    </div>
    <h2 className="tool-intro-heading">Attraction, Status and Selection</h2>
    <p className="assessment-subheading tool-intro-tagline">
      Percentile sexual market value, delusion index, and market position signals.
    </p>
  </section>
);

export default function AttractionEngineView() {
  return (
    <QuestionnaireEngineView
      engineId="attraction"
      label="Attraction, Status and Selection"
      lead="SMV as positional leverage under operational sex ratio distortion—not moral rank. Final phase adds contract-context items; optional inventory enriches sexual contract reads."
      intro={intro}
      resultsId="resultsSection"
      showSuiteGate
    />
  );
}
