import { LucideIcon } from "lucide-react";
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
  available: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  unavailable: "bg-score-fair/10 text-score-fair border-score-fair/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const buttonStyles = {
  available: "bg-brand-secondary hover:bg-brand-secondary/90 text-primary-foreground",
  unavailable: "bg-score-poor/10 hover:bg-score-poor/10 text-score-poor cursor-not-allowed",
  neutral: "bg-score-poor/10 hover:bg-score-poor/10 text-score-poor cursor-not-allowed",
};

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
  const ButtonContent = (
    <Button
      disabled={buttonDisabled}
      className={`mt-4 w-full ${buttonStyles[badgeVariant]}`}
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );

  return (
    <div
      onClick={onClick && !buttonDisabled ? onClick : undefined}
      className={`bg-card rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all flex flex-col ${onClick ? "cursor-pointer relative overflow-visible" : ""}`}
    >
      {children}
      <div className="flex flex-row items-start gap-3 sm:gap-4 flex-1">
        <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl ${iconColorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
            <Badge variant="outline" className={badgeStyles[badgeVariant]}>
              {badgeText}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-snug sm:leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {buttonHref ? (
        <Button asChild className={`mt-4 w-full ${buttonStyles[badgeVariant]}`}>
          <a href={buttonHref}>{buttonText}</a>
        </Button>
      ) : (
        ButtonContent
      )}
    </div>
  );
};
