"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

const formSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter no mínimo 10 caracteres"),
  date: z.string().min(1, "A data é obrigatória"),
  time: z.string().min(1, "O horário é obrigatório"),
  location: z.string().min(5, "O local deve ter no mínimo 5 caracteres"),
  message: z.string().min(10, "A mensagem deve ter no mínimo 10 caracteres"),
  image: z.instanceof(File).optional(),
});

type EventFormValues = z.infer<typeof formSchema>;

export function EventForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "19:00",
      location: "",
      message: "Olá {{NOME}}, você está convidado(a) para {{EVENTO}}! Para confirmar sua presença, acesse: {{LINK}}",
    },
  });

  async function onSubmit(values: EventFormValues) {
    try {
      setIsLoading(true);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao criar evento");
      }

      toast.success("Evento criado com sucesso!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao criar evento");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aniversário de 15 anos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Uma breve descrição do evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo do evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem do Convite</FormLabel>
              <FormControl>
                <Input placeholder="Mensagem que será enviada via WhatsApp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value: _value, ...field } }) => (
            <FormItem>
              <FormLabel>Imagem do Convite</FormLabel>
              <FormControl>
              <Input
  type="file"
  accept="image/*"
  name={field.name}
  ref={field.ref}
  onBlur={field.onBlur}
  onChange={(e) => field.onChange(e.target.files?.[0])}
/>

              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Criando..." : "Criar Evento"}
        </Button>
      </form>
    </Form>
  );
} 