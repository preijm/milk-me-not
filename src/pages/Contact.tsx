import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Phone, Mail, MessageSquare, Bird } from "lucide-react";
import {
  ArrowRight,
  Band,
  Display,
  DropList,
  Kicker,
  Lede,
  MilkDrop,
  SectionHead,
  StoryCard,
  StoryLayout,
} from "@/components/story";
import { ContactCard } from "@/components/contact/ContactCard";
import { FlyingBird } from "@/components/contact/FlyingBird";
import { FAQSection } from "@/components/contact/FAQSection";

const faqItems = [
  {
    question: "Will a real person read my email?",
    answer:
      "Yes — the same two people who started the spreadsheet this site grew out of. No support queue, no auto-responder pretending to be a person.",
  },
  {
    question: "How long until I hear back?",
    answer: "Usually a couple of days. It is not staffed around the clock, but nothing here gets ignored.",
  },
  {
    question: "Can I report a wrong score or bad data?",
    answer:
      "Please do. Send the product and what looks off, and it gets checked against the actual ratings behind it.",
  },
  {
    question: "Is the pigeon actually going to deliver my message?",
    answer: "No. The pigeon is in flight school. Email is the one that works.",
  },
];

const Contact = () => {
  const [flyingBirds, setFlyingBirds] = useState<number[]>([]);

  const handlePigeonClick = () => {
    // Date.now() collides when two clicks land in the same millisecond, and
    // two birds sharing a key share a flight plan — the identical-bird problem
    // in miniature. The counter makes every id its own.
    const birdId = Date.now() + Math.floor(performance.now() % 1000) + flyingBirds.length;
    // A flock, not a swarm: leaning on the card used to spawn birds without
    // limit. Twelve is plenty of joke.
    setFlyingBirds((prev) => [...prev.slice(-11), birdId]);
    setTimeout(() => {
      setFlyingBirds((prev) => prev.filter((id) => id !== birdId));
    }, 3200); // the longest flight is 2.8s; this used to cut them off at 2.0
  };

  return (
    <StoryLayout mobileCtaHint="One inbox. Two people. No script.">
      <Seo
        title="Contact — Milk Me Not"
        description="Get in touch with the Milk Me Not team. Bug reports, missing brands, data corrections and plain old feedback — read by the two people who started this."
        path="/contact"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div>
            <Kicker>Get in touch</Kicker>
            <Display as="h1" size="hero" className="mt-5">
              Actual humans
              <br />
              <span className="text-story-green">read this inbox.</span>
            </Display>
            <Lede className="mt-6 max-w-136">
              Four ways to reach us are listed below. One of them works. See if you can guess which before you
              scroll.
            </Lede>
            <Link
              to="/faq"
              className="mt-7 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-dark no-underline hover:underline"
            >
              Question about how scoring works? Try the FAQ first
              <ArrowRight />
            </Link>
          </div>

          {/* Desktop only: the drop, solid and cropped, the way the home and
              about heroes carry their weight — Contact gets its own colour
              (blue) so the page reads as itself, not a repeat. */}
          <div className="relative hidden lg:block lg:min-h-96">
            <div aria-hidden className="absolute -right-10 top-0 h-96 w-[24rem] rounded-full bg-story-blue" />
            <div aria-hidden className="pointer-events-none absolute right-6 top-12 text-story-blue-light">
              <MilkDrop size={210} variant="solid" />
            </div>
            <div aria-hidden className="absolute bottom-3 left-2 h-14 w-14 rounded-full bg-story-amber" />
            <div className="absolute bottom-0 left-0 w-76">
              <StoryCard className="story-lift p-6 sm:p-7">
                <p className="story-kicker text-story-muted-2">Since the spreadsheet</p>
                <p className="story-serif mt-3 text-[1.4rem] font-bold leading-snug text-story-ink">
                  Two people.
                  <br />
                  One inbox.
                  <br />
                  Zero sponsors.
                </p>
              </StoryCard>
            </div>
          </div>
        </div>
      </Band>

      {/* ── Channels ─────────────────────────────────────────────────── */}
      <Band ground="paper" size="lg">
        <SectionHead
          kicker="Reach us"
          title="Pick a channel"
          lede="Email is the one built on twenty-first-century technology. The rest are, generously, works in progress."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <ContactCard
            icon={Mail}
            iconColorClass="bg-story-green text-white"
            title="Email"
            badgeText="Available"
            badgeVariant="available"
            description="Our inbox is always open. Unlike our fridge, it never runs out of oat milk or judgment."
            buttonText="Send us an email"
            buttonHref="mailto:info@milkmenot.com"
          />

          <ContactCard
            icon={Phone}
            iconColorClass="bg-story-ink text-white"
            title="Phone"
            badgeText="On vacation"
            badgeVariant="unavailable"
            description="Our phone is currently taking a well-deserved vacation in the Bermuda Triangle. It left no forwarding address."
            buttonText="Nobody is picking up"
            buttonDisabled
          />

          <ContactCard
            icon={MessageSquare}
            iconColorClass="bg-story-blue text-white"
            title="Chat"
            badgeText="Pursuing dreams"
            badgeVariant="neutral"
            description="Our chat bot decided to pursue its dream of becoming a stand-up comedian. We wish it the best of luck in its new career."
            buttonText="Gone to open mic night"
            buttonDisabled
          />

          <ContactCard
            icon={Bird}
            iconColorClass="bg-story-amber-dark text-white"
            title="Postduif"
            badgeText="In training"
            badgeVariant="unavailable"
            description="Our carrier pigeons are still in flight school, learning the difference between your address and a bread crumb trail."
            buttonText="Still at flight school"
            buttonDisabled
            onClick={handlePigeonClick}
          >
            <FlyingBird birdIds={flyingBirds} />
          </ContactCard>
        </div>
      </Band>

      {/* ── Who's on the other end ──────────────────────────────────── */}
      <Band ground="sky" size="lg">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Kicker>Who's on the other end</Kicker>
            <Display size="xl" className="mt-5">
              Two people,
              <br />
              <span className="text-story-green">no support script.</span>
            </Display>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-story-muted">
              Milk Me Not is run by the same two people who started the spreadsheet that became this site. Email
              lands with one of them directly — no ticket number, no "your query is important to us."
            </p>
          </div>

          {/* The page's own illustrated centrepiece: a solid colour panel
              carrying real weight, the way the FAQ page's score bar does. */}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-story-green p-8 sm:p-10">
            {/* A watermark, at last. At full strength this pale mint on the
                brand green was 2.05:1 — too faint to read as a graphic, too
                strong to recede, and it left one block of text sitting on two
                very different grounds: ink measured 6.61:1 off the droplet and
                13.53:1 on it. Dimmed, the ground evens out and every line
                improves, to 6.61 and 8.03. */}
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 text-story-green-light opacity-30">
              <MilkDrop size={230} variant="solid" />
            </div>
            <p className="story-kicker relative text-story-ink">Who actually replies</p>
            <p className="story-num relative mt-4 text-[3.75rem] leading-none text-story-ink">2</p>
            <p className="relative mt-2 text-[0.8125rem] font-bold uppercase tracking-widest text-story-ink">
              People. Not a bot.
            </p>
            <DropList
              tone="green"
              className="relative mt-8 border-t border-white/15 pt-7"
              items={[
                "Spotted a wrong score or a data mistake — tell us which product.",
                "A brand or product missing from the catalogue.",
                "A bug, a broken page, anything that behaved badly.",
                "Or just say hi. We read all of it.",
              ]}
            />
          </div>
        </div>
      </Band>

      {/* ── Quick answers ────────────────────────────────────────────── */}
      <Band ground="cream-2" size="lg">
        <SectionHead kicker="Before you write in" title="Quick answers" />
        <div className="mt-10">
          <FAQSection title="Contact questions" items={faqItems} />
        </div>
        <p className="mt-6 text-[0.9375rem] text-story-muted">
          Bigger question about how the site works?{" "}
          <Link to="/faq" className="font-bold text-story-green-dark no-underline hover:underline">
            Read the full FAQ
          </Link>
          .
        </p>
      </Band>
    </StoryLayout>
  );
};

export default Contact;
