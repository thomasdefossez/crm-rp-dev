"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

type ChartConfig = {
    [key: string]: {
        label: string
        color: string
    }
}

const chartData = [...Array(30)].map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
        date: date.toISOString().split("T")[0],
        desktop: Math.floor(Math.random() * 500),
        mobile: Math.floor(Math.random() * 500),
    }
})

const chartConfig: ChartConfig = {
    views: { label: "Page Views", color: "hsl(var(--gray))" },
    desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
    mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
}

export function Cegraph() {
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop")

    const total = React.useMemo(
        () => ({
            desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
            mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
        }),
        []
    )

    const [formattedTotal, setFormattedTotal] = React.useState({ desktop: "", mobile: "" })

    React.useEffect(() => {
        setFormattedTotal({
            desktop: total.desktop.toLocaleString("fr-FR"),
            mobile: total.mobile.toLocaleString("fr-FR"),
        })
    }, [total])

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                        <CardTitle>Performance visiteurs</CardTitle>
                        <CardDescription>Visites des 30 derniers jours</CardDescription>
                    </div>
                    <div className="flex">
                        {(["desktop", "mobile"] as const).map((key) => (
                            <button
                                key={key}
                                data-active={activeChart === key}
                                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(key)}
                            >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[key].label}
                  </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                    {formattedTotal[key]}
                  </span>
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="px-2 sm:p-6">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent>{null}</ChartTooltipContent>
                                }
                            />
                            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
