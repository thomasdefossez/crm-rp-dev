'use client'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'

export function ChartContainer({ children, config }: { children: React.ReactNode, config?: any }) {
    return <div className="w-full">{children}</div>
}

export function ChartTooltip(props: any) {
    return <Tooltip {...props} />
}

export function ChartTooltipContent({ children }: { children: React.ReactNode }) {
    return (
        <TooltipContent>
            {children}
        </TooltipContent>
    )
}