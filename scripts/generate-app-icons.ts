/**
 * Builds the home-screen icons from the site logo. Run once whenever the logo
 * changes:  bunx tsx scripts/generate-app-icons.ts
 *
 * The logo is 940×788 (a white "m" on a green blob over blue), so it is cut to
 * a centred square first. The maskable icon is different: Android crops it to
 * whatever shape the phone uses, and only the middle 80% is safe.
 */
import sharp from "sharp";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png");
const out = (name: string) => path.join(root, "public", name);

async function main() {
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
    await sharp(square).resize(size, size).flatten({ background: "#00bf63" }).png().toFile(out(name));
  }

  // Only the white "m", lifted off the logo and set on the brand green. The
  // blob's blue edges would otherwise show as a frame under a squircle or
  // rounded-square mask. 55% keeps its corners well inside the 80% safe zone.
  const { data, info } = await sharp(square).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const white = data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230;
    data[i + 3] = white ? 255 : 0;
  }
  const letter = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .resize(Math.round(512 * 0.55), Math.round(512 * 0.55), { fit: "inside" })
    .png()
    .toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 3, background: "#00bf63" } })
    .composite([{ input: letter, gravity: "center" }])
    .png()
    .toFile(out("icons/icon-maskable-512.png"));

  console.log("Icons written");
}

main();
