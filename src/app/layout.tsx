import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { SonnerProvider } from "@/components/providers/sonner-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chai School Convites",
  description: "Sistema de convites da Chai School",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={`${inter.className} min-h-full bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          {children}
          <SonnerProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
