"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RsvpRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(true);
  const [searchResults, setSearchResults] = useState<{
    id: string;
    name: string;
    phoneNumber: string;
    eventTitle: string;
    eventDate: string;
    rsvpStatus: string;
  }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const searchGuests = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      setError("");
      
      console.log("[REDIRECT] Buscando convidados para:", query);
      
      // Buscar por nome ou telefone
      const response = await fetch(`/api/rsvp/search?query=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.guests || []);
        
        // Se encontrou exatamente um convidado, redirecionar automaticamente
        if (data.total === 1) {
          const guest = data.guests[0];
          console.log("[REDIRECT] Redirecionando automaticamente para:", guest.id);
          router.replace(`/rsvp/${guest.id}`);
          return;
        }
        
        // Se encontrou múltiplos, mostrar lista
        if (data.total > 1) {
          console.log("[REDIRECT] Múltiplos convidados encontrados:", data.total);
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
  }, [router]);

  useEffect(() => {
    // Se há um query parameter, fazer busca automática
    const query = searchParams.get('q');
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔍 Buscar Convite
            </h1>
            <p className="text-gray-600">
              Digite o nome ou telefone do convidado para encontrar o convite correto
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSearching ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>

          {/* Resultados da Busca */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Buscando convidados...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Convidados Encontrados ({searchResults.length})
              </h2>
              
              {searchResults.map((guest) => (
                <div
                  key={guest.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {guest.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        📱 {guest.phoneNumber}
                      </p>
                      <p className="text-gray-600 text-sm">
                        🎉 {guest.eventTitle}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Status: {guest.rsvpStatus === "WAITING" ? "Aguardando" : 
                                guest.rsvpStatus === "CONFIRMED" ? "Confirmado" : "Declinado"}
                      </p>
                    </div>
                    <button
                      onClick={() => redirectToGuest(guest.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Ver Convite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery && !error && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum convidado encontrado
              </h3>
              <p className="text-gray-600">
                Não encontramos convidados com &quot;{searchQuery}&quot;. Verifique o nome ou telefone e tente novamente.
              </p>
            </div>
          )}

          {/* Dicas */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
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