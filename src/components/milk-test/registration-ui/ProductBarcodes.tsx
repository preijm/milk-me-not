import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScanBarcode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isBarcode } from "@/lib/rememberBarcode";

/** Where a barcode that belongs to another product currently points. */
type Conflict = { barcode: string; productId: string; label: string };

const productBarcodesKey =(productId: string) => ["product-barcodes", productId] as const;

/**
 * The barcodes that lead to this product, for an admin to correct.
 *
 * `product_barcodes` is first write wins: a scan records the barcode against
 * whatever the reader picked, and nobody scanning after can move it. That
 * keeps a careless scan from overwriting a good mapping, and it means a bad
 * one stays bad — every scan of that carton lands on the wrong product. This
 * is the only place one can be undone short of SQL.
 *
 * Changes apply at once rather than on the form's Update. They are a
 * different kind of edit — to which cartons find this product, not to what
 * the product is — and an admin who opened the form to fix a barcode should
 * not also have to save a product they never meant to change.
 *
 * Every button here is `type="button"`, and Enter in the field is caught: this
 * sits inside the product form, and a stray submit would save the product.
 */
export const ProductBarcodes = ({ productId }: { productId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<Conflict | null>(null);

  const { data: barcodes = [], isLoading } = useQuery({
    queryKey: productBarcodesKey(productId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_product_barcodes", {
        _product_id: productId,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: productBarcodesKey(productId) });

  const fail = (what: string, error: { message: string }) => {
    console.error(`Could not ${what}:`, error);
    toast({ title: `Could not ${what}`, description: error.message, variant: "destructive" });
  };

  const save = async (barcode: string) => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_set_product_barcode", {
      _barcode: barcode,
      _product_id: productId,
    });
    setBusy(false);
    if (error) return fail("save the barcode", error);
    setDraft("");
    setConflict(null);
    await refresh();
  };

  /**
   * Add a barcode, asking first if it already leads somewhere else.
   *
   * Moving one is the correction this exists for, but it is also exactly what
   * a typo would do to a barcode that was right — so the product it would be
   * taken from is named before anything moves.
   */
  const add = async () => {
    const barcode = draft.trim();
    if (!isBarcode(barcode)) {
      toast({ title: "That is not a barcode", description: "A barcode is 8 to 14 digits.", variant: "destructive" });
      return;
    }

    setBusy(true);
    const { data: current, error } = await supabase.rpc("get_product_by_barcode", { _barcode: barcode });
    if (error) {
      setBusy(false);
      return fail("check the barcode", error);
    }

    if (typeof current === "string" && current && current !== productId) {
      const { data: other } = await supabase
        .from("product_search_view")
        .select("brand_name, product_name")
        .eq("id", current)
        .maybeSingle();
      setBusy(false);
      setConflict({
        barcode,
        productId: current,
        label: [other?.brand_name, other?.product_name].filter(Boolean).join(" ") || "another product",
      });
      return;
    }

    setBusy(false);
    if (current === productId) {
      setDraft("");
      return;
    }
    await save(barcode);
  };

  const remove = async (barcode: string) => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_delete_product_barcode", { _barcode: barcode });
    setBusy(false);
    if (error) return fail("remove the barcode", error);
    await refresh();
  };

  return (
    <div className="space-y-2">
      <span className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-ink-2">
        <ScanBarcode className="h-4 w-4 text-story-muted" />
        Barcodes
      </span>
      <p className="text-[0.75rem] text-story-muted">
        Scanning one of these comes straight here. Changes save at once.
      </p>

      {isLoading ? (
        <p className="text-[0.8125rem] text-story-muted">Loading…</p>
      ) : barcodes.length === 0 ? (
        <p className="text-[0.8125rem] text-story-muted">No barcode leads here yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {barcodes.map((b) => (
            <li
              key={b.barcode}
              className="story-hairline flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-1.5"
            >
              <span className="font-mono text-[0.8125rem] text-story-ink">{b.barcode}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => remove(b.barcode)}
                aria-label={`Remove barcode ${b.barcode}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {conflict ? (
        <div role="alert" className="space-y-2 rounded-xl bg-story-cream-2 p-3 text-[0.8125rem] text-story-ink">
          <p>
            <span className="font-mono">{conflict.barcode}</span> leads to <strong>{conflict.label}</strong>{" "}
            now. Move it here?
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="brand" disabled={busy} onClick={() => save(conflict.barcode)}>
              Move it here
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setConflict(null)}>
              Leave it
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void add();
              }
            }}
            inputMode="numeric"
            placeholder="Add a barcode"
            aria-label="Add a barcode"
            className="font-mono"
          />
          <Button type="button" variant="outline" disabled={busy || !draft.trim()} onClick={() => void add()}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
};
