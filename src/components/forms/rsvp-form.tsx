"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface RsvpFormProps {
  guestId: string;
  name: string;
}

export function RsvpForm({ guestId, name }: RsvpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  async function handleResponse(willAttend: boolean) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId,
          rsvpStatus: willAttend ? "CONFIRMED" : "DECLINED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update RSVP status");
      }

      setHasResponded(true);
      toast.success(
        willAttend
          ? "Presença confirmada com sucesso!"
          : "Resposta registrada com sucesso!"
      );
    } catch (error) {
      toast.error("Erro ao registrar resposta");
    } finally {
      setIsLoading(false);
    }
  }

  if (hasResponded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-6 text-center"
      >
        <h3 className="mb-2 text-xl font-semibold">Obrigado pela resposta!</h3>
        <p className="text-sm text-muted-foreground">
          Sua resposta foi registrada com sucesso.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold">Olá, {name}!</h3>
        <p className="text-sm text-muted-foreground">
          Por favor, confirme sua presença:
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => handleResponse(true)}
          disabled={isLoading}
          className="w-40"
        >
          <Check className="mr-2 h-4 w-4" />
          Confirmar
        </Button>
        <Button
          onClick={() => handleResponse(false)}
          disabled={isLoading}
          variant="outline"
          className="w-40"
        >
          <X className="mr-2 h-4 w-4" />
          Não Poderei
        </Button>
      </div>
    </div>
  );
}
