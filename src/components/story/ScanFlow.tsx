import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BarcodeScanner } from "@/components/milk-test/BarcodeScanner";
import { BrandMark } from "./BrandMark";
import { StoryButton, ArrowRight } from "./primitives";
import type { ScannedProduct } from "@/lib/openFoodFacts";
import { createProductFromScan } from "@/lib/createScannedProduct";

type BoardMatch = {
  id: string;
  product_name: string;
  brand_name: string;
  is_barista: boolean;
};

type Stage =
  | { at: "scanning" }
  | { at: "searching" }
  | { at: "matches"; scanned: ScannedProduct; matches: BoardMatch[] }
  | { at: "nothing"; scanned: ScannedProduct };

/**
 * Scan a carton in a shop to see what the board already thinks of it.
 *
 * This cannot pinpoint a product, and it is worth being plain about why: there
 * is no barcode column, so the scanned number is resolved through Open Food
 * Facts and then matched on brand. Retail names and board names do not line up
 * — Open Food Facts calls one carton "OAT-LY! iKAFFE BARISTA EDITION" and the
 * board calls it "Oat" by "Oatly!", and searching the board for "ikaffe"
 * returns nothing at all. Brand narrows 220 products to a handful; the last
 * step is a tap. Storing barcodes would make it exact.
 */
