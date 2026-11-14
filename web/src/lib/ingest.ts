import { prisma } from "./prisma";
import type { DapodikSnapshot } from "./dapodik";

/**
 * Simpan hasil sinkronisasi Dapodik ke DB — idempoten per tenant.
 * Menghapus lalu menulis ulang master data tenant tsb dalam satu transaksi.
 */
/** Buang entri dengan extId duplikat (Dapodik bisa mengembalikan peran ganda). */
function dedupe<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const key = r.id || "";
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(r);
  }
  return out;
}

export async function ingestSnapshot(tenantId: string, snap: DapodikSnapshot) {
  const ops: unknown[] = [];

  // sekolah (upsert)
  if (snap.sekolah) {
    ops.push(
      prisma.school.upsert({
        where: { tenantId },
        create: { tenantId, ...mapSchool(snap.sekolah) },
        update: mapSchool(snap.sekolah),
      }),
    );
  }

  // guru
  ops.push(prisma.teacher.deleteMany({ where: { tenantId } }));
  if (snap.guru.length) {
    ops.push(
      prisma.teacher.createMany({
        data: dedupe(snap.guru).map((g) => ({
          tenantId,
          extId: g.id,
          nama: g.nama,
          nuptk: g.nuptk ?? "",
          nip: g.nip ?? "",
          jk: g.jk ?? "",
          bidangStudi: g.bidangStudi ?? "",
          statusKepegawaian: g.statusKepegawaian ?? "",
        })),
      }),
    );
  }

  // siswa
  ops.push(prisma.student.deleteMany({ where: { tenantId } }));
  if (snap.siswa.length) {
    ops.push(
      prisma.student.createMany({
        data: dedupe(snap.siswa).map((s) => ({
          tenantId,
          extId: s.id,
          nama: s.nama,
          nisn: s.nisn ?? "",
          nis: s.nis ?? "",
          jk: s.jk ?? "",
          rombel: s.rombel ?? "",
          tingkat: s.tingkat ?? "",
          tanggalLahir: s.tanggalLahir ?? "",
        })),
      }),
    );
  }

  // rombel
  ops.push(prisma.rombel.deleteMany({ where: { tenantId } }));
  if (snap.rombel.length) {
    ops.push(
      prisma.rombel.createMany({
        data: dedupe(snap.rombel).map((r) => ({
          tenantId,
          extId: r.id,
          nama: r.nama,
          tingkat: r.tingkat ?? "",
          waliKelas: r.waliKelas ?? "",
          jumlahSiswa: r.jumlahSiswa ?? 0,
        })),
      }),
    );
  }

  // @ts-expect-error Prisma transaction array typing
  await prisma.$transaction(ops);
}

function mapSchool(s: NonNullable<DapodikSnapshot["sekolah"]>) {
  return {
    npsn: s.npsn,
    nama: s.nama,
    bentuk: s.bentuk,
    alamat: s.alamat,
    kecamatan: s.kecamatan ?? "",
    kabupaten: s.kabupaten ?? "",
    provinsi: s.provinsi ?? "",
    akreditasi: s.akreditasi ?? "",
  };
}

export async function getTenantDataCounts(tenantId: string) {
  const [guru, siswa, rombel, sekolah] = await Promise.all([
    prisma.teacher.count({ where: { tenantId } }),
    prisma.student.count({ where: { tenantId } }),
    prisma.rombel.count({ where: { tenantId } }),
    prisma.school.findUnique({ where: { tenantId } }),
  ]);
  return { guru, siswa, rombel, sekolah };
}
