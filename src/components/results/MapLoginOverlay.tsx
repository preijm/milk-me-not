import { MilkDrop, StoryButton, StoryLinkButton, ArrowRight } from "@/components/story";
import { useRateCta } from "@/components/story";

/**
 * What a signed-out visitor sees where the world map would be.
 *
 * It sits inside the Results page, so it has to stay inside the brand — an
 * unstyled card with a padlock emoji ejects the reader from the site at the
 * exact moment we are asking them to join it.
 */
export const MapLoginOverlay = () => {
  const cta = useRateCta();

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-story-green-deep px-6 py-16 text-center sm:px-10 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 text-story-green">
        <MilkDrop size={300} variant="solid" />
      </div>
      <div aria-hidden className="pointer-events-none absolute -left-20 bottom-[-4rem] h-56 w-56 rounded-full bg-story-blue/40" />

      <div className="relative mx-auto max-w-lg">
        <p className="story-kicker text-white/55">Members only, for now</p>
        <h2 className="story-display mt-4 text-[clamp(1.9rem,5vw,2.9rem)] text-white">
          Every rating has a
          <br />
          <span className="text-story-green-light">place attached to it.</span>
        </h2>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/70">
          The map plots where each carton was actually drunk — which supermarket, which country. It is the one part of
          the data we keep for people who contribute to it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <StoryButton tone="paper" onClick={cta.go}>
            {cta.label}
            <ArrowRight />
          </StoryButton>
          <StoryLinkButton to="/auth" tone="outline-light">
            I already have an account
          </StoryLinkButton>
        </div>
      </div>
    </div>
  );
};
