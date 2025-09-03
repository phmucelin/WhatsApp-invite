"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteEventProps {
  eventId: string;
  eventTitle: string;
  guestCount: number;
  onDelete: () => void;
}

export function DeleteEvent({ eventId, eventTitle, guestCount, onDelete }: DeleteEventProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja deletar o evento "${eventTitle}"? Esta ação não pode ser desfeita e ${guestCount} convidados serão removidos.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch("/api/events/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar evento");
      }

      const result = await response.json();
      
      toast.success(
        `Evento "${eventTitle}" deletado com sucesso! ${result.deletedGuests} convidados removidos.`
      );
      
      onDelete();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      toast.error("Erro ao deletar evento. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className="h-8 px-2"
      disabled={isDeleting}
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
} 