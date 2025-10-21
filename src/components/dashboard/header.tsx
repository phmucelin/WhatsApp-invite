"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";

export function DashboardHeader() {
  const handleLogout = () => {
    // Limpar cookie
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="Chai School" 
            width={32} 
            height={32}
            className="rounded"
          />
          <h1 className="text-xl font-semibold">Chai School Convites</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}