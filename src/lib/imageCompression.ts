/**
 * Turning a phone photo into something a feed can actually serve.
 *
 * Nothing resized anything for the first year of this app: the upload path
 * sent the camera's own file, so `milk-pictures` filled up with 3000x4000
 * JPEGs of about 3MB each. The mobile feed card shows that photo in a column
 * 104px wide. Signed in, the feed asks for 50 items — roughly 150MB of image
 * to paint a page, over whatever signal a phone has in a supermarket.
 *
 * So every upload now produces two files, and the original is never stored:
 *
 * - **full** (1600px long edge) — what the enlarge dialog opens. The dialog is
 *   capped at `88vh`, so 1600 is already generous on a retina laptop.
 * - **thumb** (800px long edge) — what every card in the feed loads.
 *
 * One thumbnail size rather than one per breakpoint, deliberately. The mobile
 * card needs ~312px (104 CSS px at DPR 3) and the desktop card ~880px, so 800
 * is slightly soft on a retina desktop and three times larger than a phone
 * strictly needs. Both are wrong by a factor small enough not to see. A second
 * derivative would double the work the phone does before an upload completes,
 * to save a few tens of kilobytes on the faster of the two devices.
 *
 * JPEG rather than WebP, also deliberately. WebP would save perhaps 30%, but
 * the thumbnail is addressed by convention — `thumb_` in front of the
 * original's filename, see `thumbnailPath` — and changing the extension as
 * well means the fallback, the backfill and the upload each have to agree
 * about which file exists. 800px of JPEG is already ~70KB.
 */

export interface RenderOptions {
  /** Longest edge of the result, in pixels. Never upscales. */
  maxEdge: number;
  quality: number;
}

/** What the feed card loads. */
export const THUMB_OPTIONS: RenderOptions = { maxEdge: 800, quality: 0.72 };

/** What the enlarge dialog opens, and the only copy of the photo kept. */
export const FULL_OPTIONS: RenderOptions = { maxEdge: 1600, quality: 0.82 };

/**
 * The thumbnail that belongs to a stored picture path.
 *
 * A prefix on the filename rather than a `thumbs/` folder, because the storage
 * policy on `milk-pictures` insists on it:
 *
 *     array_length(storage.foldername(name), 1) = 1
 *
 * One folder level, and it has to be the uploader's own id. Both `thumbs/x/y`
 * and `x/thumbs/y` are rejected by that check, so the only place a derivative
 * can live is beside its original under a different name. Changing the policy
 * would mean a migration, and `/supabase/` waits for review by design.
 */
export const thumbnailPath = (picturePath: string): string => {
  const cut = picturePath.lastIndexOf("/");
  return `${picturePath.slice(0, cut + 1)}thumb_${picturePath.slice(cut + 1)}`;
};

/**
 * Decode a file at its *displayed* orientation.
 *
 * Phone photos are almost always stored landscape with an EXIF tag saying
 * which way is up, and `drawImage` of a bare bitmap does not apply it — which
 * is how a resize pipeline silently lays every portrait carton on its side.
 * `createImageBitmap` is asked for it explicitly; the `<img>` fallback gets it
 * from the browser's default `image-orientation: from-image`.
 */
const decode = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Safari has thrown on the options bag before now; fall through.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not decode the image"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image"))),
      "image/jpeg",
      quality,
    );
  });

/**
 * Resize to `maxEdge` and encode as JPEG.
 *
 * The scaling is done in halves rather than in one jump. Canvas resampling
 * only looks at a small neighbourhood, so asking it for 3000px to 800px in a
 * single `drawImage` skips most of the source pixels and returns something
 * visibly crunchy; halving repeatedly until the last step is under 2x means
 * every pixel contributes.
 */
const renderJpeg = async (file: File, name: string, opts: RenderOptions): Promise<File> => {
  const source = await decode(file);
  const sourceWidth = "naturalWidth" in source ? source.naturalWidth : source.width;
  const sourceHeight = "naturalHeight" in source ? source.naturalHeight : source.height;

  const scale = Math.min(opts.maxEdge / Math.max(sourceWidth, sourceHeight), 1);
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  let canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  let ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a canvas context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0);

  let width = sourceWidth;
  let height = sourceHeight;
  while (width > targetWidth * 2) {
    const next = document.createElement("canvas");
    next.width = Math.max(targetWidth, Math.round(width / 2));
    next.height = Math.max(targetHeight, Math.round(height / 2));
    const nextCtx = next.getContext("2d");
    if (!nextCtx) throw new Error("Could not get a canvas context");
    nextCtx.imageSmoothingQuality = "high";
    nextCtx.drawImage(canvas, 0, 0, next.width, next.height);
    canvas = next;
    ctx = nextCtx;
    width = next.width;
    height = next.height;
  }

  if (width !== targetWidth || height !== targetHeight) {
    const final = document.createElement("canvas");
    final.width = targetWidth;
    final.height = targetHeight;
    const finalCtx = final.getContext("2d");
    if (!finalCtx) throw new Error("Could not get a canvas context");
    finalCtx.imageSmoothingQuality = "high";
    finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    canvas = final;
  }

  if ("close" in source) source.close();

  const blob = await canvasToBlob(canvas, opts.quality);
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
};

/**
 * The copy that gets stored and shown in the enlarge dialog.
 *
 * Applied the moment a photo is picked or captured, so the preview, the form
 * state and the upload all carry the small file rather than the camera's.
 *
 * This replaces a `shouldCompress(file, 5 * 1024 * 1024)` gate that never
 * opened: a modern phone camera writes about 3MB, so every real photo passed
 * under the threshold untouched and reached storage at full resolution. There
 * is no threshold now — a photo destined for a 104px card is always worth
 * resizing, and a file already smaller than 1600px is only re-encoded.
 */
export const toFullSizeJpeg = (file: File, name: string): Promise<File> =>
  renderJpeg(file, name, FULL_OPTIONS);

/** The copy every feed card loads. */
export const toThumbnail = (file: File, name: string): Promise<File> =>
  renderJpeg(file, name, THUMB_OPTIONS);
