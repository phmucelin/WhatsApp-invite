"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClearContactsProps {
  eventId?: string;
  onClear?: () => void;
}

export function ClearContacts({ eventId, onClear }: ClearContactsProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClear() {
    const message = eventId 
      ? "Tem certeza que deseja remover TODOS os contatos/convidados deste evento? Esta ação não pode ser desfeita."
      : "Tem certeza que deseja remover TODOS os contatos/convidados de TODOS os eventos? Esta ação não pode ser desfeita.";
      
    if (!confirm(message)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/contacts/clear", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: eventId || "all" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao limpar contatos");
      }

      const result = await response.json();
      console.log("[CLEAR_CONTACTS] Resultado:", result);
      
      toast.success(result.message || `Todos os contatos foram removidos com sucesso! ${result.count} convidados removidos.`);
      
      // Força atualização da página para garantir que os dados sejam limpos
      if (onClear) {
        onClear();
      }
      
      // Aguarda um pouco antes de recarregar para garantir que o toast seja exibido
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("[CLEAR_CONTACTS]", error);
      toast.error("Erro ao remover contatos. Tente novamente.");
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
      className="bg-red-600 hover:bg-red-700 text-white border border-red-600"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isLoading ? "Removendo..." : "Limpar Contatos"}
    </Button>
  );
}
