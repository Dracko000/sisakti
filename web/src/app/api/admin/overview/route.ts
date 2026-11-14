import { NextResponse, connection } from "next/server";
import { kpis, activityLogs, activityBars } from "@/lib/seed";
import { boardStats } from "@/lib/store";

// GET /api/admin/overview
export async function GET() {
  await connection();
  return NextResponse.json({ kpis, logs: activityLogs, bars: activityBars, boards: boardStats() });
}
