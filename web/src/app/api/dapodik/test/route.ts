import { NextResponse, connection } from "next/server";
import { getTenant, getTenantDapodikConn } from "@/lib/tenants";
import { testDapodikConnection } from "@/lib/dapodik";

// POST /api/dapodik/test?tenantId=...  -> uji tiap endpoint, laporkan detail
export async function POST(req: Request) {
  await connection();
  const id = new URL(req.url).searchParams.get("tenantId") ?? "";
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  const conn = await getTenantDapodikConn(id);
  if (!conn?.baseUrl) return NextResponse.json({ error: "Koneksi Dapodik belum dikonfigurasi." }, { status: 400 });

  const result = await testDapodikConnection({
    baseUrl: conn.baseUrl,
    npsn: conn.npsn,
    tokenKey: conn.token,
    timeoutMs: conn.timeoutMs,
    configured: true,
  });
  return NextResponse.json(result);
}
