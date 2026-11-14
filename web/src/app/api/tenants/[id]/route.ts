import { NextResponse, connection } from "next/server";
import { getTenant, updateTenant, deleteTenant, setTenantDapodik, getTenantDapodikConn } from "@/lib/tenants";
import { normalizeBaseUrl } from "@/lib/dapodik";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ tenant: t });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  const b = await req.json().catch(() => ({}));

  const patch: Record<string, string> = {};
  for (const k of ["name", "npsn", "level", "city", "plan", "status"]) if (b[k] !== undefined) patch[k] = b[k];
  if (Object.keys(patch).length) await updateTenant(id, patch);

  if (b.dapodik) {
    const d = b.dapodik;
    if (!d.baseUrl) {
      await setTenantDapodik(id, null);
    } else {
      const prev = await getTenantDapodikConn(id);
      await setTenantDapodik(id, {
        baseUrl: normalizeBaseUrl(String(d.baseUrl)),
        npsn: String(d.npsn ?? t.npsn).trim(),
        token: d.token ? String(d.token) : prev?.token,
        timeoutMs: Number(d.timeoutMs ?? prev?.timeoutMs ?? 8000),
      });
    }
  }
  return NextResponse.json({ tenant: await getTenant(id) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const ok = await deleteTenant(id);
  if (!ok) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
