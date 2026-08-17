/**
 * The card every block in the charts and map views sits in.
 *
 * Shared so the three views read as one page: a kicker, a headline that says
 * what the block found, a line of context, then the thing itself.
 */
import { StoryCard } from "@/components/story";

export const ResultsPanel = ({
  kicker,
  title,
  lede,
  children,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <StoryCard as="article" className={`px-5 py-7 sm:px-8 sm:py-9 ${className ?? ""}`}>
    <p className="story-kicker text-story-green-dark">{kicker}</p>
    <h3 className="story-display mt-3 text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-story-ink">{title}</h3>
    {lede && <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-story-muted">{lede}</p>}
    <div className="mt-8">{children}</div>
  </StoryCard>
);

export default ResultsPanel;
