export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  console.log("[GUEST_API] GET request received");

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  console.log("[GUEST_API] Guest ID from query:", id);

  if (!id) {
    console.log("[GUEST_API] No ID provided, returning 400");
    return new NextResponse("Guest ID is required", { status: 400 });
  }

  try {
    console.log("[GUEST_API] Querying database for guest:", id);

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    console.log("[GUEST_API] Database result:", guest);

    if (!guest) {
      console.log("[GUEST_API] Guest not found, returning 404");
      return new NextResponse("Guest not found", { status: 404 });
    }

    console.log("[GUEST_API] Guest found, returning data");
    return NextResponse.json(guest);
  } catch (error) {
    console.error("[GUEST_API] Error in GET:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("[GUEST_API] POST request received");

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Guest ID is required", { status: 400 });
  }

  try {
    const { status } = await request.json();
    console.log("[GUEST_API] Status received:", status);

    if (!status || !["CONFIRMED", "DECLINED"].includes(status)) {
      console.log("[GUEST_API] Invalid status, returning 400");
      return new NextResponse("Invalid status", { status: 400 });
    }

    console.log("[GUEST_API] Updating guest status");
    const guest = await prisma.guest.update({
      where: { id },
      data: { rsvpStatus: status },
      include: {
        event: true,
      },
    });

    console.log("[GUEST_API] Guest updated successfully");
    return NextResponse.json(guest);
  } catch (error) {
    console.error("[GUEST_API] Error in POST:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
