import * as React from "react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref: React.Ref<HTMLDivElement>) => (
        <div
            ref={ref}
            className={cn("shrink-0 bg-border", className)}
            {...props}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }