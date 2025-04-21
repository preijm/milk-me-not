
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
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      tabIndex={-1}
    >
      {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  ) : null;

  return (
    <div className="relative">
      <input
        type={inputType}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#C8C8C9] bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F9EA1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          type === 'password' && showPasswordToggle ? "pr-10" : "",
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
