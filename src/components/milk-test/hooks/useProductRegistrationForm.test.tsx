import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useProductRegistrationForm } from "./useProductRegistrationForm";

const submit = vi.hoisted(() => vi.fn());

vi.mock("./product-registration", () => ({
  handleProductSubmit: submit,
  resetFormState: vi.fn(),
}));

vi.mock("./useProductFlavors", () => ({
  useProductFlavors: () => ({ flavors: [], flavorQuery: {}, handleFlavorToggle: vi.fn() }),
}));

const setup = () => {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(
    () => useProductRegistrationForm({ open: true, onOpenChange: vi.fn(), onSuccess: vi.fn(), editProductId: "p1" }),
    { wrapper },
  );
  return { result, invalidate };
};

const save = async (result: ReturnType<typeof setup>["result"]) => {
  await act(async () => {
    await result.current.originalHandleSubmit({ preventDefault: () => {} } as never);
  });
};

describe("useProductRegistrationForm", () => {
  it("refreshes the product page and feed after a product is saved", async () => {
    submit.mockResolvedValueOnce({ productId: "p1", brandId: "b1", isDuplicate: false });
    const { result, invalidate } = setup();
    await save(result);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["product-details"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["feed"] });
  });

  it("refreshes nothing when the save failed", async () => {
    submit.mockResolvedValueOnce(null);
    const { result, invalidate } = setup();
    await save(result);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
