import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Band, Display, Kicker, Lede, StoryLayout } from "@/components/story";

/** One question, its answer, styled like the rest of the document rather than an accordion — this is a reference, not a pitch. */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="scroll-mt-24">
    <Display as="h2" size="sm" className="text-story-ink">
      {title}
    </Display>
    <div className="mt-4 flex flex-col gap-4 text-[1.0625rem] leading-relaxed text-story-muted">{children}</div>
  </section>
);

const LAST_UPDATED = "28 August 2026";

/**
 * The one legal-ish page on the site, and deliberately plain next to the rest
 * of it — no bands of marketing copy, just what actually happens to your
 * data, described the way the code actually behaves rather than in the
 * generic terms a template would use.
 *
 * Written to be checked against the source, not just believed: every claim
 * here should still be true by reading `useAuthOperations.ts`,
 * `imageCompression.ts`, `errorReporting.ts` and the two backup scripts.
 * If one of those changes, this page is what falls out of date first.
 */
const Privacy = () => (
  <StoryLayout mobileCtaHint="Rate a milk — it takes ninety seconds.">
    <Seo
      title="Privacy — Milk Me Not"
      description="What Milk Me Not collects, why, and who else ever sees it. Written in plain language, matched to what the code actually does."
      path="/privacy"
    />

    <Band ground="cream" size="hero" width="narrow">
      <Kicker>Legal, briefly</Kicker>
      <Display as="h1" size="xl" className="mt-5">
        What we collect,
        <br />
        <span className="text-story-green">and why.</span>
      </Display>
      <Lede className="mt-6">
        Milk Me Not is run by two people, not a company with a privacy team — so this is written the way we'd
        actually explain it, not the way a template would. Last updated {LAST_UPDATED}.
      </Lede>
    </Band>

    <Band ground="paper" size="lg" width="prose" innerClassName="flex flex-col gap-12">
      <Section title="The short version">
        <p>
          We store what you type into a rating — the score, a note, a shop and a country if you add them — tied
          to your account. We never sell data, we don't run ad trackers, and nothing about your exact location is
          ever collected, even from a photo. A handful of outside services help run the site; each one is named
          below with exactly what it sees.
        </p>
      </Section>

      <Section title="What you give us directly">
        <p>
          <strong className="text-story-ink">To make an account:</strong> an email address and a password, or —
          if you use "Continue with Google" — the name, email address and profile picture Google shares with us.
          Either way we pick a username for your ratings, which you can change any time from Settings. We never
          see or store a Google account's password; Google handles that sign-in itself and only hands us a token
          confirming who you are.
        </p>
        <p>
          <strong className="text-story-ink">To rate something:</strong> the score, an optional note, whether you
          drank it hot, cold or in coffee, the shop and country you typed (there is no location tracking — this
          is a plain dropdown and a text field), and how it compared on price. A photo is optional.
        </p>
        <p>
          <strong className="text-story-ink">If you add a photo:</strong> it's resized in your browser before it
          ever reaches us — redrawn onto a canvas at two smaller sizes, which as a side effect strips out
          everything a phone camera embeds in the original file, including GPS coordinates, camera model and the
          exact time it was taken. We only ever store the resized copies, never the original.
        </p>
        <p>
          <strong className="text-story-ink">If you comment or like a rating:</strong> the comment text and who
          posted it, same as any other rating.
        </p>
      </Section>

      <Section title="What happens automatically">
        <p>
          <strong className="text-story-ink">Keeping accounts safe:</strong> repeated failed logins, signups or
          password-reset attempts are temporarily rate-limited by email address to slow down guessing. Those
          counters expire on their own and are never tied to an IP address.
        </p>
        <p>
          <strong className="text-story-ink">When something breaks:</strong> if a page throws an error, a report
          — the error and a stack trace, not your data — can be sent to our error-tracking tool, Sentry. It is
          configured to skip anything that would otherwise default to a broader set: no IP address, no session
          recording, nothing about who you are.
        </p>
        <p>
          <strong className="text-story-ink">Visit counts:</strong> we use Counterscale, a self-hosted, cookieless
          analytics tool. It counts pageviews without a cookie or any identifier tied to you, and cannot connect a
          visit to an account. You can opt your own browser out entirely by visiting the site once with{" "}
          <code className="rounded bg-story-ink/6 px-1.5 py-0.5 text-[0.9em]">?notrack=1</code> on the end of the
          address.
        </p>
      </Section>

      <Section title="Who else sees it">
        <p>Nobody buys access to this data. A short list of services keep the site running, each doing one job:</p>
        <ul className="flex list-disc flex-col gap-3 pl-5 marker:text-story-green">
          <li>
            <strong className="text-story-ink">Supabase</strong> — hosts the database, the login system and any
            photos you upload. Everything above lives here.
          </li>
          <li>
            <strong className="text-story-ink">Google</strong> — only if you choose "Continue with Google": they
            confirm who you are and share your name, email and profile picture with us. Nothing else.
          </li>
          <li>
            <strong className="text-story-ink">Cloudflare</strong> — serves the site itself, the way any web host
            sees ordinary web traffic.
          </li>
          <li>
            <strong className="text-story-ink">Mapbox</strong> — draws the world map on the site. It only ever
            receives publicly-aggregated totals per country, never anything tied to your account.
          </li>
          <li>
            <strong className="text-story-ink">Open Food Facts</strong> — when you scan a barcode, we send only
            that barcode number to their open, public database to look up a product name — no account information
            is included.
          </li>
        </ul>
      </Section>

      <Section title="Backups">
        <p>
          Ratings, products and brands — the community data — are backed up monthly to a private OneDrive folder,
          without any login information. A second backup, which does include the technical record of accounts
          (not your plain password — nobody but you ever has that — but the scrambled form it's checked against),
          stays only on the machine that made it and is never uploaded anywhere.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          Any rating you've posted can be edited or deleted at any time from your profile — the product's average
          updates the moment you do. Your username and avatar can be changed from Settings.
        </p>
        <p>
          There isn't yet a self-serve "delete my account" button. Until there is, email{" "}
          <a href="mailto:info@milkmenot.com" className="font-bold text-story-green-dark hover:underline">
            info@milkmenot.com
          </a>{" "}
          and we'll remove your account and everything tied to it by hand, usually within a few days.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Passwords are never stored as plain text — Supabase's login system hashes them before they ever reach a
          database, and that's the only form anyone here can see. Every table enforces row-level security, so the
          database itself refuses to hand your ratings, comments or notification settings to anyone but you (or,
          for the ratings themselves, to the public leaderboard they're meant to appear on).
        </p>
      </Section>

      <Section title="Children">
        <p>
          Milk Me Not isn't directed at children, and we don't knowingly collect information from anyone under
          13. If you believe a child has an account here, email us and we'll close it.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If what we collect changes in a way that matters, this page changes with it — that's the whole point of
          it being generated from what the code does rather than written once and forgotten. The date at the top
          is the last time it did.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Read by the same two people who read everything else sent to this inbox — see{" "}
          <Link to="/contact" className="font-bold text-story-green-dark hover:underline">
            Contact
          </Link>{" "}
          for the slower, funnier version of this sentence.
        </p>
      </Section>
    </Band>
  </StoryLayout>
);

export default Privacy;
