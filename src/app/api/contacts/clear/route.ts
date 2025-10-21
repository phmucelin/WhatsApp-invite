import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function DELETE() {
  return NextResponse.json({ message: "API temporária - sistema de auth sendo reconstruído" });
}