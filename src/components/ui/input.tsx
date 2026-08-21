
import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement, 
  React.InputHTMLAttributes<HTMLInputElement> & {
    showPasswordToggle?: boolean
  }
>(({ className, type, showPasswordToggle = false, ...props }, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  
  // Determine the actual type to use
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;
  
  // Render password toggle if needed
  const PasswordToggle = type === 'password' && showPasswordToggle ? (
    <button
      type="button"
      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
      aria-pressed={isPasswordVisible}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-story-muted-2 transition-colors hover:text-story-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-green"
    >
      {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  ) : null;

  return (
    <div className="relative">
      <input
        type={inputType}
        className={cn(
          // The story field, as the default rather than as an override.
          //
          // This used to be a Material filled input — square, grey, no border
          // but a bottom rule that turned green on focus. The redesign never
          // reached it: AuthFormInputs and SecuritySettings each re-styled it
          // locally and everything else kept the old look, so the rating flow
          // and the settings pages carried a control from a different design
          // system than the page around it. Three input styles, one component.
          "flex h-12 w-full rounded-xl border-[1.5px] border-story-ink/[0.12] bg-white px-4 py-2 text-left",
          "font-sans text-[0.9375rem] text-story-ink transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-story-ink",
          "placeholder:text-left placeholder:text-story-muted-2",
          "focus-visible:border-story-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          type === 'password' && showPasswordToggle ? "pr-11" : "",
          className
        )}
        ref={ref}
        {...props}
      />
      {PasswordToggle}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
