import { NextResponse, connection } from "next/server";
import { getTenant } from "@/lib/tenants";
import { prisma } from "@/lib/prisma";

// GET /api/tenants/:id/data?entity=sekolah|guru|siswa|rombel&take=&skip=&q=
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });

  const url = new URL(req.url);
  const entity = url.searchParams.get("entity") ?? "siswa";
  const take = Math.min(500, Number(url.searchParams.get("take") ?? 100));
  const skip = Math.max(0, Number(url.searchParams.get("skip") ?? 0));
  const q = (url.searchParams.get("q") ?? "").trim();

  if (entity === "sekolah") {
    return NextResponse.json({ sekolah: await prisma.school.findUnique({ where: { tenantId: id } }) });
  }
  if (entity === "guru") {
    const where = { tenantId: id, ...(q ? { nama: { contains: q } } : {}) };
    const [rows, total] = await Promise.all([
      prisma.teacher.findMany({ where, take, skip, orderBy: { nama: "asc" } }),
      prisma.teacher.count({ where }),
    ]);
    return NextResponse.json({ rows, total });
  }
  if (entity === "rombel") {
    const where = { tenantId: id, ...(q ? { nama: { contains: q } } : {}) };
    const [rows, total] = await Promise.all([
      prisma.rombel.findMany({ where, take, skip, orderBy: { nama: "asc" } }),
      prisma.rombel.count({ where }),
    ]);
    return NextResponse.json({ rows, total });
  }
  // siswa (default)
  const where = { tenantId: id, ...(q ? { OR: [{ nama: { contains: q } }, { nisn: { contains: q } }, { rombel: { contains: q } }] } : {}) };
  const [rows, total] = await Promise.all([
    prisma.student.findMany({ where, take, skip, orderBy: { nama: "asc" } }),
    prisma.student.count({ where }),
  ]);
  return NextResponse.json({ rows, total });
}
