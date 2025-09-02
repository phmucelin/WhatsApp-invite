import { NextResponse } from "next/server";

export async function GET() {
  console.log("[TEST_API] Test route accessed");
  return NextResponse.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString() 
  });
} 