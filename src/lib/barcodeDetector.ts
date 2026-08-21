/**
 * The browser's own barcode detector, where there is one.
 *
 * Android Chromium exposes `BarcodeDetector`, backed by the same ML Kit
 * detector native apps use. It reads the video element directly — no canvas
 * copy, no downscaling, no guessing which way round the frame is, because it
 * handles orientation itself — and it is markedly faster and far more tolerant
 * of angle, blur and glare than decoding in JavaScript.
 *
 * It is not everywhere: desktop Chrome on Windows and Safari have nothing, so
 * ZXing stays as the fallback. This module exists to keep the feature test in
 * one place, since the API is still unshipped in lib.dom.
 */

export type NativeBarcode = { rawValue: string };

type NativeDetector = {
  detect: (source: CanvasImageSource) => Promise<NativeBarcode[]>;
};

type DetectorConstructor = {
  new (options?: { formats?: string[] }): NativeDetector;
  getSupportedFormats?: () => Promise<string[]>;
};

/** The symbologies printed on grocery packaging, in this API's naming. */
const WANTED = ["ean_13", "ean_8", "upc_a", "upc_e"];

const ctor = (): DetectorConstructor | null => {
  const c = (globalThis as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
  return typeof c === "function" ? c : null;
};

/**
 * Build a detector, or null where the platform has none or supports none of
 * the formats we care about.
 */
export const createNativeDetector = async (): Promise<NativeDetector | null> => {
  const C = ctor();
  if (!C) return null;

  try {
    const supported = (await C.getSupportedFormats?.()) ?? [];
    const formats = WANTED.filter((f) => supported.includes(f));
    // An implementation that lists formats but none of ours is no use here.
    if (supported.length > 0 && formats.length === 0) return null;
    return new C(formats.length > 0 ? { formats } : undefined);
  } catch {
    return null;
  }
};
