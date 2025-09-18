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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <label className="text-sm font-medium text-gray-700">Selecionar Evento</label>
        <Select
          value={selectedEvent}
          onValueChange={setSelectedEvent}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[250px] input">
            <SelectValue placeholder="Selecione o evento" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id} className="hover:bg-gray-50">
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-2 flex-1 w-full">
        <label className="text-sm font-medium text-gray-700">Arquivo CSV</label>
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept=".csv"
            onChange={onFileChange}
            disabled={isLoading}
            className="input flex-1"
          />
          <Button 
            disabled={isLoading || !selectedEvent} 
            className="btn btn-primary"
            onClick={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }}
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Importando..." : "Importar"}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          O arquivo CSV deve ter as colunas: <strong>NOME, NUMERO</strong>
        </p>
      </div>
    </div>
  );
}
