"use client"

import { useState, useEffect } from "react"
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
import { CreateContactDrawer } from "../contacts/_components/CreateContactDrawer"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"

export default function Page() {
    const [openDrawer, setOpenDrawer] = useState(false)
    const [refreshCounter, setRefreshCounter] = useState(0)
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>()
    const [contactCount, setContactCount] = useState<number | null>(null)

    // Déplace la fonction en dehors de useEffect pour stabilité maximale
    async function fetchContactCount(setContactCount: (count: number | null) => void) {
        const { count, error } = await supabase
            .from("contacts")
            .select("*", { count: "exact", head: true });
        if (!error) setContactCount(count);
    }

    useEffect(() => {
        fetchContactCount(setContactCount);
    }, [refreshCounter])

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
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        Contacts{" "}
                        {contactCount !== null && (
                          <span className="text-violet-600 text-base font-medium align-middle">
                            ({contactCount})
                          </span>
                        )}
                      </h1>
                    </div>
                    <ContactsToolbar
                        onAddContact={() => setOpenDrawer(true)}
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