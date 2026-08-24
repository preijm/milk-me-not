import { describe, it, expect } from "vitest";
import { classifyCameraError, cameraTroubleMessage, type CameraTrouble } from "./cameraError";

/** Names really seen from getUserMedia, spec and legacy alike. */
const cases: Array<[string, CameraTrouble]> = [
  ["NotAllowedError", "denied"],
  ["PermissionDeniedError", "denied"],
  ["NotFoundError", "none"],
  ["DevicesNotFoundError", "none"],
  ["NotReadableError", "busy"],
  ["TrackStartError", "busy"],
  ["AbortError", "busy"],
  ["OverconstrainedError", "constraints"],
  ["ConstraintNotSatisfiedError", "constraints"],
  ["SecurityError", "insecure"],
];

describe("classifyCameraError", () => {
  it.each(cases)("reads %s as %s", (name, expected) => {
    expect(classifyCameraError(new DOMException("nope", name))).toBe(expected);
  });

  it("does not guess at a name it has never seen", () => {
    expect(classifyCameraError(new DOMException("nope", "SomethingNewError"))).toBe("unknown");
  });

  it("survives a rejection that is not an error at all", () => {
    expect(classifyCameraError(null)).toBe("unknown");
    expect(classifyCameraError(undefined)).toBe("unknown");
    expect(classifyCameraError("NotAllowedError")).toBe("unknown");
    expect(classifyCameraError({ name: 42 })).toBe("unknown");
  });

  it("never leaves a refusal without a way out", () => {
    const troubles: CameraTrouble[] = [
      "denied",
      "none",
      "busy",
      "constraints",
      "insecure",
      "unknown",
    ];
    for (const trouble of troubles) {
      expect(cameraTroubleMessage(trouble)).toMatch(/type the details instead/i);
    }
  });

  it("sends a refused camera to both the browser and the device settings", () => {
    // A browser that is not the default is a separate app to the OS, and its
    // own privacy entry is the one people miss.
    expect(cameraTroubleMessage("denied")).toMatch(/browser/);
    expect(cameraTroubleMessage("denied")).toMatch(/privacy settings/);
  });
});
