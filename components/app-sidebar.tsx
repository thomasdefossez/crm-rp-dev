"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function getData(pathname: string) {
  return {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Contacts",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Base journaliste",
            url: "#",
          },
          {
            title: "Mes contacts",
            url: "/contacts/page-test",
          },
          {
            title: "Liste de diffusion",
            url: "/lists",
            isActive: pathname === "/lists",
          },
        ],
      },
      {
        title: "Emails",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Boite de reception",
            url: "/emails/reception",
          },
          {
            title: "Campagne",
            url: "/emails/campagne",
          },
          {
            title: "Analytics",
            url: "/emails/dashboard",
          },
        ],
      },
      {
        title: "Newsrooms",
        url: "#",
        icon: PieChart,
        items: [
          {
            title: "Revue de presse",
            url: "/newsrooms/revue-de-presse",
          },
          {
            title: "Press kits",
            url: "/newsrooms/press-kits",
          },
          {
            title: "Flux sociaux",
            url: "/newsrooms/flux-sociaux",
          },
          {
            title: "Porte-paroles",
            url: "/newsrooms/porte-paroles",
          },
        ],
      },
      {
        title: "Shopping ",
        url: "/shopping",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Evenements",
        url: "/evenements",
        icon: Settings2,
        items: [
          {
            title: "Salons",
            url: "#",
          },
          {
            title: "Conférences",
            url: "#",
          },
          {
            title: "Déjeuner Presse",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
      {
        title: "Finance",
        url: "/finance",
        icon: Settings2,
        items: [
          {
            title: "Devis",
            url: "#",
          },
          {
            title: "Facture",
            url: "#",
          },
          {
            title: "Reporting",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const data = getData(pathname);
  return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
  )
}
