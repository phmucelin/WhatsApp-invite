"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RsvpRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(true);
  const [searchResults, setSearchResults] = useState<
    {
      id: string;
      name: string;
      phoneNumber: string;
      eventTitle: string;
      eventDate: Date;
      rsvpStatus: string;
    }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const searchGuests = useCallback(
    async (query: string) => {
      try {
        setIsSearching(true);
        setError("");

        console.log("[REDIRECT] Buscando convidados para:", query);

        // Buscar por nome ou telefone
        const response = await fetch(
          `/api/rsvp/search?query=${encodeURIComponent(query)}`
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.guests || []);

          // Se encontrou exatamente um convidado, redirecionar automaticamente
          if (data.total === 1) {
            const guest = data.guests[0];
            console.log(
              "[REDIRECT] Redirecionando automaticamente para:",
              guest.id
            );
            router.replace(`/rsvp/${guest.id}`);
            return;
          }

          // Se encontrou múltiplos, mostrar lista
          if (data.total > 1) {
            console.log(
              "[REDIRECT] Múltiplos convidados encontrados:",
              data.total
            );
          }
        } else {
          setError("Erro ao buscar convidados");
        }
      } catch (error) {
        console.error("[REDIRECT] Erro na busca:", error);
        setError("Erro na busca");
      } finally {
        setIsSearching(false);
      }
    },
    [router]
  );

  useEffect(() => {
    // Se há um query parameter, fazer busca automática
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      searchGuests(query);
    }
  }, [searchParams, searchGuests]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchGuests(searchQuery.trim());
    }
  }

  function redirectToGuest(guestId: string) {
    router.push(`/rsvp/${guestId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              🔍 Buscar Convite
            </h1>
            <p className="text-gray-600">
              Digite o nome ou telefone do convidado para encontrar o convite
              correto
            </p>
          </div>

          {/* Formulário de Busca */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nome ou telefone do convidado..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>

          {/* Resultados da Busca */}
          {isSearching && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Buscando convidados...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Convidados Encontrados ({searchResults.length})
              </h2>

              {searchResults.map((guest) => (
                <div
                  key={guest.id}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {guest.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📱 {guest.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        🎉 {guest.eventTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status:{" "}
                        {guest.rsvpStatus === "WAITING"
                          ? "Aguardando"
                          : guest.rsvpStatus === "CONFIRMED"
                            ? "Confirmado"
                            : "Declinado"}
                      </p>
                    </div>
                    <button
                      onClick={() => redirectToGuest(guest.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Ver Convite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching &&
            searchResults.length === 0 &&
            searchQuery &&
            !error && (
              <div className="py-8 text-center">
                <div className="mb-4 text-6xl text-gray-400">🔍</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Nenhum convidado encontrado
                </h3>
                <p className="text-gray-600">
                  Não encontramos convidados com &quot;{searchQuery}&quot;.
                  Verifique o nome ou telefone e tente novamente.
                </p>
              </div>
            )}

          {/* Dicas */}
          <div className="mt-8 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">💡 Dicas:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Digite apenas o primeiro nome do convidado</li>
              <li>• Use o número de telefone completo</li>
              <li>• Se não encontrar, verifique se o convite foi enviado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
