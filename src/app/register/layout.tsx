import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro - WhatsApp Invite",
  description: "Crie sua conta de administrador",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 