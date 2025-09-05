"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";

export function DashboardHeader() {
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
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
