import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MEMBER_LINKS } from "./memberNav";

const initialOf = (email: string | undefined) => (email?.trim()?.[0] ?? "?").toUpperCase();

/**
 * The signed-in identity control in the story header.
 *
 * Before this existed the member destinations were reachable only from the
 * mobile drawer, so a signed-in desktop visitor had no route to their own
 * profile, notifications or settings from any public page.
 */
export const StoryAccountMenu = ({ className }: { className?: string }) => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full border border-story-ink/10",
          "bg-white font-display text-[0.9375rem] font-extrabold text-story-ink transition-colors",
          "hover:bg-story-cream-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-green",
          className,
        )}
        aria-label={`Account menu for ${user.email ?? "your account"}`}
      >
        {initialOf(user.email)}
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-story-cream bg-story-amber"
            aria-hidden
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-2xl border-story-ink/10 bg-white p-1.5 shadow-[0_24px_50px_-30px_hsl(160_14%_12%_/_0.45)]"
      >
        <p className="truncate px-3 py-2 text-[0.75rem] font-semibold text-story-muted-2">{user.email}</p>
        <DropdownMenuSeparator className="bg-story-ink/[0.07]" />

        {MEMBER_LINKS.map((link) => (
          <DropdownMenuItem key={link.to} asChild className="rounded-xl focus:bg-story-cream-2">
            <Link
              to={link.to}
              className="flex cursor-pointer items-center justify-between px-3 py-2.5 text-[0.9375rem] font-bold text-story-ink no-underline"
            >
              {link.label}
              {link.to === "/notifications" && unreadCount > 0 && (
                <span className="story-num rounded-full bg-story-amber-light px-2 py-0.5 text-[0.6875rem] text-story-amber-dark">
                  {unreadCount}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-story-ink/[0.07]" />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            navigate("/");
          }}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-[0.9375rem] font-bold text-story-muted focus:bg-story-cream-2"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StoryAccountMenu;
