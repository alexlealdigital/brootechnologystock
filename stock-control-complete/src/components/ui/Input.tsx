import * as React from "react"
import { cn } from "@/lib/utils"

<<<<<<< HEAD
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
=======
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
>>>>>>> e873e19377cf9bf6be17bf3d67869563eb8207cf

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
