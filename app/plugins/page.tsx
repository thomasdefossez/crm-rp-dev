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
import { Input } from "@/components/ui/input"
import { PluginCard } from "@/components/ui/plugin-card"

export default function PluginsPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Header top with breadcrumb */}
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Plugins</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* Contenu principal */}
                <div className="p-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">Tous les plugins</h1>
                        <Input placeholder="Rechercher un plugin..." className="w-64" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <PluginCard
                          title="Bot"
                          description="Ajoutez un bot à votre service client"
                          icon="bot"
                          badge="Essentials"
                          onConnect={() => console.log("Connecter Bot")}
                        />
                        <PluginCard
                          title="Messenger"
                          description="Connectez votre page Facebook"
                          icon="messenger"
                          badge="Mini"
                          onConnect={() => console.log("Connecter Messenger")}
                        />
                        <PluginCard
                          title="Zapier"
                          description="Automatisez vos flux de travail"
                          icon="zapier"
                          badge="Plus"
                          onConnect={() => console.log("Connecter Zapier")}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}