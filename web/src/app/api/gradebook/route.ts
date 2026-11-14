import { NextResponse, connection } from "next/server";
import { getGradeRows, gradeSummary } from "@/lib/store";

// GET /api/gradebook
export async function GET() {
  await connection();
  return NextResponse.json({ rows: getGradeRows(), summary: gradeSummary() });
}
