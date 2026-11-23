import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import type { ScannedProduct } from "@/lib/openFoodFacts";

/**
 * What happens after a decode, with the camera taken out.
 *
 * The browser tests reach a live camera but cannot decode a carton — the fake
 * device shows a test pattern — and the rest of ScanFlow's tests render rows
 * on their own. So nothing exercised the match list as a reader meets it:
 * which row comes first, and where each way out of it leads. The scanner is
 * replaced by a button that "decodes" a fixed carton.
 */

const remembered = vi.fn(async (_barcode: string, _productId: string) => {});
vi.mock("@/lib/rememberBarcode", () => ({
  rememberBarcode: (barcode: string, productId: string) => remembered(barcode, productId),
}));

vi.mock("@/lib/createScannedProduct", () => ({ createProductFromScan: vi.fn() }));

let scanned: ScannedProduct;
vi.mock("@/components/milk-test/BarcodeScanner", () => ({
  BarcodeScanner: ({ onScan }: { onScan: (s: ScannedProduct) => void }) => (
    <button onClick={() => onScan(scanned)}>decode</button>
  ),
}));

let boardRows: unknown[] = [];
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: async (fn: string) =>
      fn === "get_product_by_barcode" ? { data: null, error: null } : { data: boardRows, error: null },
  },
}));

const { ScanFlow } = await import("./ScanFlow");

const ALPRO_SOYA: ScannedProduct = {
  barcode: "5411188080213",
  brand: "Alpro",
  name: "Soya Original",
  quantity: "1 l",
  looksLikePlantMilk: true,
  isBarista: false,
  tags: ["plant-based-milk-alternatives", "soy-based-drinks"],
};

const row = (id: string, product_name: string, flavor_names: string[] | null = null, property_names: string[] | null = null) => ({
  id,
  brand_name: "Alpro",
  product_name,
  is_barista: false,
  flavor_names,
  property_names,
});

/** Nine rows in the order the brand search returns them: plain soya last. */
const ALPRO_ROWS = [
  row("oat", "Oat"),
  row("almond", "Almond"),
  row("coconut", "Coconut"),
  row("soya-banana", "Soya", ["banana"]),
  row("soya-red-fruits", "Soya", ["red_fruits"]),
  row("soya-choc", "Soya", ["chocolate"]),
  row("soya-protein", "Soya", null, ["protein"]),
  row("rice", "Rice"),
  row("soya", "Soya"),
];

/** Wherever the flow navigates, say where and with what. */
const Landed = () => {
  const location = useLocation();
  return (
    <output data-testid="landed">
      {location.pathname} {JSON.stringify(location.state)}
    </output>
  );
};

const renderFlow = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<ScanFlow open onClose={() => {}} />} />
        <Route path="*" element={<Landed />} />
      </Routes>
    </MemoryRouter>,
  );

const decodeAndWaitForMatches = async () => {
  renderFlow();
  fireEvent.click(screen.getByText("decode"));
  return within(await screen.findByRole("list"));
};

describe("the scan match list", () => {
  beforeEach(() => {
    scanned = ALPRO_SOYA;
    boardRows = ALPRO_ROWS;
    remembered.mockClear();
  });

  it("puts the plain carton first, where the search had it ninth and cut", async () => {
    const list = await decodeAndWaitForMatches();
    const items = list.getAllByRole("listitem");

    expect(items).toHaveLength(8);
    expect(items[0].textContent).toContain("Soya");
    for (const badge of ["Banana", "Red fruits", "Chocolate", "Protein"]) {
      expect(items[0].textContent).not.toContain(badge);
    }
    expect(screen.getByText(/Showing the closest 8 of 9/)).toBeInTheDocument();
  });

  it("records the barcode against the row the reader picks", async () => {
    const list = await decodeAndWaitForMatches();
    fireEvent.click(list.getAllByRole("button")[0]);

    await waitFor(() => expect(screen.getByTestId("landed").textContent).toContain("/product/soya"));
    expect(remembered).toHaveBeenCalledWith("5411188080213", "soya");
  });

  it("offers a way to add the carton that is not in the list, carrying the scan", async () => {
    await decodeAndWaitForMatches();
    fireEvent.click(screen.getByRole("button", { name: /Not here\? Add it to the board/ }));

    const landed = await screen.findByTestId("landed");
    expect(landed.textContent).toContain("/add-product");
    // The form reads the scan from here to fill itself in and, on save, to
    // record the barcode — so it has to arrive whole.
    expect(landed.textContent).toContain('"barcode":"5411188080213"');
    // Nothing is recorded yet: the reader has not said which product it is.
    expect(remembered).not.toHaveBeenCalled();
  });
});
