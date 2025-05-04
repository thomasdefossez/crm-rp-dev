"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import { Mail } from "@/components/mail/mail";
import { accounts, mails } from "@/components/mail/data";

export default function ReceptionPage() {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <AppSidebar>
                <nav className="space-y-2 px-6 py-4 text-sm text-muted-foreground">
                    <div className="font-semibold text-muted-foreground mb-4">
                        Navigation
                    </div>
                    <Link
                        href="/dashboard"
                        className={
                            pathname === "/dashboard"
                                ? "text-primary font-semibold"
                                : "hover:text-primary"
                        }
                    >
                        Tableau de bord
                    </Link>
                    <Link
                        href="/emails"
                        className={
                            pathname === "/emails"
                                ? "text-primary font-semibold"
                                : "hover:text-primary"
                        }
                    >
                        Campagnes
                    </Link>
                    <Link
                        href="/emails/stats"
                        className={
                            pathname === "/emails/stats"
                                ? "text-primary font-semibold"
                                : "hover:text-primary"
                        }
                    >
                        Statistiques
                    </Link>
                </nav>
            </AppSidebar>
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
                                    <BreadcrumbPage>Réception</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="p-4">
                    <div className="p-8 bg-white border rounded-lg">
                        <Mail accounts={accounts} mails={mails} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}