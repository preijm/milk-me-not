/**
 * Builds the home-screen icons from the site logo. Run once whenever the logo
 * changes:  bunx tsx scripts/generate-app-icons.ts
 *
 * The logo is 940×788: a white "m" on a green blob over blue.
 *
 * The maskable icon (Android's home screen) must be the official logo, blob
 * and all; a plain "m" on flat green read as a different brand. Android crops
 * it to the phone's own shape and keeps only the middle 80%, so the logo is
 * shrunk until the whole "m" sits inside that circle. The room around it is
 * filled by stretching the logo's outer rows and columns outwards
 * (`extendWith: "copy"`). Where the blob touches the edge it carries on past
 * it, and the stretched band falls outside what the mask shows.
 */
import sharp from "sharp";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png");
const out = (name: string) => path.join(root, "public", name);

/** The logo, scaled to `scale` of the canvas width and grown to a square. */
async function squareLogo(size: number, scale: number): Promise<Buffer> {
  const inner = await sharp(source)
    .resize(Math.round(size * scale), Math.round(size * scale), { fit: "inside" })
    .png()
    .toBuffer();
  const { width, height } = await sharp(inner).metadata();
  const padX = size - width!;
  const padY = size - height!;
  return sharp(inner)
    .extend({
      left: Math.floor(padX / 2),
      right: Math.ceil(padX / 2),
      top: Math.floor(padY / 2),
      bottom: Math.ceil(padY / 2),
      extendWith: "copy",
    })
    .flatten({ background: "#2144ff" })
    .png()
    .toBuffer();
}

async function main() {
  // Icons nobody masks (iPhone, desktop) show every pixel, so the stretched
  // edges would show as stripes. They get a centred square crop instead; the
  // blob simply runs off the edge.
  const meta = await sharp(source).metadata();
  const side = Math.min(meta.width!, meta.height!);
  const square = await sharp(source)
    .extract({ left: Math.round((meta.width! - side) / 2), top: Math.round((meta.height! - side) / 2), width: side, height: side })
    .png()
    .toBuffer();
  for (const [size, name] of [
    [192, "icons/icon-192.png"],
    [512, "icons/icon-512.png"],
    [180, "apple-touch-icon.png"],
  ] as const) {
    await sharp(square).resize(size, size).flatten({ background: "#2144ff" }).png().toFile(out(name));
  }

  // At 0.86 the "m"'s furthest corner sits about 0.36 of the width from the
  // centre, inside the 0.40 radius Android promises to show.
  await sharp(await squareLogo(512, 0.86)).toFile(out("icons/icon-maskable-512.png"));

  console.log("Icons written");
}

main();
