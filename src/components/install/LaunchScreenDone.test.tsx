import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LaunchScreenDone } from "./LaunchScreenDone";

describe("LaunchScreenDone", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.getElementById("launch-screen")?.remove();
  });

  it("lets taps through at once, then removes the launch screen", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    el.id = "launch-screen";
    document.body.appendChild(el);

    render(<LaunchScreenDone />);
    expect(el.style.pointerEvents).toBe("none");
    expect(el.style.opacity).toBe("0");

    vi.advanceTimersByTime(300);
    expect(document.getElementById("launch-screen")).toBeNull();
  });

  it("still removes it if it unmounts mid-fade", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    el.id = "launch-screen";
    document.body.appendChild(el);

    render(<LaunchScreenDone />).unmount();
    vi.advanceTimersByTime(300);
    expect(document.getElementById("launch-screen")).toBeNull();
  });

  it("does nothing in a browser tab, where there is no launch screen", () => {
    expect(() => render(<LaunchScreenDone />)).not.toThrow();
  });
});
