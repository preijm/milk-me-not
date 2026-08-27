import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/errorReporting";

/**
 * Something to look at when the app cannot render.
 *
 * There was no boundary above the providers, so anything throwing during render
 * took the entire page to white — no header, no message, no way back. That is
 * exactly what happened when a version string arrived as `undefined` and got
 * split: every check was green, the site served the right files, and readers
 * would have seen nothing at all.
 *
 * A blank page also tells the reader nothing and tells us nothing. This does
 * both: it says what happened in plain words, offers the one thing that usually
 * works, and reports the error on the way past.
 *
 * Deliberately built from raw markup and CSS classes rather than the story
 * components. A boundary that imports half the app can be brought down by the
 * same broken module it is meant to catch.
 */

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportError(error, { componentStack: info.componentStack });
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-story-cream px-5 py-16 text-story-ink"
      >
        <div className="story-hairline w-full max-w-md rounded-3xl bg-white p-6">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-story-muted-2">
            Something went wrong
          </p>

          <h1 className="story-serif mt-2 text-[1.35rem] font-bold leading-tight">
            This page stopped working.
          </h1>

          <p className="mt-2 text-[0.9375rem] text-story-muted">
            Not your doing, and nothing you typed has been lost from the board. Reloading
            usually sorts it. We have been told it happened.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.reload}
              className="rounded-full bg-story-green px-4 py-2 text-[0.875rem] font-bold text-white"
            >
              Reload the page
            </button>
            <a
              href="/"
              className="rounded-full bg-story-cream-2 px-4 py-2 text-[0.875rem] font-bold text-story-ink"
            >
              Back to the board
            </a>
          </div>

          {/* The message, for anyone who wants it — folded away, because most
              readers do not, and an unexplained stack trace reads as broken
              twice over. */}
          <details className="mt-5">
            <summary className="cursor-pointer text-[0.8125rem] font-bold text-story-muted-2">
              What broke
            </summary>
            <pre className="story-hairline mt-2 overflow-x-auto rounded-xl bg-story-cream p-3 text-[0.75rem] text-story-muted">
              {this.state.error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
