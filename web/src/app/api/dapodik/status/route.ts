import { NextResponse, connection } from "next/server";
import { getTenant } from "@/lib/tenants";

// GET /api/dapodik/status?tenantId=...
export async function GET(req: Request) {
  await connection();
  const id = new URL(req.url).searchParams.get("tenantId") ?? "";
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ config: t.dapodik, lastSync: t.lastSync });
}
