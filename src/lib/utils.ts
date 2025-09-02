import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function normalizePhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");
  
  // Se o número já começar com 55, retorna como está
  if (cleaned.startsWith("55")) {
    return cleaned;
  }
  
  // Se o número tiver 11 dígitos (com DDD), adiciona o 55
  if (cleaned.length === 11) {
    return `55${cleaned}`;
  }
  
  // Se o número tiver 9 dígitos (sem DDD), adiciona o 55 e o DDD padrão (11)
  if (cleaned.length === 9) {
    return `5511${cleaned}`;
  }
  
  // Se o número tiver 8 dígitos (sem 9 e sem DDD), adiciona o 55, DDD padrão (11) e o 9
  if (cleaned.length === 8) {
    return `55119${cleaned}`;
  }
  
  // Se não se encaixar em nenhum padrão, retorna o número limpo
  return cleaned;
}
