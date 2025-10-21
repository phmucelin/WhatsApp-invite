import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Temporário - retornar dados sem filtro de usuário
    const contacts = await prisma.guest.findMany({
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        sendStatus: true,
        rsvpStatus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[CONTACTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}