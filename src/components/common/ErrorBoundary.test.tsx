import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * What a reader sees when the app cannot render.
 *
 * Before this existed, the answer was a white page. That is not a hypothetical:
 * a version string arriving as `undefined` got split, the throw went through
 * every provider, and the whole site rendered nothing — with all checks green
 * and the right files being served.
 */

const reported = vi.hoisted(() => ({ calls: [] as unknown[][] }));

vi.mock("@/lib/errorReporting", () => ({
  reportError: async (...args: unknown[]) => {
    reported.calls.push(args);
  },
}));

const { ErrorBoundary } = await import("./ErrorBoundary");

const Boom = ({ message = "kaboom" }: { message?: string }) => {
  throw new Error(message);
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    reported.calls = [];
    // React logs the caught error itself; that is not the thing under test.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays out of the way when nothing is wrong", () => {
    render(
      <ErrorBoundary>
        <p>The board</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("The board")).toBeInTheDocument();
  });

  it("shows a page instead of nothing when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This page stopped working.")).toBeInTheDocument();
  });

  it("offers the thing that usually works", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /board/i })).toHaveAttribute("href", "/");
  });

  it("tells somebody, with the component stack", () => {
    render(
      <ErrorBoundary>
        <Boom message="a very specific failure" />
      </ErrorBoundary>,
    );

    expect(reported.calls).toHaveLength(1);
    const [error, extra] = reported.calls[0] as [Error, { componentStack?: string }];
    expect(error.message).toBe("a very specific failure");
    expect(extra).toHaveProperty("componentStack");
  });

  it("keeps the message available without leading with it", () => {
    // A stack trace as the headline reads as broken twice over, but somebody
    // will want it, so it is behind a disclosure rather than absent.
    render(
      <ErrorBoundary>
        <Boom message="TypeError: cannot read properties of undefined" />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/cannot read properties of undefined/)).toBeInTheDocument();
    expect(screen.getByText("What broke")).toBeInTheDocument();
  });
});
