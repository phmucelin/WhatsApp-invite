"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Shield,
  UserPlus,
} from "lucide-react";

const navigation = [
  {
    name: "Eventos",
    href: "/dashboard",
    icon: Calendar,
    permission: "canAccessEvents",
  },
  {
    name: "Contatos",
    href: "/dashboard/contacts",
    icon: UserPlus,
    permission: "canAccessEvents",
  },
  {
    name: "Convidados",
    href: "/dashboard/guests",
    icon: Users,
    permission: "canAccessEvents",
  },
  {
    name: "Mensagens",
    href: "/dashboard/messages",
    icon: MessageSquare,
    permission: "canAccessEvents",
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Shield,
    permission: "canAccessAdmin",
  },
  {
    name: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "canAccessEvents",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { canAccessAdmin, canAccessEvents, isLoading } = usePermissions();

  console.log("[Sidebar] Permissions:", { canAccessAdmin, canAccessEvents, isLoading });

  const filteredNavigation = navigation.filter((item) => {
    if (item.permission === "canAccessAdmin") {
      return canAccessAdmin;
    }
    if (item.permission === "canAccessEvents") {
      return canAccessEvents;
    }
    return true;
  });

  console.log("[Sidebar] Navigation filtrada:", filteredNavigation.length, "itens");

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-semibold text-white">Chai School</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
