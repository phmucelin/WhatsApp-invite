"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
}

export function ContactUpload() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("[EVENTS_LOAD]", error);
        toast.error("Erro ao carregar eventos. Crie um evento primeiro.");
      }
    }

    loadEvents();
  }, []);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        toast.error("Nenhum arquivo selecionado");
        return;
      }

      if (!selectedEvent) {
        toast.error("Por favor, selecione um evento");
        return;
      }

      // Aceitar tanto text/csv quanto application/vnd.ms-excel (alguns sistemas usam este MIME type para CSV)
      if (
        file.type !== "text/csv" &&
        file.type !== "application/vnd.ms-excel"
      ) {
        toast.error("Por favor, selecione um arquivo CSV");
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", selectedEvent);

      const response = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      toast.success(`${data.count} contatos importados com sucesso!`);
      router.refresh();
    } catch (error) {
      console.error("[CONTACTS_UPLOAD]", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao importar contatos"
      );
    } finally {
      setIsLoading(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = "";
    }
  }

  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Crie um evento antes de importar contatos
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedEvent}
        onValueChange={setSelectedEvent}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione o evento" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex-1">
        <Input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          disabled={isLoading}
          className="max-w-xs"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          O arquivo CSV deve ter as colunas: NOME, NUMERO
        </p>
      </div>
      <Button disabled={isLoading} variant="ghost">
        <Upload className="h-4 w-4" />
        <span className="sr-only">Upload CSV</span>
      </Button>
    </div>
  );
}
