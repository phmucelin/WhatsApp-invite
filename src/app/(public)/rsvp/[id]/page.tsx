import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { RsvpForm } from "@/components/forms/rsvp-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RsvpPageProps {
  params: {
    id: string;
  };
}

export default async function RsvpPage({ params }: RsvpPageProps) {
  const guest = await prisma.guest.findUnique({
    where: { id: params.id },
    include: {
      event: true,
    },
  });

  if (!guest) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {guest.event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {guest.event.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={guest.event.imageUrl}
                alt={guest.event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Descrição</h3>
              <p className="text-sm text-muted-foreground">
                {guest.event.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Data e Horário</h3>
              <p className="text-sm text-muted-foreground">
                {format(guest.event.date, "PPP 'às' p", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Local</h3>
              <p className="text-sm text-muted-foreground">
                {guest.event.location}
              </p>
            </div>
          </div>
          <div className="pt-6 border-t">
            <RsvpForm guestId={guest.id} name={guest.name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 