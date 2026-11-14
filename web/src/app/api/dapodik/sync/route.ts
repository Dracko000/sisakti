import { NextResponse, connection } from "next/server";
import { getTenant, getTenantDapodikConn, setTenantLastSync } from "@/lib/tenants";
import { runDapodikSync } from "@/lib/dapodik";
import { ingestSnapshot, getTenantDataCounts } from "@/lib/ingest";

// POST /api/dapodik/sync?tenantId=...  -> tarik dari Web Service Dapodik lalu simpan ke DB
export async function POST(req: Request) {
  await connection();
  const id = new URL(req.url).searchParams.get("tenantId") ?? "";
  const tenant = await getTenant(id);
  if (!tenant) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  const conn = await getTenantDapodikConn(id);
  if (!conn?.baseUrl) {
    return NextResponse.json({ status: "error", message: "Koneksi Dapodik tenant belum dikonfigurasi.", syncedAt: new Date().toISOString() }, { status: 400 });
  }
  const result = await runDapodikSync(conn);
  if (result.status === "success" && result.snapshot) {
    try {
      await ingestSnapshot(id, result.snapshot);
      // samakan angka dengan yang benar-benar tersimpan (setelah dedupe)
      const c = await getTenantDataCounts(id);
      result.counts = { sekolah: c.sekolah ? 1 : 0, guru: c.guru, siswa: c.siswa, rombel: c.rombel };
    } catch (e) {
      result.status = "error";
      result.message = `Data ditarik tetapi gagal disimpan: ${(e as Error).message}`;
    }
  }
  await setTenantLastSync(id, result);
  const counts = await getTenantDataCounts(id);
  return NextResponse.json({ ...result, dbCounts: counts, tenant: await getTenant(id) }, { status: result.status === "success" ? 200 : 502 });
}
