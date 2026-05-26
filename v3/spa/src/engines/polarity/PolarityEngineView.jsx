import QuestionnaireEngineView from "../shared/QuestionnaireEngineView.jsx";

const intro = (
  <section className="intro-section" id="introSection">
    <div className="hero-image">
      <img src="./images/temperament-tool.jpg" alt="" className="hero-img" />
    </div>
    <h2 className="tool-intro-heading">Polarity Position Mapping</h2>
    <p className="assessment-subheading tool-intro-tagline">
      Map masculine–feminine polarity expression across intimate and social contexts.
    </p>
  </section>
);

export default function PolarityEngineView() {
  return (
    <QuestionnaireEngineView
      engineId="polarity"
      label="Polarity Position Mapping"
      lead="Masculine–feminine polarity calibration."
      intro={intro}
      resultsId="resultsSection"
      showSuiteGate
    />
  );
}
