import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StoryButton } from "@/components/story/primitives";
import { lookUpBarcode, type ScannedProduct } from "@/lib/openFoodFacts";
import { createNativeDetector } from "@/lib/barcodeDetector";
import { classifyCameraError, cameraTroubleMessage, type CameraTrouble } from "@/lib/cameraError";

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
    // Asked for 1920x1080 and an Android phone answered with 720x1280 — a
    // portrait sensor cannot honour a landscape pair, so it fell back to a
    // small mode. A barcode needs a couple of pixels per bar, and 720 across
    // does not give that at arm's length. Asking high on both edges biases the
    // pick upward whichever way round the device holds the frame.
    //
    // Deliberately `ideal` and not `min`: a hard floor throws
    // OverconstrainedError on a device that cannot meet it, which would take
    // the scanner from poor to broken.
    width: { ideal: 2560 },
    height: { ideal: 1440 },
  },
};

/**
 * What to ask for when the constraints above are refused outright.
 *
 * Everything in CAMERA is `ideal`, which should never throw — but a browser is
 * free to disagree, and one that does would otherwise take the reader straight
 * to "type it instead" while a perfectly good webcam sat there. Asking for any
 * camera at all is worth one more round trip before giving up.
 */
const ANY_CAMERA: MediaStreamConstraints = { audio: false, video: true };

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
  | { step: "trouble"; trouble: CameraTrouble }
  | { step: "waiting" }
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
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const [torch, setTorch] = useState(false);
  // Which reader is running still decides what the copy promises, since the
  // JS fallback is visibly slower. Nothing else about the engine is shown.
  const [engine, setEngine] = useState<"native" | "zxing">("zxing");

  useEffect(() => {
    if (!open || !videoEl) return;
    let cancelled = false;
    // Opening the camera and starting a decoder is imperative work that can only
    // begin after commit; `phase` reports how far that work has got. It is a
    // description of an ongoing side effect, not something derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase({ step: "starting" });
    setTorch(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase({ step: "unsupported" });
      return;
    }

    /**
     * Two readers, because TRY_HARDER is expensive and usually unnecessary.
     *
     * Measured on this machine at a 1280 long edge: a frame with no barcode —
     * which is nearly every frame — takes about 7ms to reject without the hint
     * and about 35ms with it. Two orientations per pass doubles that, so the
     * hint is the difference between roughly 15ms and 70ms of work per pass,
     * and a mid-range phone is several times slower than this machine.
     *
     * A real photograph of a carton read at every size tested, with the hint
     * and without — so the hint buys nothing on a clean frame. It is held back
     * for frames that are not clean: the plain reader runs alone while a scan
     * is going well, and the thorough one joins in only once a few seconds
     * have passed without a read. Most scans finish before that and never pay
     * for it, and a struggling one gets the extra effort where it might help.
     *
     * Running it on a fixed cycle instead would put a hitch into every scan,
     * including the ones about to succeed.
     */
    const quickHints = new Map();
    quickHints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS);
    const quick = new BrowserMultiFormatReader(quickHints);

    const thoroughHints = new Map(quickHints);
    thoroughHints.set(DecodeHintType.TRY_HARDER, true);
    const thorough = new BrowserMultiFormatReader(thoroughHints);

    const handle = async (code: string) => {
      if (cancelled) return;
      stop();
      setPhase({ step: "looking-up", code });
      const found = await lookUpBarcode(code);
      if (cancelled) return;
      if (!found) {
        setPhase({ step: "missing", code });
        return;
      }
      onScan(found);
    };

    let stream: MediaStream | null = null;
    let tick: number | null = null;

    const stop = () => {
      if (tick !== null) window.clearTimeout(tick);
      tick = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
    };
    stopRef.current = stop;

    // A camera that never answers leaves the reader staring at "Waking the
    // camera…" with only Cancel. This says so rather than declaring a refusal:
    // the prompt may still be sitting there unanswered, and calling that
    // "denied" sent people off to fix a setting that was never wrong. The
    // stream is still accepted if it arrives late.
    const timeout = window.setTimeout(() => {
      if (!cancelled) setPhase((cur) => (cur.step === "starting" ? { step: "waiting" } : cur));
    }, 8000);

    const canvas = document.createElement("canvas");

    /**
     * Draw the current frame, optionally turned a quarter turn.
     *
     * ZXing reads 1D barcodes along horizontal scan lines, and its browser
     * build does not retry a rotated image even with TRY_HARDER — measured
     * against a real photograph, a code that reads at 0 and 180 degrees fails
     * outright at 90 and 270. Holding a tall carton in portrait puts the bars
     * parallel to those scan lines, which is the common case, so every frame is
     * offered in both orientations.
     */
    const frame = (video: HTMLVideoElement, turned: boolean, wide: boolean) => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;

      /**
       * Crop to the middle of the frame at full resolution, rather than
       * shrinking the whole frame.
       *
       * A barcode has to be a couple of pixels per bar to be read at all. An
       * Android phone handed back a 720x1280 stream, and downscaling that to a
       * 1280 long edge — as this did — left a code held at arm's length with
       * barely two pixels a bar, which is where decoding stops working. The
       * bars are in the middle of the picture, where the guide box is, so
       * taking that band untouched keeps the detail and costs fewer pixels
       * than the shrunken whole.
       *
       * `wide` falls back to the entire frame, shrunk, for a code that is not
       * where the guide says it should be.
       */
      const band = 0.55;
      const sw = wide ? vw : Math.round(vw * (vw > vh ? band : 1));
      const sh = wide ? vh : Math.round(vh * (vw > vh ? 1 : band));
      const sx = Math.round((vw - sw) / 2);
      const sy = Math.round((vh - sh) / 2);

      // Only the whole-frame fallback is shrunk, and only if it is very large.
      const scale = wide ? Math.min(1, 1280 / Math.max(sw, sh)) : 1;
      const w = Math.round(sw * scale);
      const h = Math.round(sh * scale);

      canvas.width = turned ? h : w;
      canvas.height = turned ? w : h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (turned) ctx.rotate(Math.PI / 2);
      ctx.drawImage(video, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
      ctx.restore();
      return canvas;
    };

    /**
     * The rear camera at as many pixels as it will give, or failing that any
     * camera at all.
     *
     * Only a refused *constraint* is worth a second ask. A refused permission,
     * a missing camera or one another app is holding will answer the same way
     * twice, and asking again would put a second prompt in front of someone
     * who has already said no.
     */
    const openCamera = async (): Promise<MediaStream> => {
      try {
        return await navigator.mediaDevices.getUserMedia(CAMERA);
      } catch (error) {
        if (classifyCameraError(error) !== "constraints") throw error;
        return await navigator.mediaDevices.getUserMedia(ANY_CAMERA);
      }
    };

    openCamera()
      .then(async (granted) => {
        window.clearTimeout(timeout);
        if (cancelled) {
          granted.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = granted;
        videoEl.srcObject = granted;
        await videoEl.play().catch(() => undefined);
        setPhase({ step: "scanning" });

        // Reading a code at arm's length depends on focus more than most
        // camera work. Not every browser exposes it; silence is fine.
        const track = granted.getVideoTracks()[0] ?? null;
        trackRef.current = track;
        track
          ?.applyConstraints({ advanced: [{ focusMode: "continuous" } as never] })
          .catch(() => undefined);

        window.setTimeout(() => {
          if (cancelled) return;
          if (videoEl.videoWidth === 0) setPhase({ step: "blank" });
        }, 1200);

        // A self-scheduling loop rather than setInterval: on a slow phone a
        // pass can outlast its own interval, and setInterval would queue the
        // next one on top of it until the preview stutters.
        const startedAt = performance.now();
        let pass = 0;

        // The platform detector, where the platform has one.
        const native = await createNativeDetector();
        if (cancelled) return;
        setEngine(native ? "native" : "zxing");

        const scan = async () => {
          if (cancelled) return;

          // Escalate only after the quick path has had a fair go.
          const struggling = performance.now() - startedAt > 3000;

          if (native) {
            // Hand it the video directly: no canvas copy, no orientation
            // guessing, and the work happens off the JavaScript thread.
            try {
              const found = await native.detect(videoEl);
              const code = found.find((b) => /^\d{8,14}$/.test(b.rawValue))?.rawValue;
              if (code) {
                void handle(code);
                return;
              }
            } catch {
              // A detector that throws mid-stream is not worth retrying
              // against; the ZXing path below still runs.
            }
            if (!cancelled) tick = window.setTimeout(scan, 80);
            return;
          }
          const reader = struggling && pass % 2 === 1 ? thorough : quick;
          pass += 1;

          // Both regions, both ways round, every pass.
          //
          // The preview is object-cover inside a 4:3 box, so the reader aims
          // using a cropped view of the stream while this decodes the raw
          // frame — and Android may report the sensor's orientation rather
          // than the displayed one, which would put my centre band on the
          // wrong axis. Guessing which is right has already been wrong twice,
          // and a rejection costs about 7ms now, so try all four.
          const attempts: Array<[boolean, boolean]> = [
            [false, false],
            [true, false],
            [false, true],
            [true, true],
          ];

          for (const [turned, wide] of attempts) {
            const c = frame(videoEl, turned, wide);
            if (!c) break;
            try {
              const result = reader.decodeFromCanvas(c);
              if (result) {
                void handle(result.getText());
                return;
              }
            } catch {
              // No code in this orientation; try the other, then the next pass.
            }
          }
          tick = window.setTimeout(scan, 120);
        };
        scan();
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeout);
        // The name is the only part of a getUserMedia rejection worth reading,
        // and it is logged as well as shown: "it does not work in Arc" is not
        // something anyone can act on, and NotReadableError is.
        console.error("Could not open the camera:", error);
        if (!cancelled) setPhase({ step: "trouble", trouble: classifyCameraError(error) });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      // Without this the camera light stays on after the dialog closes.
      stop();
      stopRef.current = null;
    };
  }, [open, videoEl, onScan]);

  const message =
    phase.step === "starting" ? "Waking the camera…"
    : phase.step === "scanning"
      ? engine === "native"
        ? "Point it at the barcode on the carton."
        : "Point it at the barcode. This browser has no built-in reader, so it may take a moment."
    : phase.step === "looking-up" ? "Looking it up…"
    : phase.step === "missing" ? "Nothing on file for that one — you can still add it by hand."
    : phase.step === "waiting" ? "Still waiting for the camera. If your browser asked for permission, answer that — otherwise you can type the details instead."
    : phase.step === "trouble" ? cameraTroubleMessage(phase.trouble)
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
            onClick={() => {
              // Android often parks focus at infinity, which looks fine to the
              // eye and leaves the bars too soft to decode. Nudging it is the
              // one thing a reader can do about that from here.
              const t = trackRef.current;
              void t
                ?.applyConstraints({ advanced: [{ focusMode: "single-shot" } as never] })
                .catch(() =>
                  t.applyConstraints({ advanced: [{ focusMode: "continuous" } as never] }).catch(() => undefined),
                );
            }}
            ref={setVideoEl}
            className="aspect-4/3 w-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {/* No aiming rectangle. The reader scans the whole frame, so a box
              promised a constraint that does not exist — and pointing a phone
              at a carton is already the whole instruction. */}
          {phase.step === "scanning" && (
            <span className="absolute bottom-1.5 left-2 rounded bg-story-ink/55 px-1.5 py-0.5 text-[0.625rem] font-medium text-white/90">
              Tap to focus
            </span>
          )}
        </div>

        {phase.step === "scanning" && (
          <button
            type="button"
            onClick={() => {
              const next = !torch;
              void trackRef.current
                ?.applyConstraints({ advanced: [{ torch: next } as never] })
                .then(() => setTorch(next))
                .catch(() => undefined);
            }}
            className="story-hairline mt-1 rounded-full bg-white px-3 py-1.5 text-[0.8125rem] font-bold text-story-ink"
          >
            {torch ? "Light off" : "Light on"}
          </button>
        )}

        <div className="mt-1 flex gap-2">
          {(phase.step === "trouble" ||
            phase.step === "waiting" ||
            phase.step === "unsupported" ||
            phase.step === "blank") && (
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
