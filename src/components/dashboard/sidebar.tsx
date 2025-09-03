"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Send } from "lucide-react";

const navigation = [
  {
    name: "Eventos",
    href: "/dashboard",
    icon: Calendar,
  },
  {
    name: "Contatos",
    href: "/dashboard/contacts",
    icon: Users,
  },
  {
    name: "Envios",
    href: "/dashboard/messages",
    icon: Send,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <nav className="flex flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className="justify-start gap-2"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
