export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: params.id },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return new NextResponse("Guest not found", { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error("[RSVP_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    if (!status || !["CONFIRMED", "DECLINED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const guest = await prisma.guest.update({
      where: { id: params.id },
      data: { rsvpStatus: status },
      include: {
        event: true,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("[RSVP_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 