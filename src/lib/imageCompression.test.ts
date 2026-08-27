import { describe, it, expect } from "vitest";
import { thumbnailPath, THUMB_OPTIONS, FULL_OPTIONS } from "./imageCompression";

/**
 * The resizing itself needs a canvas that actually rasterises, which jsdom
 * does not have — `toBlob` there returns nothing. What is worth pinning down
 * without a browser is the naming convention, because three separate places
 * derive it independently: the upload, the feed card, and the backfill script.
 * If they disagree, the feed silently serves full-size photos forever.
 */
describe("thumbnailPath", () => {
  it("prefixes the file, keeping it inside the uploader's own folder", () => {
    expect(thumbnailPath("a3f/1787640806472_img.jpg")).toBe("a3f/thumb_1787640806472_img.jpg");
  });

  it("stays at one folder deep, which is all the storage policy permits", () => {
    // `array_length(storage.foldername(name), 1) = 1` in the milk-pictures
    // insert policy. A `thumbs/` folder would be rejected outright.
    const path = thumbnailPath("85dba6c1-b7a6-4b06-a911-b50896750370/1778648970054_20260512.jpg");
    expect(path.split("/")).toHaveLength(2);
    expect(path.startsWith("85dba6c1-b7a6-4b06-a911-b50896750370/")).toBe(true);
  });

  it("handles a bare filename with no folder at all", () => {
    expect(thumbnailPath("shot.jpg")).toBe("thumb_shot.jpg");
  });

  it("is not idempotent, so nothing may apply it twice", () => {
    // The backfill filters `/thumb_` out of its work list for this reason.
    expect(thumbnailPath(thumbnailPath("a/b.jpg"))).toBe("a/thumb_thumb_b.jpg");
  });
});

describe("render options", () => {
  it("keeps the thumbnail smaller than the photo it stands in for", () => {
    expect(THUMB_OPTIONS.maxEdge).toBeLessThan(FULL_OPTIONS.maxEdge);
  });

  it("covers the widest card the feed draws", () => {
    // Desktop feed column is ~440px, so ~880px at DPR 2; mobile needs ~312px.
    // 800 is the compromise both live with — see the module comment.
    expect(THUMB_OPTIONS.maxEdge).toBeGreaterThanOrEqual(800);
  });
});
