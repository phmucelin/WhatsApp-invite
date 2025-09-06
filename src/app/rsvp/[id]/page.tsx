"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { PartyPopper, Calendar, MapPin, User } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  phoneNumber: string;
  rsvpStatus: "WAITING" | "CONFIRMED" | "DECLINED";
  event: {
    title: string;
    description: string;
    date: Date;
    location: string;
    imageUrl?: string;
    message: string;
  };
}

export default function RsvpPage() {
  const params = useParams();
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);
  const [searchAttempts, setSearchAttempts] = useState(0);

  const loadGuestWithFallback = useCallback(async () => {
    try {
      setIsLoading(true);
      const guestId = Array.isArray(params.id) ? params.id[0] : params.id;
      console.log("[RSVP] Tentando carregar convidado com ID:", guestId);

      // Tentativa 1: ID direto
      let response = await fetch(`/api/rsvp/${guestId}`);
      console.log("[RSVP] Tentativa 1 - ID direto:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[RSVP] Convidado encontrado com ID direto:", data.name);
        setGuest(data);
        setHasResponded(data.rsvpStatus !== "WAITING");
        return;
      }

      // Tentativa 2: Rota alternativa
      response = await fetch(`/api/rsvp/guest?id=${guestId}`);
      console.log("[RSVP] Tentativa 2 - Rota alternativa:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(
          "[RSVP] Convidado encontrado com rota alternativa:",
          data.name
        );
        setGuest(data);
        setHasResponded(data.rsvpStatus !== "WAITING");
        return;
      }

      // Tentativa 3: Busca por nome (se o ID parecer um nome)
      if (guestId && guestId.length > 10 && !guestId.includes("cmf")) {
        console.log("[RSVP] Tentativa 3 - Buscando por nome:", guestId);
        const searchResponse = await fetch(
          `/api/rsvp/search?query=${encodeURIComponent(guestId)}`
        );

        if (searchResponse.ok) {
          const searchData = await response.json();
          if (searchData.guests && searchData.guests.length > 0) {
            const foundGuest = searchData.guests[0];
            console.log(
              "[RSVP] Convidado encontrado por busca:",
              foundGuest.name
            );

            // Redirecionar para o ID correto
            router.replace(`/rsvp/${foundGuest.id}`);
            return;
          }
        }
      }

      // Tentativa 4: Busca inteligente por todos os convidados
      if (searchAttempts === 0) {
        console.log(
          "[RSVP] Tentativa 4 - Busca inteligente por todos os convidados"
        );
        setSearchAttempts(1);

        const allGuestsResponse = await fetch("/api/rsvp/list");
        if (allGuestsResponse.ok) {
          const allGuestsData = await allGuestsResponse.json();
          console.log(
            "[RSVP] Total de convidados no sistema:",
            allGuestsData.total
          );

          // Se há apenas um convidado, redirecionar para ele
          if (allGuestsData.total === 1) {
            const singleGuest = allGuestsData.guests[0];
            console.log(
              "[RSVP] Único convidado encontrado, redirecionando para:",
              singleGuest.id
            );
            router.replace(`/rsvp/${singleGuest.id}`);
            return;
          }

          // Se há múltiplos convidados, mostrar lista para escolha
          if (allGuestsData.total > 1) {
            showGuestSelection(allGuestsData.guests);
            return;
          }
        }
      }

      // Se chegou aqui, convidado não foi encontrado
      console.log("[RSVP] Convidado não encontrado após todas as tentativas");
      setGuest(null);
    } catch (error) {
      console.error("[RSVP_LOAD]", error);
      alert("Erro ao carregar convite: " + error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router, searchAttempts]);

  useEffect(() => {
    if (params.id) {
      loadGuestWithFallback();
    }
  }, [params.id, loadGuestWithFallback]);

  function showGuestSelection(guests: Guest[]) {
    const guestNames = guests.map((g) => g.name).join(", ");
    // Removido o alert - a mensagem já aparece na interface
  }

  async function handleRsvp(status: "CONFIRMED" | "DECLINED") {
    try {
      setIsLoading(true);

      if (!guest) return;

      // Tentar a rota dinâmica primeiro
      let response = await fetch(`/api/rsvp/${guest.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      // Se falhar, tentar a rota alternativa
      if (!response.ok) {
        console.log("[RSVP] Tentando rota alternativa para POST...");
        response = await fetch(`/api/rsvp/guest?id=${guest.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });
      }

      if (!response.ok) {
        throw new Error("Erro ao confirmar presença");
      }

      setHasResponded(true);
      setGuest((prev) => (prev ? { ...prev, rsvpStatus: status } : null));

      // Removido os alerts que causavam o modal de confirmação
    } catch (error) {
      console.error("[RSVP_UPDATE]", error);
      alert("Erro ao confirmar presença: " + error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p style={{ fontSize: "18px" }}>Carregando convite...</p>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#dc2626",
              marginBottom: "16px",
            }}
          >
            Convite não encontrado
          </h1>
          <p style={{ color: "#4b5563" }}>
            Este convite não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  if (hasResponded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "24px",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            {guest.rsvpStatus === "CONFIRMED"
              ? "✅ Presença Confirmada!"
              : "❌ Presença Declinada"}
          </h2>
          <p style={{ fontSize: "18px", marginBottom: "16px" }}>
            Obrigado pela resposta, <strong>{guest.name}</strong>!
          </p>
          <p style={{ color: "#4b5563" }}>
            {guest.rsvpStatus === "CONFIRMED"
              ? "Estamos ansiosos para sua presença no evento!"
              : "Sentimos muito que não possa comparecer. Esperamos vê-lo em breve!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)",
        padding: "16px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
              color: "white",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              <PartyPopper 
                style={{ 
                  display: "inline-block", 
                  marginRight: "8px",
                  color: "#fbbf24",
                  width: "28px",
                  height: "28px"
                }} 
              />
              Convite Especial
            </h1>
            <p style={{ color: "#bfdbfe", fontSize: "18px" }}>
              Você está convidado(a) para
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: "16px",
                }}
              >
                {guest.event.title}
              </h2>
              <p
                style={{
                  fontSize: "18px",
                  color: "#4b5563",
                  marginBottom: "24px",
                }}
              >
                {guest.event.description}
              </p>
            </div>

            {guest.event.imageUrl && (
              <div style={{ 
                textAlign: "center", 
                marginBottom: "32px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Image
                  src={guest.event.imageUrl}
                  alt="Convite"
                  width={400}
                  height={300}
                  style={{
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    maxHeight: "400px",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
                    objectFit: "contain"
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#eff6ff",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <Calendar 
                  style={{ 
                    fontSize: "24px",
                    color: "#3b82f6",
                    width: "24px",
                    height: "24px"
                  }} 
                />
                <div>
                  <p style={{ fontWeight: "600", color: "#1f2937" }}>
                    Data e Horário
                  </p>
                  <p style={{ color: "#4b5563" }}>
                    {(() => {
                      const eventDate = new Date(guest.event.date);
                      const weekdays = [
                        "domingo", "segunda-feira", "terça-feira", "quarta-feira", 
                        "quinta-feira", "sexta-feira", "sábado"
                      ];
                      
                      const months = [
                        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
                        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
                      ];
                      
                      // Usar métodos UTC para evitar problemas de fuso horário
                      const weekday = weekdays[eventDate.getUTCDay()];
                      const day = eventDate.getUTCDate();
                      const month = months[eventDate.getUTCMonth()];
                      const year = eventDate.getUTCFullYear();
                      const hours = eventDate.getUTCHours().toString().padStart(2, '0');
                      const minutes = eventDate.getUTCMinutes().toString().padStart(2, '0');
                      
                      return `${weekday}, ${day} de ${month} de ${year} às ${hours}:${minutes}`;
                    })()}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <MapPin 
                  style={{ 
                    fontSize: "24px",
                    color: "#22c55e",
                    width: "24px",
                    height: "24px"
                  }} 
                />
                <div>
                  <p style={{ fontWeight: "600", color: "#1f2937" }}>Local</p>
                  <p style={{ color: "#4b5563" }}>{guest.event.location}</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#faf5ff",
                  borderRadius: "8px",
                }}
              >
                <User 
                  style={{ 
                    fontSize: "24px",
                    color: "#a855f7",
                    width: "24px",
                    height: "24px"
                  }} 
                />
                <div>
                  <p style={{ fontWeight: "600", color: "#1f2937" }}>
                    Convidado
                  </p>
                  <p style={{ color: "#4b5563" }}>{guest.name}</p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "24px",
                }}
              >
                Confirme sua presença:
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  style={{
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "18px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onClick={() => handleRsvp("CONFIRMED")}
                  disabled={isLoading}
                >
                  ✅ Sim, Confirmar Presença
                </button>

                <button
                  style={{
                    background: "transparent",
                    color: "#dc2626",
                    border: "2px solid #fca5a5",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "18px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onClick={() => handleRsvp("DECLINED")}
                  disabled={isLoading}
                >
                  ❌ Não Poderei Comparecer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
