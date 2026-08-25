import { Ban, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ContactCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  title: string;
  badgeText: string;
  badgeVariant: "available" | "unavailable" | "neutral";
  description: string;
  buttonText: string;
  buttonDisabled?: boolean;
  buttonHref?: string;
  onClick?: () => void;
  children?: ReactNode;
}

const badgeStyles = {
  available: "bg-story-green/10 text-story-green-dark border-story-green/25",
  unavailable: "bg-story-amber/15 text-story-amber-dark border-story-amber/25",
  neutral: "bg-story-ink/6 text-story-muted border-story-ink/10",
};

/**
 * `button:disabled` carries a site-wide `!important` grey (see index.css) that
 * no utility class here can beat — so a disabled channel is styled small and
 * badge-shaped instead of trying (and failing) to recolour it. A shrunk,
 * icon-led status chip reads as an intentional "not this one" rather than a
 * bigger, half-broken copy of Email's real button.
 */
const DISABLED_BUTTON_CLASS =
  "mt-5 inline-flex w-auto max-w-full items-center gap-1.5 self-start rounded-full border-[1.5px] border-dashed border-story-ink/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] hover:bg-transparent";

export const ContactCard = ({
  icon: Icon,
  iconColorClass,
  title,
  badgeText,
  badgeVariant,
  description,
  buttonText,
  buttonDisabled = false,
  buttonHref,
  onClick,
  children,
}: ContactCardProps) => {
  const ButtonContent = buttonDisabled ? (
    <Button disabled className={DISABLED_BUTTON_CLASS} onClick={onClick}>
      <Ban className="h-3.5 w-3.5" aria-hidden />
      {buttonText}
    </Button>
  ) : (
    <Button
      className="relative mt-5 w-full rounded-full bg-story-green font-bold text-story-ink hover:brightness-[1.07]"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );

  return (
    <div
      onClick={onClick}
      className={`bg-card story-hairline relative flex flex-col rounded-[1.25rem] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7 ${onClick ? "cursor-pointer overflow-visible" : "overflow-hidden"}`}
    >
      {/* An oversized, near-invisible echo of the channel's own icon — the
          illustrated touch that keeps a disabled card from reading as a
          rendering fault rather than a joke. */}
      <Icon aria-hidden className="pointer-events-none absolute -right-5 -top-6 h-28 w-28 rotate-14 text-story-ink/4" />

      {children}
      <div className="relative flex flex-1 flex-row items-start gap-4 sm:gap-5">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${iconColorClass}`}>
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
            <h2 className="story-serif text-lg font-bold text-story-ink sm:text-xl">{title}</h2>
            <Badge variant="outline" className={badgeStyles[badgeVariant]}>
              {badgeText}
            </Badge>
          </div>
          <p className="text-sm leading-snug text-story-muted sm:text-base sm:leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {buttonHref ? (
        <Button asChild className="relative mt-5 w-full rounded-full bg-story-green font-bold text-story-ink hover:brightness-[1.07]">
          <a href={buttonHref}>{buttonText}</a>
        </Button>
      ) : (
        <div className="relative flex">{ButtonContent}</div>
      )}
    </div>
  );
};
