import { Link } from "react-router-dom";
import logoImg from "@/assets/logo-96.png";
import { Display, StoryButton, ArrowRight } from "./primitives";
import { MilkDrop, Sprig } from "./motifs";
import { useRateCta } from "./useRateCta";

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Discover",
    links: [
      { to: "/results", label: "All ratings" },
      { to: "/results?sort=rating", label: "Top rated" },
      { to: "/feed", label: "Latest ratings" },
    ],
  },
  {
    title: "The project",
    links: [
      { to: "/about", label: "Our story" },
      { to: "/faq", label: "How ratings work" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Get the app",
    links: [
      { to: "/mobile-app", label: "Android app" },
      { to: "/install-guide", label: "Install guide" },
    ],
  },
];

/**
 * Closing band: the last chance to sell, then the map of the site.
 * Deliberately loud — a quiet footer would let the pitch trail off.
 */
export const StoryFooter = () => {
  const cta = useRateCta();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-story-green-deep text-story-cream">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 text-story-green opacity-[0.16]">
        <MilkDrop size={340} />
      </div>
      <div aria-hidden className="pointer-events-none absolute -left-10 bottom-10 text-story-green-light opacity-[0.07]">
        <Sprig size={220} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[76rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="max-w-2xl">
          <Display as="p" size="xl" className="text-white">
            Your turn.
            <br />
            <span className="text-story-green-light">Rate the last one you drank.</span>
          </Display>
          <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/70">
            Ninety seconds, no photo required. Every rating makes the next person's shopping trip less of a gamble.
          </p>
          <StoryButton onClick={cta.go} className="mt-8">
            {cta.label}
            <ArrowRight />
          </StoryButton>
        </div>

        <div className="mt-16 grid gap-10 border-t border-white/12 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="" className="h-9 w-9 rounded-[0.55rem] object-contain" width={36} height={36} />
              <span translate="no" className="font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-white">
                Milk Me Not
              </span>
            </div>
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-white/55">
              A community rating every plant milk on the shelf, one honest verdict at a time.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="story-kicker text-white/45">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.9375rem] font-medium text-white/75 no-underline transition-colors hover:text-story-green-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/12 pt-7 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Milk Me Not. Nobody pays us. Nobody ever has.</p>
          <p>Made by people who drink a worrying amount of oat milk.</p>
        </div>
      </div>
    </footer>
  );
};

export default StoryFooter;
