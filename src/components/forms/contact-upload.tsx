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
        if (!response.ok) throw new Error("Failed to load events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Erro ao carregar eventos");
      }
    }

    loadEvents();
  }, []);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!selectedEvent) {
        toast.error("Por favor, selecione um evento");
        return;
      }

      if (file.type !== "text/csv") {
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
      toast.error(error instanceof Error ? error.message : "Erro ao importar contatos");
      console.error(error);
    } finally {
      setIsLoading(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = "";
    }
  }

  return (
    <div className="flex gap-4 items-center">
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
      <Input
        type="file"
        accept=".csv"
        onChange={onFileChange}
        disabled={isLoading}
        className="max-w-xs"
      />
      <Button disabled={isLoading} variant="ghost">
        <Upload className="h-4 w-4" />
        <span className="sr-only">Upload CSV</span>
      </Button>
    </div>
  );
} 