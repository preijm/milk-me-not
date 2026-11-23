import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BarcodeScanner } from "@/components/milk-test/BarcodeScanner";
import { ProductIdentity } from "./ProductIdentity";
import { StoryButton, ArrowRight } from "./primitives";
import type { ScannedProduct } from "@/lib/openFoodFacts";
import { createProductFromScan } from "@/lib/createScannedProduct";
import { suggestFromScan } from "@/lib/scanSuggestions";
import { rankScanMatches } from "@/lib/rankScanMatches";
import { rememberBarcode } from "@/lib/rememberBarcode";

/**
 * A row from `search_product_types`, badges and all.
 *
 * The flavour and property arrays were being dropped on the floor, and they
 * are the only thing that answers the question this dialog asks. A scan of an
 * Alpro carton returns 27 rows: six are called "Soya" and differ only by
 * Banana, Red fruits, Light, Protein, Protein + Chocolate or nothing, and two
 * are called "Oat, Soya" and differ only by Caramel or Vanilla. Without them
 * the reader is asked which carton is in their hand and shown two identical
 * answers.
 */
type BoardMatch = {
  id: string;
  product_name: string;
  brand_name: string;
  is_barista: boolean;
  /** Raw keys, nullable — `humanizeLabels` inside ProductIdentity does the rest. */
  property_names: string[] | null;
  flavor_names: string[] | null;
};

type Stage =
  | { at: "scanning" }
  | { at: "searching" }
  | { at: "matches"; scanned: ScannedProduct; matches: BoardMatch[]; total: number }
  | { at: "nothing"; scanned: ScannedProduct };

/**
 * Scan a carton in a shop to see what the board already thinks of it.
 *
 * A barcode the board has seen before is exact: `product_barcodes` maps it
 * straight to a product and the reader never sees this dialog. A barcode it
 * has not seen is the fuzzy case. The number is resolved through Open Food
 * Facts and matched on brand, because retail names and board names do not
 * line up — Open Food Facts calls one carton "OAT-LY! iKAFFE BARISTA EDITION"
 * and the board calls it "Oat" by "Oatly!", and searching the board for
 * "ikaffe" returns nothing at all. Brand narrows the board to a handful,
 * `rankScanMatches` puts the likeliest first, and the reader's tap is what
 * teaches the board the barcode for everyone after.
 *
 * So every way out of this dialog that ends on a product should record the
 * barcode — picking a row here, the one-tap add, and the full form too (see
 * `AddProduct.tsx`). A path that does not is a scan the board learns nothing
 * from.
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

    // Base, barista, flavours and properties, not barista alone: only eight
    // rows fit, and the right carton has to be among them.
    const ranked = rankScanMatches(scanned, rows);

    // A single match is still asked about, never assumed. It used to go
    // straight through and record the barcode, on the reasoning that a
    // question with one answer is not worth asking — but there are always two
    // answers, that one and "none of these". A brand with only its Oat on the
    // board would take the barcode of its Almond carton, and the first write
    // wins: every later scan of that Almond went to Oat, and nothing a reader
    // could do would move it. One tap is cheap against that.
    //
    // Eight is as many as fits a dialog, and the count says so rather than
    // leaving a reader scrolling for a carton that was never rendered.
    setStage({ at: "matches", scanned, matches: ranked.slice(0, 8), total: ranked.length });
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
              {stage.matches.length === 1
                ? "Is this the one in your hand? We will remember it next time."
                : "Pick the one in your hand — we will remember it next time."}
              {/* Whatever is picked here is written against the barcode for
                  everyone after, so a reader whose carton was cut from the list
                  needs to know that rather than settle for the nearest row. */}
              {stage.total > stage.matches.length &&
                ` Showing the closest ${stage.matches.length} of ${stage.total}.`}
            </DialogDescription>
            <ul className="mt-1 space-y-2">
              {stage.matches.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={async () => {
                      // Now we know which carton this barcode is. Record it so
                      // the next person to scan it goes straight through — and
                      // wait for it, because navigating away first used to
                      // leave the request unsent.
                      await rememberBarcode(stage.scanned.barcode, m.id);
                      goToProduct(m.id);
                    }}
                    className="story-hairline flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition-colors hover:bg-story-cream-2"
                  >
                    <ProductIdentity
                      brand={m.brand_name}
                      product={m.product_name}
                      properties={m.property_names}
                      flavors={m.flavor_names}
                      isBarista={m.is_barista}
                      size="sm"
                      className="flex-1"
                    />
                    <ArrowRight className="shrink-0 text-story-muted-2" />
                  </button>
                </li>
              ))}
            </ul>

            {/* The way out for a carton that is not in the list. This used to
                say "close this and search the board", which drops the scan on
                the floor: the reader retypes what the barcode already said and
                the board never learns the barcode. The form arrives filled in,
                records the barcode on save, and if the carton turns out to be
                on the board after all, its duplicate check finds it. */}
            <StoryButton
              tone="outline"
              className="mt-1 w-full"
              onClick={() => {
                close();
                navigate("/add-product", { state: { scanned: stage.scanned } });
              }}
            >
              Not here? Add it to the board
              <ArrowRight />
            </StoryButton>
          </>
        )}

        {stage.at === "nothing" && (() => {
          /**
           * What the board would call this, which is not what the carton does.
           *
           * The card used to show Open Food Facts' own product name — "OAT-LY!
           * iKAFFE BARISTA EDITION" — and then add something else entirely,
           * because the board names a product by its milk base. Showing the
           * base is showing what the button will actually do; the carton's own
           * name stays underneath as the thing the reader can check against
           * what is in their hand.
           */
          const suggestion = suggestFromScan(stage.scanned);
          const base = suggestion.bases.join(", ");
          const canAddInOneTap = Boolean(stage.scanned.brand) && suggestion.bases.length > 0;

          return (
          <>
            <DialogTitle className="story-serif text-[1.15rem] font-bold text-story-ink">
              {canAddInOneTap ? "Nobody has rated this yet" : "Not on the board yet"}
            </DialogTitle>

            {canAddInOneTap ? (
              <>
                {/* Open Food Facts already knows what this is, so the reader
                    confirms rather than types. Filling a blank form in a shop
                    is the thing that stops people bothering. */}
                <DialogDescription className="text-[0.875rem] text-story-muted">
                  We read it as:
                </DialogDescription>
                <div className="story-hairline flex items-center gap-3 rounded-2xl bg-white p-3">
                  <span className="min-w-0 flex-1">
                    <ProductIdentity
                      brand={stage.scanned.brand}
                      product={base}
                      isBarista={stage.scanned.isBarista}
                      size="sm"
                    />
                    {(stage.scanned.name || stage.scanned.quantity) && (
                      <span className="mt-1 block pl-12.5 text-[0.75rem] text-story-muted-2">
                        {[stage.scanned.name, stage.scanned.quantity].filter(Boolean).join(" · ")}
                      </span>
                    )}
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
                  {/* Not the same thing as knowing nothing. The barcode may
                      well have named a brand, a flavour or a property, and all
                      of those travel to the form — promising a blank page when
                      one is not coming is its own small discouragement. */}
                  {stage.scanned.brand
                    ? `We could not tell what kind of milk this is, so that part is yours. The rest of what the barcode said is filled in.`
                    : "Nothing on file for that barcode, so you will need to fill it in."}
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
          );
        })()}

        <StoryButton tone="outline" size="sm" className="mt-1 w-full" onClick={close}>
          Close
        </StoryButton>
      </DialogContent>
    </Dialog>
  );
};

export default ScanFlow;
