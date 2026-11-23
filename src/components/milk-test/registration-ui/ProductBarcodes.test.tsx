import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * The admin's way to undo a wrong barcode. A small in-memory product_barcodes
 * stands behind the mocked RPCs, so each test can check what the table holds
 * afterwards rather than only which calls went out.
 */

let table: Map<string, string>;
const calls: string[] = [];

const rpc = vi.fn(async (fn: string, args: Record<string, string>) => {
  calls.push(fn);
  switch (fn) {
    case "admin_list_product_barcodes":
      return {
        data: [...table.entries()]
          .filter(([, product]) => product === args._product_id)
          .map(([barcode]) => ({ barcode, created_at: "2026-11-23T00:00:00Z" })),
        error: null,
      };
    case "get_product_by_barcode":
      return { data: table.get(args._barcode) ?? null, error: null };
    case "admin_set_product_barcode": {
      const previous = table.get(args._barcode) ?? null;
      table.set(args._barcode, args._product_id);
      return { data: previous, error: null };
    }
    case "admin_delete_product_barcode":
      return { data: table.delete(args._barcode), error: null };
    default:
      throw new Error(`unexpected rpc ${fn}`);
  }
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (fn: string, args: Record<string, string>) => rpc(fn, args),
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { brand_name: "Alpro", product_name: "Oat" }, error: null }),
        }),
      }),
    }),
  },
}));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

const { ProductBarcodes } = await import("./ProductBarcodes");

const renderFor = (productId: string, onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      {/* Inside a form, as it is in the edit dialog: nothing here may submit it. */}
      <form onSubmit={onSubmit}>
        <ProductBarcodes productId={productId} />
      </form>
    </QueryClientProvider>,
  );
  return { onSubmit };
};

const typeBarcode = (value: string) =>
  fireEvent.change(screen.getByLabelText("Add a barcode"), { target: { value } });

describe("ProductBarcodes", () => {
  beforeEach(() => {
    table = new Map([["5411188127697", "oat"]]);
    calls.length = 0;
    rpc.mockClear();
    toast.mockClear();
  });

  it("lists the barcodes that lead to this product", async () => {
    renderFor("oat");
    expect(await screen.findByText("5411188127697")).toBeInTheDocument();
  });

  it("says so when none do", async () => {
    renderFor("almond");
    expect(await screen.findByText(/No barcode leads here yet/)).toBeInTheDocument();
  });

  it("removes a barcode, so the next scan asks again", async () => {
    renderFor("oat");
    fireEvent.click(await screen.findByRole("button", { name: "Remove barcode 5411188127697" }));

    await waitFor(() => expect(screen.getByText(/No barcode leads here yet/)).toBeInTheDocument());
    expect(table.has("5411188127697")).toBe(false);
  });

  it("adds a barcode nobody has claimed without asking", async () => {
    renderFor("almond");
    await screen.findByText(/No barcode leads here yet/);
    typeBarcode("5411188110835");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("5411188110835")).toBeInTheDocument();
    expect(table.get("5411188110835")).toBe("almond");
  });

  it("names the product a barcode would be taken from, and moves it only when told", async () => {
    // The correction this exists for: the Almond carton's barcode was
    // recorded against Oat.
    renderFor("almond");
    await screen.findByText(/No barcode leads here yet/);
    typeBarcode("5411188127697");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Alpro Oat");
    expect(table.get("5411188127697")).toBe("oat");

    fireEvent.click(screen.getByRole("button", { name: "Move it here" }));
    // The question names the barcode too, so wait for it to go before
    // looking for the barcode in the list.
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect((await screen.findByRole("listitem")).textContent).toContain("5411188127697");
    expect(table.get("5411188127697")).toBe("almond");
  });

  it("leaves it where it was when the admin says no", async () => {
    renderFor("almond");
    await screen.findByText(/No barcode leads here yet/);
    typeBarcode("5411188127697");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    fireEvent.click(await screen.findByRole("button", { name: "Leave it" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(table.get("5411188127697")).toBe("oat");
    expect(calls).not.toContain("admin_set_product_barcode");
  });

  it("refuses something that is not a barcode before asking the database", async () => {
    renderFor("almond");
    await screen.findByText(/No barcode leads here yet/);
    typeBarcode("12345");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "That is not a barcode" }));
    expect(calls).not.toContain("get_product_by_barcode");
    expect(calls).not.toContain("admin_set_product_barcode");
  });

  it("adds on Enter without submitting the product form around it", async () => {
    const { onSubmit } = renderFor("almond");
    await screen.findByText(/No barcode leads here yet/);
    typeBarcode("5411188110835");
    fireEvent.keyDown(screen.getByLabelText("Add a barcode"), { key: "Enter" });

    expect(await screen.findByText("5411188110835")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
