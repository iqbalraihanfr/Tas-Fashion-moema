import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="border-l border-neutral-200">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-neutral-200" />
            <div className="flex-1">
              <h1 className="text-sm font-medium text-neutral-700">MOEMA Admin Workspace</h1>
            </div>
          </header>
          <main className="flex-1 bg-neutral-50/80 p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
