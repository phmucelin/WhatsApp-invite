import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { guestId, rsvpStatus } = await request.json();

    if (!guestId || !rsvpStatus) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!["CONFIRMED", "DECLINED"].includes(rsvpStatus)) {
      return new NextResponse("Invalid RSVP status", { status: 400 });
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: { rsvpStatus },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("[RSVP_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 