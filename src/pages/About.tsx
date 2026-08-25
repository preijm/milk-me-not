import { useState } from "react";
import { Seo } from "@/components/Seo";
import { ImageModal } from "@/components/milk-test/ImageModal";
import {
  ArrowRight,
  Band,
  CrestDivider,
  Display,
  Kicker,
  Lede,
  MilkDrop,
  Sprig,
  StoryButton,
  StoryLayout,
  StoryLinkButton,
  useRateCta,
} from "@/components/story";
import { useStoryHome } from "@/components/home/useStoryHome";
import { CARTONS, CULPRITS, SPREADSHEET, TASTING } from "@/components/about/aboutPhotos";

/**
 * About is the page that makes the scores believable, so it is the one place
 * the site leads with photographs — the actual bottles from the joke, the
 * actual spreadsheet. Everywhere else the brand works in flat colour, which
 * makes the real pictures here land harder than they would on a photo-led site.
 */
const About = () => {
  const [zoomed, setZoomed] = useState<string | null>(null);
  const cta = useRateCta();
  const { data } = useStoryHome();

  return (
    <StoryLayout mobileCtaHint="Free forever. No brand deals.">
      <Seo
        title="It started with soy sauce — About Milk Me Not"
        description="A joke between colleagues became a spreadsheet, then an obsession, then a public rating platform for every plant milk on the shelf. This is how Milk Me Not happened."
        path="/about"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div>
            <Kicker>How this started</Kicker>
            <Display as="h1" size="hero" className="mt-5">
              It started with
              <br />
              <span className="text-story-green-dark">soy sauce.</span>
            </Display>
            <Lede className="mt-6 max-w-136">
              A colleague asked whether soy milk meant mixing soy sauce into milk. It was a joke. Someone tried it
              anyway. Nobody has fully recovered.
            </Lede>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <StoryButton onClick={cta.go} className="w-full sm:w-auto">
                {cta.label}
                <ArrowRight />
              </StoryButton>
              <StoryLinkButton to="/results" tone="outline" className="w-full sm:w-auto">
                See what we've scored
              </StoryLinkButton>
            </div>
          </div>

          {/* The two bottles from the actual incident, overlapped and tilted so
              they read as evidence pinned to a board rather than a gallery. */}
          <div className="relative mx-auto flex w-full max-w-md justify-center pt-4 lg:max-w-none">
            <div aria-hidden className="absolute right-6 top-0 h-56 w-56 rounded-full bg-story-green-light sm:h-72 sm:w-72" />
            {CULPRITS.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setZoomed(photo.src)}
                className={`story-lift relative block w-[46%] overflow-hidden rounded-2xl bg-white p-2 transition-transform duration-200 hover:-translate-y-1 sm:w-[44%] ${
                  i === 0 ? "-rotate-3" : "-ml-6 rotate-2 mt-8"
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="eager"
                  className="aspect-3/4 w-full rounded-xl object-cover"
                />
                <span className="mt-2 block text-center text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-story-muted-2">
                  {photo.caption}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Band>

      <div className="text-story-paper">
        <CrestDivider className="block h-12 w-full sm:h-20" />
      </div>

      {/* ── The spreadsheet ──────────────────────────────────────────── */}
      <Band ground="paper" size="lg">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <Kicker>Then it escalated</Kicker>
            <Display size="xl" className="mt-5">
              One of us is a
              <br />
              <span className="text-story-green-dark">data scientist.</span>
            </Display>
            <Lede className="mt-5">
              So the tasting did not stay a tasting. It became a column. Then a tab. Then a hundred-odd rows of brands,
              scores and increasingly unhinged tasting notes, argued over at length by people who had strong opinions
              about oat milk in coffee.
            </Lede>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-story-muted">
              We showed the sheet to friends. They asked for a copy. That is roughly the moment this became a website.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setZoomed(SPREADSHEET.src)}
            className="story-lift group block w-full overflow-hidden rounded-[1.25rem] bg-white p-2.5 text-left"
          >
            <img
              src={SPREADSHEET.src}
              alt={SPREADSHEET.alt}
              loading="lazy"
              className="w-full rounded-xl object-cover"
            />
            <span className="mt-3 block px-2 pb-1 text-[0.8125rem] font-medium italic text-story-muted">
              {SPREADSHEET.caption}
            </span>
          </button>
        </div>
      </Band>

      {/* ── What it is now ───────────────────────────────────────────── */}
      <Band ground="forest" size="lg">
        {/* Desktop only: at 390px this shape lands straight on the headline. */}
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-16 hidden text-story-green lg:block">
          <MilkDrop size={320} variant="solid" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-10 text-story-green lg:hidden">
          <MilkDrop size={130} variant="solid" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 text-story-green-light opacity-10">
          <Sprig size={220} />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <Kicker tone="light">Where it got to</Kicker>
            <Display size="xl" className="mt-5 text-white">
              A hundred rows became
              <br />
              <span className="text-story-green-light">a public shelf.</span>
            </Display>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/70">
              Everything the original founders logged is on this site, scored on the same scale as everything added
              since. Anyone can rate. Nobody can buy a rating. If a brand ever pays us, it will say so on this page
              before it says so anywhere else.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {[
                { value: data?.totalRatings, label: "Ratings logged" },
                { value: data?.products, label: "Products scored" },
                { value: data?.brands, label: "Brands covered" },
              ].map((s) => (
                <div key={s.label}>
                  <dd className="story-num text-[clamp(1.9rem,6vw,2.75rem)] leading-none text-story-green-light">
                    {s.value ?? "—"}
                  </dd>
                  <dt className="story-kicker mt-2 text-white/50">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <button
            type="button"
            onClick={() => setZoomed(TASTING.src)}
            className="relative block overflow-hidden rounded-[1.25rem] bg-white/5 p-2.5 text-left"
          >
            <img
              src={TASTING.src}
              alt={TASTING.alt}
              loading="lazy"
              className="aspect-4/3 w-full rounded-xl object-cover"
            />
            <span className="mt-3 block px-2 pb-1 text-[0.8125rem] font-medium italic text-white/55">
              {TASTING.caption}
            </span>
          </button>
        </div>
      </Band>

      {/* ── The cartons ──────────────────────────────────────────────── */}
      <Band ground="cream" size="lg" width="full" innerClassName="">
        <div className="mx-auto w-full max-w-304 px-5 sm:px-8 lg:px-10">
          <Kicker>The evidence</Kicker>
          <Display size="lg" className="mt-4 max-w-2xl">
            Some of the cartons that got us here
          </Display>
          <Lede className="mt-4 max-w-xl">
            Photographed mid-rating, in kitchens, by people who had already opened them. Scroll.
          </Lede>
        </div>

        {/* Full-bleed rail — the pictures run off the edge on purpose. */}
        {/* The fade is the affordance — it says the rail keeps going. */}
        <div className="relative mt-10">
          <ul className="story-rail flex gap-4 px-5 pb-2 sm:px-8 lg:px-10">
          {CARTONS.map((photo) => (
            <li key={photo.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setZoomed(photo.src)}
                className="story-lift block w-40 overflow-hidden rounded-2xl bg-white p-2 transition-transform duration-200 hover:-translate-y-1 sm:w-52"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="aspect-3/4 w-full rounded-xl object-cover"
                />
              </button>
              </li>
            ))}
          </ul>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-story-cream to-transparent sm:w-24"
          />
        </div>
      </Band>

      <ImageModal isOpen={!!zoomed} onClose={() => setZoomed(null)} imageUrl={zoomed || ""} />
    </StoryLayout>
  );
};

export default About;
