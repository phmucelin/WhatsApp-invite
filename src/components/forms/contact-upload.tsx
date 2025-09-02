"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function ContactUpload() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== "text/csv") {
        toast.error("Por favor, selecione um arquivo CSV");
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao importar contatos");
      }

      const data = await response.json();
      toast.success(`${data.count} contatos importados com sucesso!`);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao importar contatos");
      console.error(error);
    } finally {
      setIsLoading(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = "";
    }
  }

  return (
    <div className="flex gap-4 items-center">
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