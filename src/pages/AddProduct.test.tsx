import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * The registration form is where a scan of an unknown carton usually ends, and
 * saving it used to drop the barcode. These pin the one thing this page adds
 * on top of the form: that what a scan brought along is recorded against the
 * product the save produced, and that a duplicate is no longer a dead end.
 *
 * The form itself and its provider are replaced — they have tests of their
 * own and a dozen queries between them. What is left is the page's wiring.
 */

const remembered = vi.fn(async (_barcode: string, _productId: string) => {});
vi.mock("@/lib/rememberBarcode", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/rememberBarcode")>()),
  rememberBarcode: (barcode: string, productId: string) => remembered(barcode, productId),
}));

type SubmitResult = { productId: string | null; brandId?: string; isDuplicate: boolean };
let submitResult: SubmitResult;
const originalHandleSubmit = vi.fn(async (_e: unknown, _skipAutoSuccess?: boolean) => submitResult);

vi.mock("@/components/milk-test/registration-ui/ProductRegistrationContext", () => ({
  ProductRegistrationProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useProductRegistration: () => ({ originalHandleSubmit, setIsSubmitting: () => {} }),
}));

vi.mock("@/components/milk-test/registration-ui/FormSections", () => ({
  ProductForm: ({ onSubmit }: { onSubmit: (e: React.FormEvent) => void }) => (
    <form onSubmit={onSubmit}>
      <button type="submit">Save</button>
    </form>
  ),
}));

vi.mock("@/components/story/StoryAppLayout", () => ({
  StoryAppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

const { default: AddProduct } = await import("./AddProduct");

const Landed = () => {
  const location = useLocation();
  return (
    <output data-testid="landed">
      {location.pathname} {JSON.stringify(location.state)}
    </output>
  );
};

const renderAt = (entry: { pathname: string; search?: string; state?: unknown }) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="*" element={<Landed />} />
      </Routes>
    </MemoryRouter>,
  );

const SCANNED_STATE = { scanned: { barcode: "5411188080213", brand: "Alpro", tags: [] } };

describe("AddProduct after a scan", () => {
  beforeEach(() => {
    remembered.mockClear();
    originalHandleSubmit.mockClear();
    toast.mockClear();
    submitResult = { productId: "new-product", brandId: "alpro", isDuplicate: false };
  });

  it("records the scanned barcode against the product it just made, then goes to rate it", async () => {
    renderAt({ pathname: "/add-product", state: SCANNED_STATE });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getByTestId("landed").textContent).toContain("/add"));
    expect(remembered).toHaveBeenCalledWith("5411188080213", "new-product");
    expect(screen.getByTestId("landed").textContent).toContain('"selectedProductId":"new-product"');
  });

  it("records it before navigating, so the request is not left to a page that has gone", async () => {
    // The provider's own onSuccess navigated mid-submit; skipping it is what
    // lets this page record first and navigate once.
    renderAt({ pathname: "/add-product", state: SCANNED_STATE });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(remembered).toHaveBeenCalled());
    expect(originalHandleSubmit).toHaveBeenCalledWith(expect.anything(), true);
  });

  it("records it against the existing product when the save finds a duplicate, and goes there", async () => {
    submitResult = { productId: "existing", brandId: "alpro", isDuplicate: true };
    renderAt({ pathname: "/add-product", state: SCANNED_STATE });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getByTestId("landed").textContent).toContain('"selectedProductId":"existing"'));
    expect(remembered).toHaveBeenCalledWith("5411188080213", "existing");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Already on the board" }));
  });

  it("records nothing when the form was reached without a scan", async () => {
    renderAt({ pathname: "/add-product" });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getByTestId("landed").textContent).toContain("/add"));
    expect(remembered).not.toHaveBeenCalled();
  });

  it("records nothing when editing an existing product", async () => {
    renderAt({ pathname: "/add-product", search: "?edit=existing", state: SCANNED_STATE });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getByTestId("landed").textContent).toContain("/add"));
    expect(remembered).not.toHaveBeenCalled();
  });
});
