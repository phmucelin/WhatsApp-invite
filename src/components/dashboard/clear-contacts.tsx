"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClearContactsProps {
  onClear?: () => void;
}

export function ClearContacts({ onClear }: ClearContactsProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClear() {
    if (!confirm("Tem certeza que deseja remover TODOS os contatos/convidados? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/contacts/clear", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Todos os contatos foram removidos com sucesso!");
      
      // Força atualização da página para garantir que os dados sejam limpos
      if (onClear) {
        onClear();
      }
      
      // Recarrega a página para garantir que tudo seja atualizado
      window.location.reload();
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
