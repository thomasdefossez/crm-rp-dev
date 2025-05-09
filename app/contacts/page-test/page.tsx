"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

import { DataTable } from "@/components/ui/data-table/DataTable"
import { ContactsToolbar } from "@/components/ui/contacts-toolbar"
import { CreateContactDrawer } from "../_components/CreateContactDrawer"
import { toast } from "sonner"

export default function Page() {
    const [openDrawer, setOpenDrawer] = useState(false)
    const [refreshCounter, setRefreshCounter] = useState(0)
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>()

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Mes contacts</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="p-4 relative z-0">
                    <ContactsToolbar
                        onAddContact={() => setOpenDrawer(true)}
                        onDateRangeChange={setDateRange}
                        popoverProps={{
                            align: "start",
                            sideOffset: 8,
                            avoidCollisions: false,
                            className: "p-2 z-[999] bg-white border border-gray-300 shadow-xl max-w-[360px]",
                        }}
                    />
                    <DataTable
                        refreshTrigger={refreshCounter}
                        selectedDateRange={dateRange}
                    />
                </div>
            </SidebarInset>

            <CreateContactDrawer
                open={openDrawer}
                onOpenChange={setOpenDrawer}
                onContactCreated={() => {
                    toast.success("Contact ajouté avec succès")
                    setRefreshCounter((c) => c + 1)
                }}
            />
        </SidebarProvider>
    )
}