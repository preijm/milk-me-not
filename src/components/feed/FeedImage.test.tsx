import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("still draws its placeholder when there is no photo", () => {
    render(<FeedImage picturePath={null} brandName="Joya" productName="Oat" />);

    expect(screen.queryByAltText("Joya Oat")).toBeNull();
    expect(screen.getByText("No photo this time")).toBeTruthy();
  });
});
