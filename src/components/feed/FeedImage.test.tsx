import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FeedImage } from "./FeedImage";

const PATH = "85dba6c1/1787640806472_img.jpg";
const src = () => screen.getByAltText("Joya Oat") as HTMLImageElement;

describe("FeedImage", () => {
  it("loads the thumbnail rather than the photo", () => {
    // The whole point of the change: the card is 104px wide on a phone and
    // used to fetch a 3MB original to fill it.
    render(<FeedImage picturePath={PATH} brandName="Joya" productName="Oat" />);
    expect(src().src).toContain("85dba6c1%2Fthumb_1787640806472_img.jpg");
  });

  it("defers the fetch until the card is scrolled to", () => {
    render(<FeedImage picturePath={PATH} brandName="Joya" productName="Oat" />);
    expect(src().getAttribute("loading")).toBe("lazy");
    expect(src().getAttribute("decoding")).toBe("async");
  });

  it("falls back to the full photo when no thumbnail exists yet", () => {
    // Everything posted before this change has no thumbnail until the backfill
    // script runs. Those cards must stay slow, not go blank.
    render(<FeedImage picturePath={PATH} brandName="Joya" productName="Oat" />);
    fireEvent.error(src());

    expect(src().src).toContain("85dba6c1%2F1787640806472_img.jpg");
    expect(src().src).not.toContain("thumb_");
    expect(src().style.display).not.toBe("none");
  });

  it("gives up only once the photo itself fails too", () => {
    render(<FeedImage picturePath={PATH} brandName="Joya" productName="Oat" />);
    fireEvent.error(src());
    fireEvent.error(src());

    expect(src().style.display).toBe("none");
  });

  it("opens the dialog on the thumbnail rather than on nothing", () => {
    // Splitting card and dialog meant a tap started a cold fetch of the full
    // photo, so the close button sat over an empty box for a second or two.
    // The thumbnail is already decoded, so the picture is there immediately.
    render(<FeedImage picturePath={PATH} brandName="Joya" productName="Oat" />);
    fireEvent.click(screen.getByRole("button"));

    // Two images share the alt text now, so reach for the dialog's own.
    // Two layers: the thumbnail is visible immediately, the photo sits over
    // it at opacity 0 until it loads.
    const layers = [...screen.getByRole("dialog").querySelectorAll("img")];
    expect(layers).toHaveLength(2);
    expect(layers[0].src).toContain("thumb_");
    expect(layers[1].src).not.toContain("thumb_");
    expect(layers[1].className).toContain("opacity-0");

    // No blur: at 800px the thumbnail already out-resolves the box it fills,
    // so blurring it invented a defect the fade then had to undo.
    expect(layers.some((i) => i.className.includes("blur-"))).toBe(false);
  });

  it("fades the photo in once it has arrived", async () => {
    // The fade is driven by a `new Image()` preloader rather than the visible
    // element's onLoad, so that a cached photo cannot slip through between
    // render and React attaching the handler. jsdom never fires load on its
    // own, so stand in for it.
    const loaders: HTMLImageElement[] = [];
    const RealImage = globalThis.Image;
    vi.stubGlobal(
      "Image",
      class extends RealImage {
        constructor() {
          super();
          loaders.push(this as unknown as HTMLImageElement);
        }
      },
    );

    render(<FeedImage picturePath={PATH} brandName="Joya" productName="Oat" />);
    fireEvent.click(screen.getByRole("button"));

    const full = [...screen.getByRole("dialog").querySelectorAll("img")][1];
    expect(full.className).toContain("opacity-0");

    const loader = loaders.find((i) => i.src.includes("1787640806472_img.jpg"));
    expect(loader).toBeTruthy();
    await act(async () => {
      loader!.onload?.(new Event("load"));
    });

    const after = [...screen.getByRole("dialog").querySelectorAll("img")][1];
    expect(after.className).toContain("opacity-100");
    vi.unstubAllGlobals();
  });

  it("still draws its placeholder when there is no photo", () => {
    render(<FeedImage picturePath={null} brandName="Joya" productName="Oat" />);

    expect(screen.queryByAltText("Joya Oat")).toBeNull();
    expect(screen.getByText("No photo this time")).toBeTruthy();
  });
});
