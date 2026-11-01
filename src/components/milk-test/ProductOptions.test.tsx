import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductOptions } from "./ProductOptions";

const rows = vi.hoisted(() => [{ id: "1", key: "unsweetened", name: "Unsweetened", ordering: 3 }]);
const insert = vi.hoisted(() =>
  vi.fn(async (row: { key: string; name: string; ordering: number }) => {
    rows.push({ id: "2", ...row });
    return { error: null };
  }),
);

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: async () => ({ data: [...rows] }) }),
      insert,
    }),
  },
}));

const renderOptions = (canAdd: boolean, setSelectedTypes = vi.fn()) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProductOptions selectedTypes={[]} setSelectedTypes={setSelectedTypes} canAdd={canAdd} />
    </QueryClientProvider>,
  );

describe("ProductOptions", () => {
  it("offers no add button to non-admins", async () => {
    renderOptions(false);
    await screen.findByText("Unsweetened");
    expect(screen.queryByLabelText("Add new property")).toBeNull();
  });

  it("lets an admin add a property, after the last one, and selects it", async () => {
    const setSelectedTypes = vi.fn();
    renderOptions(true, setSelectedTypes);
    fireEvent.click(await screen.findByLabelText("Add new property"));
    fireEvent.change(screen.getByPlaceholderText("Property name"), { target: { value: "Sweetened" } });
    fireEvent.click(screen.getByLabelText("Add property"));

    await screen.findByText("Sweetened");
    expect(insert).toHaveBeenCalledWith({ name: "Sweetened", key: "sweetened", ordering: 4 });
    await waitFor(() => expect(setSelectedTypes).toHaveBeenCalledWith(["sweetened"]));
  });
});
