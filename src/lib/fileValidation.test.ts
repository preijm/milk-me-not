import { describe, it, expect, vi, afterEach } from "vitest";
import { sanitizeFileName, validateFile } from "./fileValidation";

/** A JPEG that claims the given byte size. */
const photo = (sizeBytes: number) => {
  const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "photo.jpg", { type: "image/jpeg" });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
};

/** jsdom never decodes images, so stand in an Image that reports fixed dimensions. */
const decodesAs = (width: number, height: number) => {
  vi.stubGlobal(
    "Image",
    class {
      width = width;
      height = height;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_url: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
  URL.createObjectURL = () => "blob:photo";
  URL.revokeObjectURL = () => {};
};

describe("fileValidation", () => {
  describe("validateFile", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    // A full-resolution shot from a 50MP phone camera: 8160x6120, ~20MB.
    // It is resized to 1600px before upload, so it must not be turned away.
    it("accepts a full-resolution 50MP phone photo", async () => {
      decodesAs(8160, 6120);
      await expect(validateFile(photo(20 * 1024 * 1024))).resolves.toEqual({ isValid: true });
    });

    it("rejects a file over 50MB", async () => {
      decodesAs(4000, 3000);
      const result = await validateFile(photo(51 * 1024 * 1024));
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/50MB/);
    });

    it("rejects an image wider than 16384px", async () => {
      decodesAs(20000, 1000);
      const result = await validateFile(photo(5 * 1024 * 1024));
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/16384x16384/);
    });
  });

  describe("sanitizeFileName", () => {
    it("converts to lowercase", () => {
      expect(sanitizeFileName("MyFile.PNG")).toBe("myfile.png");
    });

    it("replaces spaces with underscores", () => {
      expect(sanitizeFileName("my file name.jpg")).toBe("my_file_name.jpg");
    });

    it("replaces special characters with underscores", () => {
      expect(sanitizeFileName("file@#$%.jpg")).toBe("file_.jpg");
    });

    it("removes multiple consecutive underscores", () => {
      expect(sanitizeFileName("file___name.jpg")).toBe("file_name.jpg");
    });

    it("removes leading underscores", () => {
      expect(sanitizeFileName("_file_name.jpg")).toBe("file_name.jpg");
    });

    it("preserves dots and hyphens", () => {
      expect(sanitizeFileName("my-file.test.jpg")).toBe("my-file.test.jpg");
    });

    it("handles empty string", () => {
      expect(sanitizeFileName("")).toBe("");
    });

    it("handles unicode characters by removing them", () => {
      expect(sanitizeFileName("filéñäme.jpg")).toBe("fil_me.jpg");
    });

    it("handles complex filenames", () => {
      expect(sanitizeFileName("My Complex (File) [2024].jpg")).toBe("my_complex_file_2024_.jpg");
    });
  });
});
