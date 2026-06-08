import { Component } from "react";
import { reportPageError } from "@site/shared/page-error-reporter.js";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    reportPageError({
      severity: "error",
      message: error?.message || "React render error",
      detail: [error?.stack, info?.componentStack].filter(Boolean).join("\n\n"),
      context: this.props.label || "react",
      source: "react",
    });
  }

  render() {
    if (this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error);
      }
      return (
        <div className="page-error-fallback surface" role="alert">
          <h2 className="v3-hero-title">Something went wrong</h2>
          <p className="v3-muted">
            {this.state.error.message || "An unexpected error occurred on this page."}
          </p>
          <p className="v3-muted">
            Open the error panel (bottom-right) for the full log, or check the browser console (F12).
          </p>
          <button
            type="button"
            className="v3-btn v3-btn--primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
