"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, ShoppingCart, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { handleSignOut } from "@/lib/actions"

const navigation = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/dashboard/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/dashboard/orders", icon: ShoppingCart },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-neutral-200">
        <Link href="/admin/dashboard" className="flex items-center justify-center">
          <Image
            src="/MOEMA-Logo.png"
            alt="MOEMA"
            width={120}
            height={40}
            className="h-8 w-auto object-contain dark:invert"
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold px-3 mb-1">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? "bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white font-medium rounded-lg"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-neutral-200 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={handleSignOut}>
              <SidebarMenuButton asChild>
                <button type="submit" className="w-full text-left flex items-center gap-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
