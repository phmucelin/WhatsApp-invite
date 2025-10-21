"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para a página de welcome
    router.replace("/welcome");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
} 