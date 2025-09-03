export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("[RSVP_API] GET request received for ID:", params.id);
  console.log("[RSVP_API] Request URL:", request.url);

  try {
    console.log("[RSVP_API] Querying database for guest:", params.id);

    const guest = await prisma.guest.findUnique({
      where: { id: params.id },
      include: {
        event: true,
      },
    });

    console.log("[RSVP_API] Database result:", guest);

    if (!guest) {
      console.log("[RSVP_API] Guest not found, returning 404");
      return new NextResponse("Guest not found", { status: 404 });
    }

    console.log("[RSVP_API] Guest found, returning data");
    return NextResponse.json(guest);
  } catch (error) {
    console.error("[RSVP_API] Error in GET:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("[RSVP_API] POST request received for ID:", params.id);

  try {
    const { status } = await request.json();
    console.log("[RSVP_API] Status received:", status);

    if (!status || !["CONFIRMED", "DECLINED"].includes(status)) {
      console.log("[RSVP_API] Invalid status, returning 400");
      return new NextResponse("Invalid status", { status: 400 });
    }

    console.log("[RSVP_API] Updating guest status");
    const guest = await prisma.guest.update({
      where: { id: params.id },
      data: { rsvpStatus: status },
      include: {
        event: true,
      },
    });

    console.log("[RSVP_API] Guest updated successfully");
    return NextResponse.json(guest);
  } catch (error) {
    console.error("[RSVP_API] Error in POST:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
