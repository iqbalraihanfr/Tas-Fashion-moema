"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleSignOut } from "@/lib/actions";

const navigation = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/dashboard/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/dashboard/orders", icon: ShoppingCart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center justify-center border-b px-6">
        <Image
          src="/MOEMA-Logo.png"
          alt="MOEMA"
          width={120}
          height={40}
          className="h-8 w-auto object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4">
        <form action={handleSignOut}>
            <button
            type="submit"
            className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
            <LogOut
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
            />
            Sign Out
            </button>
        </form>
      </div>
    </div>
  );
}
