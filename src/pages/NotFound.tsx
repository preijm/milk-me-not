import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";
import {
  ArrowRight,
  Band,
  Display,
  Kicker,
  Lede,
  MilkDrop,
  StoryLayout,
  StoryLinkButton,
} from "@/components/story";

/**
 * A dead link is still an arrival. Someone got here from a stale bookmark or a
 * shared URL that rotted, and the cheapest thing we can do is catch them with
 * the same page the rest of the site would have shown them.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <StoryLayout>
      <Seo
        title="Page not found — Milk Me Not"
        description="That page has curdled. Here is where to go instead."
        path={location.pathname}
        noindex
      />

      <Band ground="cream" size="hero" className="flex min-h-[58vh] flex-col justify-center">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-10 hidden text-story-green-light lg:block">
          <MilkDrop size={300} variant="solid" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-8 text-story-green-light lg:hidden">
          <MilkDrop size={150} variant="solid" />
        </div>

        <div className="relative max-w-2xl">
          <Kicker>404</Kicker>
          <Display as="h1" size="hero" className="mt-5">
            This one's
            <br />
            <span className="text-story-green">gone off.</span>
          </Display>
          <Lede className="mt-6 max-w-lg">
            There's nothing at that address. The rest of the shelf is fine, though — several hundred plant milks, all
            scored by people who actually drank them.
          </Lede>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StoryLinkButton to="/results" className="w-full sm:w-auto">
              Browse every rating
              <ArrowRight />
            </StoryLinkButton>
            <StoryLinkButton to="/" tone="outline" className="w-full sm:w-auto">
              Back to the start
            </StoryLinkButton>
          </div>
        </div>
      </Band>
    </StoryLayout>
  );
};

export default NotFound;
