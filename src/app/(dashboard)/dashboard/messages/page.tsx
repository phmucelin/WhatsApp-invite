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

      // Testar diferentes métodos de encoding
      const utf8Message = Buffer.from(testMessage, 'utf8').toString('utf8');
      const encodedMessage = encodeURIComponent(utf8Message);
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
        utf8: utf8Message,
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enviar Mensagem</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Enviar para um Número</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="phoneNumber">Número de Telefone (com DDD)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Ex: 11999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <textarea
                id="message"
                placeholder="Digite sua mensagem aqui..."
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleSendMessage} disabled={isLoading}>
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? "Enviando..." : "Enviar Mensagem"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleTestEmojis}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <TestTube className="mr-2 h-4 w-4" />
                Testar Emojis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <MessagesList />
    </div>
  );
}
