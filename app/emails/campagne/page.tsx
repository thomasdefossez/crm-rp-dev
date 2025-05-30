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

import { DataTable } from "@/components/ui/data-table/CampagneDataTable"
import { CampagneToolbar } from "@/components/ui/campagne-toolbar"
import { CreateContactDrawer } from "../_components/CreateContactDrawer"
import { toast } from "sonner"

export default function Page() {
    const [openDrawer, setOpenDrawer] = useState(false)
    const [refreshCounter, setRefreshCounter] = useState(0)
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined)

    const refreshTable = () => setRefreshCounter((c) => c + 1)

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
                                    <BreadcrumbLink href="/emails">Emails</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Campagnes</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="p-4">
                    <CampagneToolbar
                        selectedCampaignId={selectedCampaignId}
                        onCampaignCreated={(id) => {
                            if (id) {
                                window.location.href = `/emails/add?id=${id}`
                            }
                        }}
                        onDeleted={refreshTable}
                    />
                    <DataTable
                        refreshTrigger={refreshCounter}
                        tableName="campaigns"
                        onRowSelect={(id: string) => setSelectedCampaignId(id)}
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