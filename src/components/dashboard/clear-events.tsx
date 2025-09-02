"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ClearEvents() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClear() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/events/clear", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Eventos removidos com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("[CLEAR_EVENTS]", error);
      toast.error("Erro ao remover eventos");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClear}
      disabled={isLoading}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isLoading ? "Removendo..." : "Limpar Eventos"}
    </Button>
  );
} 