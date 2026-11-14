import { NextResponse } from "next/server";
import { attendance } from "@/lib/seed";

// GET /api/attendance
export async function GET() {
  return NextResponse.json({ attendance });
}
