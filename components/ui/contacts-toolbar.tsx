"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon, SettingsIcon, PlusIcon } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { useState } from "react"

type ContactsToolbarProps = {
  onAddContact: () => void
  onDateRangeChange: (range: { from: Date; to?: Date } | undefined) => void
  popoverProps?: {
    align?: "start" | "center" | "end"
    sideOffset?: number
    avoidCollisions?: boolean
    className?: string
  }
}

export function ContactsToolbar({
  onAddContact,
  onDateRangeChange,
  popoverProps,
}: ContactsToolbarProps) {
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>()

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
                <DatePickerWithRange date={dateRange} setDate={(range) => {
                  setDateRange(range)
                  onDateRangeChange(range)
                }} />
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={onAddContact} className="bg-violet-700 text-white hover:bg-violet-800">
                    <PlusIcon className="w-4 h-4 mr-2" /> Ajouter un contact
                </Button>
                <Button variant="outline">
                    <SettingsIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
