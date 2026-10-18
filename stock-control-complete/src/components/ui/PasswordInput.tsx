import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, type InputProps } from "@/components/ui/Input"
import { cn } from "@/lib/utils"

// Campo de senha com o "olho" para mostrar/ocultar o que foi digitado.
// Use no lugar de <Input type="password" />. Aceita as mesmas props do Input.
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, ...props }, ref) => {
    const [visivel, setVisivel] = React.useState(false)
    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={visivel ? "text" : "password"}
          className={cn("pr-11", className)}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          title={visivel ? "Ocultar senha" : "Mostrar senha"}
          disabled={props.disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:text-primary disabled:opacity-50"
        >
          {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
