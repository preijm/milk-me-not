import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * The shop box, and the name it used to throw away.
 *
 * Shop is optional, so nothing blocks a submit — which meant a reader could
 * type "Albert Heijn", see it sitting in the box, post the rating, and save no
 * shop at all. `milk_tests.shop_name` is free text and the `shops` table is
 * only a suggestion list, so there was never anything being protected by
 * discarding it.
 */

const shops = vi.hoisted(() => ({ rows: [] as { name: string; country_code: string | null }[] }));

vi.mock("@/components/ui/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }));

// ShopSuggestions renders an admin-only affordance, and useAdminCheck reads the
// auth context. Nothing here is about admin, so it is answered rather than
// wrapped in a provider.
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));

vi.mock("@/integrations/supabase/client", () => {
  // ShopSuggestions pulls in useAdminCheck, so the client has to answer more
  // than the shops query. A chainable stand-in satisfies whatever call order
  // each of them uses without this file having to know.
  const chain = (result: unknown): unknown => {
    const proxy: unknown = new Proxy(function () {} as unknown as object, {
      get(_target, prop) {
        if (prop === "then") {
          return (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
        }
        return () => proxy;
      },
      apply() {
        return proxy;
      },
    });
    return proxy;
  };

  return {
    supabase: {
      from: (table: string) =>
        chain(table === "shops" ? { data: shops.rows, error: null } : { data: null, error: null }),
      rpc: () => chain({ data: false, error: null }),
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    },
  };
});

const { ShopSelect } = await import("./ShopSelect");

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

/** Render with a spy on what reaches the form. */
const setup = (initial: string | null = null) => {
  const setShop = vi.fn();
  render(<ShopSelect shop={initial} setShop={setShop} />, { wrapper });
  return { setShop, input: screen.getByPlaceholderText("Search or add shop...") };
};

const lastValue = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.length ? spy.mock.calls[spy.mock.calls.length - 1][0] : undefined;

describe("ShopSelect", () => {
  beforeEach(() => {
    shops.rows = [{ name: "Albert Heijn", country_code: "NL" }];
  });

  it("keeps a name that was typed but never picked from the list", async () => {
    const { setShop, input } = setup();

    fireEvent.change(input, { target: { value: "Jumbo" } });

    expect(lastValue(setShop)).toBe("Jumbo");
  });

  it("does not lose a chosen shop the moment the field is touched", async () => {
    // Editing used to clear the selection while still showing the old name,
    // so a rating saved with no shop and a box that said otherwise.
    const { setShop, input } = setup("Albert Heijn");

    fireEvent.change(input, { target: { value: "Albert Heijn " } });

    expect(lastValue(setShop)).not.toBe("");
  });

  it("settles on the board's spelling when the same shop is already known", async () => {
    // "albert heijn" and "Albert Heijn" are one shop, and the second is what
    // every other rating says.
    const { setShop, input } = setup();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "albert heijn" } });
    // The shop list arrives asynchronously, and there is nothing to settle
    // against until it has. Waiting for the suggestion is waiting for that.
    await screen.findByText("Albert Heijn");
    fireEvent.blur(input);

    await waitFor(() => expect(lastValue(setShop)).toBe("Albert Heijn"));
  });

  it("trims on the way out", async () => {
    const { setShop, input } = setup();

    fireEvent.change(input, { target: { value: "  Jumbo  " } });
    fireEvent.blur(input);

    await waitFor(() => expect(lastValue(setShop)).toBe("Jumbo"));
  });

  it("treats an emptied box as no shop rather than as a blank one", async () => {
    const { setShop, input } = setup("Albert Heijn");

    fireEvent.change(input, { target: { value: "   " } });

    expect(lastValue(setShop)).toBe("");
  });

  it("still selects a suggestion when one is clicked", async () => {
    const { setShop, input } = setup();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Albert" } });

    const suggestion = await screen.findByText("Albert Heijn");
    // The row commits on mousedown, not click — a dropdown has to act before
    // the input's blur closes it.
    fireEvent.mouseDown(suggestion);

    await waitFor(() => expect(lastValue(setShop)).toBe("Albert Heijn"));
  });
});
