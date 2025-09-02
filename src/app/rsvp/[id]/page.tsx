"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Calendar, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Guest {
  id: string;
  name: string;
  phoneNumber: string;
  rsvpStatus: "WAITING" | "CONFIRMED" | "DECLINED";
  event: {
    title: string;
    description: string;
    date: string;
    location: string;
    imageUrl?: string;
    message: string;
  };
}

export default function RsvpPage() {
  const params = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    async function loadGuest() {
      try {
        const response = await fetch(`/api/rsvp/${params.id}`);
        if (!response.ok) {
          throw new Error("Convidado não encontrado");
        }
        const data = await response.json();
        setGuest(data);
        setHasResponded(data.rsvpStatus !== "WAITING");
      } catch (error) {
        console.error("[RSVP_LOAD]", error);
        toast.error("Erro ao carregar convite");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadGuest();
    }
  }, [params.id]);

  async function handleRsvp(status: "CONFIRMED" | "DECLINED") {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/rsvp/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Erro ao confirmar presença");
      }

      setHasResponded(true);
      setGuest(prev => prev ? { ...prev, rsvpStatus: status } : null);
      
      if (status === "CONFIRMED") {
        toast.success("Presença confirmada! Obrigado!");
      } else {
        toast.success("Obrigado pela resposta!");
      }
    } catch (error) {
      console.error("[RSVP_UPDATE]", error);
      toast.error("Erro ao confirmar presença");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Carregando convite...</p>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Convite não encontrado</h1>
          <p className="text-gray-600">Este convite não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  if (hasResponded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              {guest.rsvpStatus === "CONFIRMED" ? "✅ Presença Confirmada!" : "❌ Presença Declinada"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Obrigado pela resposta, <strong>{guest.name}</strong>!
            </p>
            <p className="text-gray-600">
              {guest.rsvpStatus === "CONFIRMED" 
                ? "Estamos ansiosos para sua presença no evento!" 
                : "Sentimos muito que não possa comparecer. Esperamos vê-lo em breve!"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl">🎉 Convite Especial</CardTitle>
            <p className="text-blue-100 mt-2">Você está convidado(a) para</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{guest.event.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{guest.event.description}</p>
            </div>

            {guest.event.imageUrl && (
              <div className="text-center mb-8">
                <img 
                  src={guest.event.imageUrl} 
                  alt="Convite" 
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                />
              </div>
            )}

            <div className="grid gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800">Data e Horário</p>
                  <p className="text-gray-600">
                    {format(new Date(guest.event.date), "PPP 'às' p", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-800">Local</p>
                  <p className="text-gray-600">{guest.event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-800">Convidado</p>
                  <p className="text-gray-600">{guest.name}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 mb-6">
                Confirme sua presença:
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
                  onClick={() => handleRsvp("CONFIRMED")}
                  disabled={isLoading}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Sim, Confirmar Presença
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 px-8 py-3 text-lg"
                  onClick={() => handleRsvp("DECLINED")}
                  disabled={isLoading}
                >
                  <X className="h-5 w-5 mr-2" />
                  Não Poderei Comparecer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 