"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Short name for what failed, e.g. "Course editor". */
  label: string;
  /** Rendered instead of the default panel when the subtree throws. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = { error: Error | null };

/**
 * A local error boundary for one piece of the shell.
 *
 * Without this, any render error in a layout-level component (a navbar, a
 * provider, a promotional strip) escapes every segment boundary and Next renders
 * the opaque "Application error: a client-side exception has occurred" page —
 * which tells the person nothing and makes the admin unusable. Containing the
 * failure here keeps the rest of the page working and prints the message that
 * actually failed.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`${this.props.label} failed to render:`, error);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="mx-auto my-4 w-full max-w-2xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
      >
        <p className="font-semibold">{this.props.label} could not be shown.</p>
        <p className="mt-1 text-amber-900">
          The rest of the page still works. No record was changed by this
          failure.
        </p>
        <pre className="mt-3 max-h-32 overflow-auto rounded bg-white/70 p-2 text-xs whitespace-pre-wrap">
          {error.message || "Unknown error"}
        </pre>
        <button
          type="button"
          onClick={this.reset}
          className="mt-3 rounded-full bg-amber-900 px-4 py-1.5 text-xs font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }
}
