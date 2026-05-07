import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Application error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-paper p-6 text-ink">
          <div className="max-w-md border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please refresh the page. If this continues, contact your OfficeFlow administrator.
            </p>
            <button className="button-primary mt-5" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

