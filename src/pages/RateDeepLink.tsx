import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { setPendingRating } from "@/lib/pendingRating";
import { humanizeLabels } from "@/lib/labels";
import logoImg from "@/assets/logo-96.png";
import { ArrowRight, Carton, MilkDrop, StoryButton } from "@/components/story";

/**
 * `/rate/:productId` — the shelf-QR entry point.
 *
 * This is the one route that deliberately skips the pitch. Someone standing in
 * front of the carton with their phone out already knows what the product is
 * and does not need to be sold the site; they need the rating form, now.
 * Signed-in visitors never see this screen at all — it redirects straight
 * through. Everyone else gets a single focused hand-off, not the marketing site.
 */
const RateDeepLink = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["rate-deep-link", productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from("product_search_view")
        .select("id, brand_id, brand_name, product_name, property_names, is_barista")
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    retry: 1,
  });

  const resolved = product?.id && product?.brand_id ? product : null;

  // Signed in and the code resolved: straight into the form, product already chosen.
  useEffect(() => {
    if (user && resolved) {
      navigate("/add", {
        replace: true,
        state: { selectedProductId: resolved.id, selectedBrandId: resolved.brand_id },
      });
    }
  }, [user, resolved, navigate]);

  const startRating = () => {
    if (!resolved) return;
    setPendingRating({
      productId: resolved.id as string,
      brandId: resolved.brand_id as string,
      label: `${resolved.brand_name ?? ""} ${resolved.product_name ?? ""}`.trim(),
    });
    navigate("/auth", { state: { from: "/add", mode: "signup" } });
  };

  if (isLoading || (user && resolved)) {
    return (
      <div className="story-surface flex min-h-dvh items-center justify-center">
        <Loader className="h-7 w-7 animate-spin text-story-green-dark" aria-label="Loading" />
      </div>
    );
  }

  // Unknown code — send them somewhere useful rather than a dead end.
  if (isError || !resolved) {
    return (
      <div className="story-surface flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Seo
          title="Rate a plant milk — Milk Me Not"
          description="Scan a code, log a rating."
          path={`/rate/${productId ?? ""}`}
          noindex
        />
        <img src={logoImg} alt="" className="h-14 w-14 rounded-xl object-contain" width={56} height={56} />
        <h1 className="story-display mt-6 text-[clamp(1.75rem,7vw,2.5rem)] text-story-ink">
          We don't know this one yet.
        </h1>
        <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-story-muted">
          That code doesn't match a product in the catalogue. Search for it, or add it — either way it takes about a
          minute.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
          <StoryButton onClick={() => navigate("/results")} className="w-full">
            Search the catalogue
            <ArrowRight />
          </StoryButton>
          <Link
            to="/"
            className="rounded-full py-3 text-center text-[0.9375rem] font-bold text-story-muted no-underline"
          >
            Go to Milk Me Not
          </Link>
        </div>
      </div>
    );
  }

  const meta = humanizeLabels([
    resolved.is_barista ? "barista" : null,
    ...((resolved.property_names as string[] | null) ?? []),
  ]);

  return (
    <div className="story-surface flex min-h-dvh flex-col px-6 py-8">
      <Seo
        title={`Rate ${resolved.brand_name} ${resolved.product_name} — Milk Me Not`}
        description="Log your rating for this plant milk. Takes about ninety seconds."
        path={`/rate/${productId ?? ""}`}
        noindex
      />

      <img src={logoImg} alt="Milk Me Not" className="h-10 w-10 rounded-lg object-contain" width={40} height={40} />

      <div className="relative flex flex-1 flex-col justify-center">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-6 text-story-green opacity-90">
          <MilkDrop size={200} />
        </div>

        <p className="story-kicker relative text-story-green-dark">You're rating</p>

        <div className="relative mt-4 flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-story-green-wash text-story-green-dark">
            <Carton size={36} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.9375rem] font-medium text-story-muted">{resolved.brand_name}</p>
            <h1 className="story-display text-[clamp(1.9rem,8vw,2.6rem)] leading-[1.02] text-story-ink">
              {resolved.product_name}
            </h1>
            {meta.length > 0 && (
              <p className="mt-2 text-[0.8125rem] font-semibold text-story-muted-2">{meta.join(" · ")}</p>
            )}
          </div>
        </div>

        <p className="relative mt-8 max-w-sm text-[0.9375rem] leading-relaxed text-story-muted">
          Score it out of ten and, if you like, say why. Ninety seconds, no photo needed. We just need an account so the
          rating has someone behind it.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <StoryButton onClick={startRating} className="w-full">
          Continue to rating
          <ArrowRight />
        </StoryButton>
        <Link
          to={`/product/${resolved.id}`}
          className="rounded-full py-3 text-center text-[0.9375rem] font-bold text-story-muted no-underline"
        >
          See what others scored it
        </Link>
      </div>
    </div>
  );
};

export default RateDeepLink;
