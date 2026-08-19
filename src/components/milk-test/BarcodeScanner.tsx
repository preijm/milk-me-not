import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StoryButton } from "@/components/story/primitives";
import { lookUpBarcode, type ScannedProduct } from "@/lib/openFoodFacts";

/**
 * Ask for the back camera at as many pixels as it will give.
 *
 * Passing no constraints lets the browser choose, and it chooses badly for
 * this: often the front camera, usually around 640x480. A barcode occupies a
 * small part of the frame, so at that size there are too few pixels across the
 * bars to resolve — the preview looks soft and nothing ever decodes.
 *
 * These are all `ideal` rather than `exact`, so a device that cannot manage
 * 1080p or has no rear camera still gets a stream instead of an error.
 */
const CAMERA: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

/** The symbologies actually printed on grocery packaging. */
const FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  /** Fires with whatever the lookup found; `brand`/`name` may be null. */
  onScan: (result: ScannedProduct) => void;
}

type Phase =
  | { step: "starting" }
  | { step: "scanning" }
  | { step: "looking-up"; code: string }
  | { step: "missing"; code: string }
  | { step: "denied" }
  | { step: "blank" }
  | { step: "unsupported" };

/**
 * Scan the barcode on a carton the board has not seen before.
 *
 * This replaces a mockup — a dashed box captioned "Barcode scanner would
 * appear here" beside a "Simulate Scan" button hardcoded to one number. It
 * decodes in the browser with ZXing, which was already a dependency and
 * imported nowhere, and hands the caller whatever Open Food Facts knows so the
 * registration form arrives filled in rather than blank.
 *
 * It never blocks: an unreadable code, an unknown product, a refused camera or
 * a browser without one all end with the reader typing, which is the situation
 * they were in before scanning existed.
 */
export const BarcodeScanner = ({ open, onClose, onScan }: BarcodeScannerProps) => {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: "starting" });
  const [resolution, setResolution] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !videoEl) return;
    let cancelled = false;
    setPhase({ step: "starting" });
    setResolution(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase({ step: "unsupported" });
      return;
    }

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS);
    // Grocery barcodes are small in frame and often printed on a curved,
    // shiny carton. Spending more time per frame beats failing silently.
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);

    const handle = async (code: string) => {
      if (cancelled) return;
      stopRef.current?.();
      setPhase({ step: "looking-up", code });
      const found = await lookUpBarcode(code);
      if (cancelled) return;
      if (!found) {
        setPhase({ step: "missing", code });
        return;
      }
      onScan(found);
    };

    // Starting the camera can hang rather than reject — a device held by
    // another app, or a headless browser where the API exists but no device
    // does. Without this the reader watches "Waking the camera…" forever.
    const timeout = window.setTimeout(() => {
      if (!cancelled) setPhase((cur) => (cur.step === "starting" ? { step: "denied" } : cur));
    }, 8000);

    reader
      .decodeFromConstraints(CAMERA, videoEl, (result) => {
        if (result) void handle(result.getText());
      })
      .then((controls) => {
        window.clearTimeout(timeout);
        if (cancelled) {
          controls.stop();
          return;
        }
        stopRef.current = () => controls.stop();
        setPhase({ step: "scanning" });

        // Grocery barcodes are read at arm's length on a curved surface, so
        // continuous autofocus matters more than usual. Not every browser
        // exposes it; a rejection here is not a failure worth surfacing.
        const track = (videoEl.srcObject as MediaStream | null)?.getVideoTracks()[0];
        track
          ?.applyConstraints({ advanced: [{ focusMode: "continuous" } as never] })
          .catch(() => undefined);

        // What the camera actually gave us, which is the first thing worth
        // knowing when a scan will not resolve.
        window.setTimeout(() => {
          if (!cancelled && videoEl.videoWidth > 0) {
            setResolution(`${videoEl.videoWidth}×${videoEl.videoHeight}`);
          }
        }, 1200);

        // A stream can be granted and still never paint — another app holding
        // the camera, or a track that starts and stalls. Without this the
        // reader just watches a black rectangle with no explanation.
        window.setTimeout(() => {
          if (!cancelled && videoEl.videoWidth === 0) setPhase({ step: "blank" });
        }, 4000);
      })
      .catch(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setPhase({ step: "denied" });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      // Without this the camera light stays on after the dialog closes.
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [open, videoEl, onScan]);

  const message =
    phase.step === "starting" ? "Waking the camera…"
    : phase.step === "scanning" ? "Point it at the barcode on the carton."
    : phase.step === "looking-up" ? "Looking it up…"
    : phase.step === "missing" ? "Nothing on file for that one — you can still add it by hand."
    : phase.step === "denied" ? "No camera access. You can allow it in your browser, or type the details instead."
    : phase.step === "blank" ? "The camera is on but sending nothing. Another app may be holding it — close that and try again, or type the details instead."
    : "This browser cannot open a camera. Type the details instead.";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="story-surface max-w-md rounded-3xl border-story-ink/10 bg-story-cream p-5">
        <DialogTitle className="story-serif text-[1.15rem] font-bold text-story-ink">
          Scan the carton
        </DialogTitle>
        <DialogDescription className="text-[0.875rem] text-story-muted">
          {message}
        </DialogDescription>

        <div className="relative mt-1 overflow-hidden rounded-2xl bg-story-ink">
          <video
            ref={setVideoEl}
            className="aspect-[4/3] w-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {phase.step === "scanning" && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-white/80"
              />
              {resolution && (
                <span className="absolute bottom-1.5 right-2 rounded bg-story-ink/55 px-1.5 py-0.5 text-[0.625rem] font-medium text-white/90">
                  {resolution}
                </span>
              )}
            </>
          )}
        </div>

        <div className="mt-1 flex gap-2">
          {(phase.step === "denied" || phase.step === "unsupported" || phase.step === "blank") && (
            <StoryButton type="button" size="sm" className="flex-1" onClick={onClose}>
              Type it instead
            </StoryButton>
          )}
          {phase.step === "missing" && (
            <StoryButton
              type="button"
              size="sm"
              className="flex-1"
              onClick={() =>
                onScan({
                  barcode: phase.code,
                  brand: null,
                  name: null,
                  quantity: null,
                  looksLikePlantMilk: true,
                  isBarista: false,
                })
              }
            >
              Add it by hand
            </StoryButton>
          )}
          <StoryButton type="button" tone="outline" size="sm" className="flex-1" onClick={onClose}>
            Cancel
          </StoryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
