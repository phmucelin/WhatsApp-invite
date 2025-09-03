"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteEventProps {
  eventId: string;
  eventTitle: string;
  guestCount: number;
  onDelete: () => void;
}

export function DeleteEvent({ eventId, eventTitle, guestCount, onDelete }: DeleteEventProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 px-2"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar o evento <strong>&quot;{eventTitle}&quot;</strong>?
            <br />
            <br />
            <span className="text-destructive font-semibold">
              ⚠️ Esta ação não pode ser desfeita!
            </span>
            <br />
            <br />
            <strong>{guestCount} convidados</strong> também serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deletando..." : "Sim, Deletar Evento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 