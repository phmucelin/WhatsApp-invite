import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/blob";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const location = formData.get("location") as string;
    const message = formData.get("message") as string;
    const image = formData.get("image") as File | null;

    if (!title || !description || !date || !time || !location || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let imageUrl: string | undefined;

    if (image) {
      imageUrl = await uploadImage(image);
    }

    console.log("[EVENTS_CREATE] Data recebida:", date);
    console.log("[EVENTS_CREATE] Hora recebida:", time);
    console.log("[EVENTS_CREATE] String concatenada:", `${date}T${time}`);
    
    // Criar data de forma mais robusta
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    // Criar data usando UTC para evitar problemas de fuso horário
    const eventDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    console.log("[EVENTS_CREATE] Data criada:", eventDate);
    console.log("[EVENTS_CREATE] Data ISO:", eventDate.toISOString());
    console.log("[EVENTS_CREATE] Horário local:", eventDate.toLocaleString('pt-BR'));

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        location,
        message,
        imageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
