import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
import { StoryButton } from "@/components/story/primitives";
import ProfileSettings from "@/components/settings/ProfileSettings";
import CountrySettings from "@/components/settings/CountrySettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) => (
  <section className="story-hairline rounded-2xl bg-white p-5 sm:p-6">
    <h2 className="story-serif text-[1.05rem] font-bold text-story-ink">{title}</h2>
    <p className="mt-0.5 text-[0.8125rem] text-story-muted">{hint}</p>
    <div className="mt-5">{children}</div>
  </section>
);

/**
 * Everything an account is, on one page.
 *
 * There are six settings here — a name, a picture, a default country, a
 * password and three email toggles — and they had been wrapped in three
 * parallel presentations of the same thing: tabs on desktop, a tapped menu of
 * modal dialogs on phones, and a second set of /account/* pages behind their
 * own sidebar. Roughly 1,200 lines of packaging, and a reader who could not
 * tell which of the three they were supposed to be using.
 *
 * Six settings is a short page. The section components below already own their
 * own state and saving, so stacking them needs no tabs, no dialogs and no
 * navigation to move between them.
 */
const Account = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <StoryAppLayout
      compact
      kicker="Your account"
      title="Account"
      lede="Your name, where you shop, your password, and what we may email you about."
    >
      <div className="space-y-4">
        <Section title="You" hint="How you appear on every rating you leave.">
          <ProfileSettings />
        </Section>

        <Section title="Where you shop" hint="Pre-selected when you rate something new.">
          <CountrySettings />
        </Section>

        <Section title="Password" hint="Change it whenever you like.">
          <SecuritySettings />
        </Section>

        <Section title="Email" hint="We only send what you ask for.">
          <NotificationSettings />
        </Section>

        <StoryButton tone="outline" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </StoryButton>
      </div>
    </StoryAppLayout>
  );
};

export default Account;
