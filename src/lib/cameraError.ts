/**
 * Why the camera did not open.
 *
 * `getUserMedia` rejects with a DOMException whose `name` is the only reliable
 * part — messages differ per browser and per platform — and the scanner used to
 * throw all of them away and say "No camera access", which sends a reader to
 * the one setting that is often not the problem. A browser the OS has never
 * granted a camera (common for Arc and Ecosia on Windows, which are separate
 * apps from the default browser and get their own entry in the OS privacy
 * list), a camera another app is already holding, and a genuinely refused site
 * permission are three different jobs for the reader.
 */
export type CameraTrouble =
  | "denied"
  | "none"
  | "busy"
  | "constraints"
  | "insecure"
  | "unknown";

/**
 * Map a `getUserMedia` rejection to what the reader has to do about it.
 *
 * The legacy aliases are here because they still arrive: WebKit sends
 * `AbortError` for a camera it cannot start, and older Chromium sends
 * `TrackStartError` and `ConstraintNotSatisfiedError` where the spec now says
 * `NotReadableError` and `OverconstrainedError`.
 */
export const classifyCameraError = (error: unknown): CameraTrouble => {
  const name = (error as { name?: unknown } | null)?.name;
  if (typeof name !== "string") return "unknown";

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "none";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "busy";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "constraints";
    case "SecurityError":
      return "insecure";
    default:
      return "unknown";
  }
};

/**
 * What to tell the reader.
 *
 * Every one of these ends the same way — type the details instead — because
 * scanning is a shortcut and never the only route. The differences are in what
 * is worth trying first.
 */
export const cameraTroubleMessage = (trouble: CameraTrouble): string => {
  switch (trouble) {
    case "denied":
      // Two settings, and the browser one is the one people already know
      // about. The OS one is named second because it is the one that catches
      // people out on a browser that is not their default.
      return "The camera was refused. Allow it for this site in your browser, and check that the browser itself may use the camera in your device's privacy settings. Or type the details instead.";
    case "none":
      return "No camera found on this device. Type the details instead.";
    case "busy":
      return "The camera is busy — another app or tab is holding it. Close that and try again, or type the details instead.";
    case "constraints":
      return "This camera could not meet what the scanner asked for. Type the details instead.";
    case "insecure":
      return "The camera only works over a secure connection. Open the site at its https address, or type the details instead.";
    case "unknown":
      return "The camera would not open, and the browser did not say why. Try another browser, or type the details instead.";
  }
};
