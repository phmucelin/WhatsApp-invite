"use client";

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
        <div className="text-sm text-gray-500">
          Sistema de Convites
        </div>
      </div>
    </header>
  );
}