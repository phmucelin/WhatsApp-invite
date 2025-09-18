"use client";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Send, TestTube } from "lucide-react";

import { MessagesList } from "@/components/dashboard/messages-list";

export default function MessagesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error("Por favor, preencha o número de telefone e a mensagem.");
      return;
    }

    setIsLoading(true);
    try {
      const encodedMessage = encodeURIComponent(message);
      const encodedMessageUTF8 = encodeURIComponent(message).replace(/%20/g, '+');
      
      console.log("[SEND_MESSAGE]", {
        original: message,
        encoded: encodedMessage,
        encodedUTF8: encodedMessageUTF8
      });

      // Abrir WhatsApp com mensagem de teste
      const testUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(testUrl, '_blank');
      
      toast.success("Mensagem enviada!");
      setMessage("");
      setPhoneNumber("");
    } catch (error) {
      console.error("[SEND_MESSAGE]", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmojis = async () => {
    try {
      const testMessage = `🎊 *Convite Especial* 🎊

Teste de emojis para WhatsApp

📅 *Data:* 22 de Setembro
📍 *Local:* Av. Teste
🔗 *Link:* https://exemplo.com
⭐ *Confirmação!* ⭐`;

      // Testar diferentes métodos de encoding (sem Buffer)
      const encodedMessage = encodeURIComponent(testMessage);
      const encodedMessagePlus = encodedMessage.replace(/%20/g, '+');
      
      // Encoding manual para debug
      const manualEncoded = testMessage
        .split('')
        .map(char => {
          const code = char.charCodeAt(0);
          if (code < 128) return char; // ASCII básico
          return encodeURIComponent(char);
        })
        .join('');

      console.log("[TEST_EMOJIS_ENCODING]", {
        original: testMessage,
        encoded: encodedMessage,
        encodedPlus: encodedMessagePlus,
        manual: manualEncoded,
        // Mostrar como cada emoji é codificado
        emojiCodes: {
          '🎊': encodeURIComponent('🎊'),
          '📅': encodeURIComponent('📅'),
          '📍': encodeURIComponent('📍'),
          '🔗': encodeURIComponent('🔗'),
          '⭐': encodeURIComponent('⭐')
        }
      });

      // Testar todas as versões
      const urls = [
        { name: "Padrão", url: `https://wa.me/5511999999999?text=${encodedMessage}` },
        { name: "Com +", url: `https://wa.me/5511999999999?text=${encodedMessagePlus}` },
        { name: "Manual", url: `https://wa.me/5511999999999?text=${manualEncoded}` }
      ];

      // Abrir a primeira versão e mostrar as outras no console
      window.open(urls[0].url, '_blank');
      
      console.log("[TEST_URLS]", urls);
      
      toast.success("Teste de emojis enviado! Verifique o WhatsApp e o console para todas as versões.");
    } catch (error) {
      console.error("[TEST_EMOJIS]", error);
      toast.error("Erro no teste de emojis");
    }
  };

  return (
    <div className="main-container">
      <div className="container mx-auto p-4">
        <h1 className="page-title text-4xl font-bold mb-8">Enviar Mensagem</h1>


        <MessagesList />
      </div>
    </div>
  );
}
