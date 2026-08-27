import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoRail } from "./PhotoRail";

const photos = Array.from({ length: 6 }, (_, i) => ({ src: `/p${i}.jpg`, alt: `Carton ${i}` }));

/**
 * jsdom reports every layout measurement as 0, so an overflow-driven control
 * never appears there. The arrows exist precisely because the rail overflows,
 * so the overflow has to be described before there is anything to test.
 */
const withOverflow = (scrollWidth: number, clientWidth: number, scrollLeft = 40) => {
  const props = ["scrollWidth", "clientWidth", "offsetLeft"] as const;
  const originals = props.map((p) => [p, Object.getOwnPropertyDescriptor(HTMLElement.prototype, p)] as const);
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get() { return scrollWidth; } });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return clientWidth; } });
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", { configurable: true, get() { return 0; } });
  Object.defineProperty(HTMLElement.prototype, "scrollLeft", { configurable: true, writable: true, value: scrollLeft });
  return () => {
    for (const [p, d] of originals) {
      if (d) Object.defineProperty(HTMLElement.prototype, p, d);
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[p];
    }
  };
};

let restore: (() => void) | undefined;
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} unobserve() {} });
});
afterEach(() => {
  restore?.();
  restore = undefined;
  vi.unstubAllGlobals();
});

describe("PhotoRail", () => {
  it("gives a mouse a way through the rail once it overflows", () => {
    // overflow-x: auto has always been there, so this scrolled by swipe and by
    // trackpad. A plain mouse has no horizontal gesture, and the lede says
    // "Scroll." — 1536px of photographs behind an instruction that was not
    // true for anyone on a mouse.
    restore = withOverflow(1960, 424);
    render(<PhotoRail photos={photos} onZoom={() => {}} />);
    expect(screen.getByLabelText("More cartons").tagName).toBe("BUTTON");
    expect(screen.getByLabelText("Previous cartons").tagName).toBe("BUTTON");
  });

  it("offers nothing when there is nothing to scroll", () => {
    restore = withOverflow(400, 424);
    render(<PhotoRail photos={photos} onZoom={() => {}} />);
    expect(screen.queryByLabelText("More cartons")).toBeNull();
  });

  it("hides the arrow that has nowhere to go", () => {
    // At rest the rail sits at its first snap point, not at 0 — with
    // scroll-padding auto that stop is the rail's own padding.
    restore = withOverflow(1960, 424, 0);
    render(<PhotoRail photos={photos} onZoom={() => {}} />);
    expect(screen.getByLabelText("Previous cartons").className).toContain("opacity-0");
    expect(screen.getByLabelText("More cartons").className).not.toContain("opacity-0");
  });

  it("still opens a photo", () => {
    const onZoom = vi.fn();
    render(<PhotoRail photos={photos} onZoom={onZoom} />);
    fireEvent.click(screen.getByAltText("Carton 2").closest("button")!);
    expect(onZoom).toHaveBeenCalledWith("/p2.jpg");
  });
});
