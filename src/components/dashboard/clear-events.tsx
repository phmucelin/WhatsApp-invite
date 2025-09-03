"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClearEventsProps {
  onClear?: () => void;
}

export function ClearEvents({ onClear }: ClearEventsProps) {
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
      if (onClear) {
        onClear();
      }
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
      <Trash2 className="mr-2 h-4 w-4" />
      {isLoading ? "Removendo..." : "Limpar Eventos"}
    </Button>
  );
}
