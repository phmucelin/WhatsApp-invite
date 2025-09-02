import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumber: string) {
  // Remove todos os caracteres não numéricos
  const numbers = phoneNumber.replace(/\D/g, "");

  // Adiciona o código do país se não existir
  const withCountryCode = numbers.startsWith("55") ? numbers : `55${numbers}`;

  // Formata o número para exibição
  const match = withCountryCode.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    const [, country, ddd, firstPart, secondPart] = match;
    return `+${country} (${ddd}) ${firstPart}-${secondPart}`;
  }

  return phoneNumber;
}

export function normalizePhoneNumber(phoneNumber: string) {
  // Remove todos os caracteres não numéricos
  const numbers = phoneNumber.replace(/\D/g, "");

  // Adiciona o código do país se não existir
  return numbers.startsWith("55") ? numbers : `55${numbers}`;
}
