import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
    React.HTMLAttributes<HTMLDivElement>,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("shrink-0 bg-border", className)}
        {...props}
    />
))
Separator.displayName = "Separator"

export { Separator }