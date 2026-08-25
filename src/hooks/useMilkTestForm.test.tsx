import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * What reaches `milk_tests`, and what is stopped before it does.
 *
 * This is the only write path a reader has: 407 lines between a form and a row
 * in the database. Nothing here is type-checked in any useful sense — every
 * refusal is an early `return` after a toast, so a broken guard does not throw
 * or warn, it just lets something through. And a rating saved wrongly is not
 * recoverable by redeploying: it is somebody's data, now wrong.
 *
 * So these tests are mostly about what does *not* get written.
 */

const captured = vi.hoisted(() => ({
  inserted: [] as Record<string, unknown>[],
  updated: [] as Record<string, unknown>[],
  updatedId: null as string | null,
  user: { id: "u1" } as { id: string } | null,
  invalidated: [] as unknown[],
  toasts: [] as { title?: string; description?: string }[],
  navigated: [] as string[],
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (t: { title?: string; description?: string }) => captured.toasts.push(t) }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => (to: string) => captured.navigated.push(to),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: captured.user }) }));
vi.mock("./useUserProfile", () => ({ useUserProfile: () => ({ profile: null }) }));

vi.mock("@/integrations/supabase/client", () => {
  const single = async () => ({ data: { id: "t1" }, error: null });

  const table = (name: string) => ({
    insert: (row: Record<string, unknown>) => {
      if (name === "milk_tests") captured.inserted.push(row);
      return { select: () => ({ single }) };
    },
    update: (row: Record<string, unknown>) => {
      if (name === "milk_tests") captured.updated.push(row);
      return {
        eq: (_col: string, value: string) => {
          captured.updatedId = value;
          return { select: () => ({ single }) };
        },
      };
    },
    // The profile existence check.
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: { id: "u1" }, error: null }) }),
    }),
  });

  return {
    supabase: {
      auth: { getUser: async () => ({ data: { user: captured.user }, error: null }) },
      from: table,
      storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    },
  };
});

const { useMilkTestForm } = await import("./useMilkTestForm");

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  client.invalidateQueries = (async (args: unknown) => {
    captured.invalidated.push(args);
  }) as typeof client.invalidateQueries;
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

/** Fill the form in, then submit it. */
type Form = ReturnType<typeof useMilkTestForm>;

const submit = async (fill: (s: Form["formSetters"]) => void) => {
  const { result } = renderHook(() => useMilkTestForm(), { wrapper });
  act(() => fill(result.current.formSetters));
  await act(async () => {
    await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  });
  return result;
};

const valid = (f: Form["formSetters"]) => {
  f.setProductId("p1");
  f.setRating(4);
  f.setCountry("NL");
};

const lastToast = () => captured.toasts[captured.toasts.length - 1];

describe("useMilkTestForm", () => {
  beforeEach(() => {
    captured.inserted = [];
    captured.updated = [];
    captured.updatedId = null;
    captured.invalidated = [];
    captured.toasts = [];
    captured.navigated = [];
    captured.user = { id: "u1" };
  });

  describe("what it refuses to write", () => {
    it("will not save a rating with no country", async () => {
      await submit((f) => {
        f.setProductId("p1");
        f.setRating(4);
      });

      expect(captured.inserted).toHaveLength(0);
      expect(lastToast()?.title).toBe("Country required");
    });

    it("will not save a rating above the scale", async () => {
      // The stars only go to 5, but nothing between the form state and the
      // database enforces that on its own.
      await submit((f) => {
        valid(f);
        f.setRating(11);
      });

      expect(captured.inserted).toHaveLength(0);
      expect(lastToast()?.description).toMatch(/between 0 and 10/);
    });

    it("will not save a note longer than the column expects", async () => {
      await submit((f) => {
        valid(f);
        f.setNotes("x".repeat(1001));
      });

      expect(captured.inserted).toHaveLength(0);
      expect(lastToast()?.description).toMatch(/less than 1000/);
    });

    it("will not save a country code that is not two capitals", async () => {
      await submit((f) => {
        valid(f);
        f.setCountry("nl");
      });

      expect(captured.inserted).toHaveLength(0);
    });

    it("will not save anything when nobody is signed in", async () => {
      captured.user = null;
      await submit(valid);

      expect(captured.inserted).toHaveLength(0);
      expect(lastToast()?.title).toBe("Authentication required");
    });

    it("lets the reader try again after a refusal", async () => {
      // A guard that returns without clearing isSubmitting leaves the save
      // button disabled forever, and the only way out is a page reload.
      captured.user = null;
      const result = await submit(valid);

      await waitFor(() => expect(result.current.formState.isSubmitting).toBe(false));
    });
  });

  describe("what it writes", () => {
    it("saves the rating against the product and the reader", async () => {
      await submit((f) => {
        valid(f);
        f.setNotes("Tastes like oats");
        f.setShop("Albert Heijn");
      });

      expect(captured.inserted).toHaveLength(1);
      expect(captured.inserted[0]).toMatchObject({
        product_id: "p1",
        rating: 4,
        country_code: "NL",
        user_id: "u1",
      });
      expect(captured.inserted[0].notes).toContain("oats");
      expect(captured.inserted[0].shop_name).toContain("Albert Heijn");
    });

    it("writes null rather than an empty string for an untouched note or shop", async () => {
      // The column is nullable and "no note" is not the same fact as "".
      await submit(valid);

      expect(captured.inserted[0].notes).toBeNull();
      expect(captured.inserted[0].shop_name).toBeNull();
    });

    it("leaves price out entirely unless the reader chose one", async () => {
      await submit(valid);
      expect(captured.inserted[0]).not.toHaveProperty("price_quality_ratio");

      captured.inserted = [];
      await submit((f) => {
        valid(f);
        f.setPrice("good");
        f.setPriceHasChanged(true);
      });
      expect(captured.inserted[0].price_quality_ratio).toBe("good");
    });

    it("refreshes the product page's own counts, not just the board", async () => {
      // Saving used to always redirect to /feed, which hid this: the quick
      // rate sheet leaves the reader on the product page, where a stale
      // "1 person has rated this" is the first thing they see after rating it.
      await submit(valid);

      const keys = JSON.stringify(captured.invalidated);
      expect(keys).toContain("product-details");
      expect(keys).toContain("product-test-count");
      expect(keys).toContain("milk-tests-aggregated");
    });

    it("stays put when the caller asked to handle it, instead of redirecting", async () => {
      const onSaved = vi.fn();
      const { result } = renderHook(() => useMilkTestForm(undefined, { onSaved }), { wrapper });
      act(() => valid(result.current.formSetters));
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      });

      expect(onSaved).toHaveBeenCalled();
      expect(captured.navigated).toHaveLength(0);
    });
  });
});
