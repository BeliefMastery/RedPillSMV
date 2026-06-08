import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[react:${this.props.label || "app"}]`, error?.message, error, info);
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
          <p className="v3-muted">Check the browser console (F12) for details.</p>
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