export const ScanFlow = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>({ at: "scanning" });
  const [adding, setAdding] = useState(false);

  const close = () => {
    setStage({ at: "scanning" });
    setAdding(false);
    onClose();
  };

  /** Straight to the product, which is the whole point of scanning one. */
  const goToProduct = useCallback(
    (productId: string) => {
      close();
      navigate(`/product/${productId}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate],
  );

  const handleScan = useCallback(async (scanned: ScannedProduct) => {
    setStage({ at: "searching" });

    // Has anyone scanned this exact carton before? If so there is nothing to
    // choose between and no reason to ask.
    const { data: known } = await supabase.rpc("get_product_by_barcode", {
      _barcode: scanned.barcode,
    });
    if (typeof known === "string" && known) {
      goToProduct(known);
      return;
    }

    const term = scanned.brand ?? scanned.name;
    if (!term) {
      setStage({ at: "nothing", scanned });
      return;
    }

    const { data } = await supabase.rpc("search_product_types", {
      search_term: term.toLowerCase(),
    });

    const rows = (data ?? []) as BoardMatch[];
    if (rows.length === 0) {
      setStage({ at: "nothing", scanned });
      return;
    }

    // A barista scan almost certainly means the barista carton.
    const ranked = scanned.isBarista
      ? [...rows].sort((a, b) => Number(b.is_barista) - Number(a.is_barista))
      : rows;

    // Only one carton it could be — asking would be a question with one answer.
    if (ranked.length === 1) {
      void supabase.rpc("remember_product_barcode", {
        _barcode: scanned.barcode,
        _product_id: ranked[0].id,
      });
      goToProduct(ranked[0].id);
      return;
    }

    setStage({ at: "matches", scanned, matches: ranked.slice(0, 8) });
  }, [goToProduct]);

  if (stage.at === "scanning") {
    return <BarcodeScanner open={open} onClose={close} onScan={handleScan} />;
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="story-surface max-h-[85dvh] max-w-md overflow-y-auto rounded-3xl border-story-ink/10 bg-story-cream p-5">
        {stage.at === "searching" && (
          <>
            <DialogTitle className="story-serif text-[1.15rem] font-bold text-story-ink">
              Checking the board…
            </DialogTitle>
            <DialogDescription className="text-[0.875rem] text-story-muted">
              One moment.
            </DialogDescription>
          </>
        )}

        {stage.at === "matches" && (
          <>
            <DialogTitle className="story-serif text-[1.15rem] font-bold text-story-ink">
              {stage.scanned.brand ?? "Found it"} on the board
            </DialogTitle>
            <DialogDescription className="text-[0.875rem] text-story-muted">
              Pick the one in your hand — we will remember it next time.
            </DialogDescription>
            <ul className="mt-1 space-y-2">
              {stage.matches.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => {
                      // Now we know which carton this barcode is. Record it so
                      // the next person to scan it goes straight through.
                      void supabase.rpc("remember_product_barcode", {
                        _barcode: stage.scanned.barcode,
                        _product_id: m.id,
                      });
                      goToProduct(m.id);
                    }}
                    className="story-hairline flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition-colors hover:bg-story-cream-2"
                  >
                    <BrandMark brand={m.brand_name} product={m.product_name} className="h-10 w-10 shrink-0" radius="rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] font-bold text-story-ink">
                        {m.product_name}
                      </span>
                      <span className="block truncate text-[0.8125rem] text-story-muted">
                        {m.brand_name}
                        {m.is_barista ? " · Barista" : ""}
                      </span>
                    </span>
                    <ArrowRight className="shrink-0 text-story-muted-2" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {stage.at === "nothing" && (
          <>
            <DialogTitle className="story-serif text-[1.15rem] font-bold text-story-ink">
              {stage.scanned.brand && stage.scanned.name ? "Nobody has rated this yet" : "Not on the board yet"}
            </DialogTitle>

            {stage.scanned.brand && stage.scanned.name ? (
              <>
                {/* Open Food Facts already knows what this is, so the reader
                    confirms rather than types. Filling a blank form in a shop
                    is the thing that stops people bothering. */}
                <DialogDescription className="text-[0.875rem] text-story-muted">
                  We read it as:
                </DialogDescription>
                <div className="story-hairline flex items-center gap-3 rounded-2xl bg-white p-3">
                  <BrandMark
                    brand={stage.scanned.brand}
                    product={stage.scanned.name}
                    className="h-11 w-11 shrink-0"
                    radius="rounded-xl"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9375rem] font-bold text-story-ink">
                      {stage.scanned.name}
                    </span>
                    <span className="block truncate text-[0.8125rem] text-story-muted">
                      {stage.scanned.brand}
                      {stage.scanned.quantity ? ` · ${stage.scanned.quantity}` : ""}
                      {stage.scanned.isBarista ? " · Barista" : ""}
                    </span>
                  </span>
                </div>

                <StoryButton
                  className="mt-1 w-full"
                  disabled={adding}
                  onClick={async () => {
                    setAdding(true);
                    const made = await createProductFromScan(stage.scanned);
                    if (made) {
                      goToProduct(made.productId);
                      return;
                    }
                    setAdding(false);
                    // Falling back rather than dead-ending: the full form still
                    // works, and arrives with what the scan already knew.
                    close();
                    navigate("/add-product", { state: { scanned: stage.scanned } });
                  }}
                >
                  {adding ? "Adding it…" : "Add it and be first to rate it"}
                  {!adding && <ArrowRight />}
                </StoryButton>

                <button
                  type="button"
                  onClick={() => {
                    close();
                    navigate("/add-product", { state: { scanned: stage.scanned } });
                  }}
                  className="text-center text-[0.8125rem] font-bold text-story-muted"
                >
                  Change the details first
                </button>
              </>
            ) : (
              <>
                <DialogDescription className="text-[0.875rem] text-story-muted">
                  Nothing on file for that barcode, so you will need to fill it in.
                </DialogDescription>
                <StoryButton
                  className="mt-1 w-full"
                  onClick={() => {
                    close();
                    navigate("/add-product", { state: { scanned: stage.scanned } });
                  }}
                >
                  Add it to the board
                  <ArrowRight />
                </StoryButton>
              </>
            )}
          </>
        )}

        <StoryButton tone="outline" size="sm" className="mt-1 w-full" onClick={close}>
          Close
        </StoryButton>
      </DialogContent>
    </Dialog>
  );
};

export default ScanFlow;
