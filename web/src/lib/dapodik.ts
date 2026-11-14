import "server-only";
import crypto from "node:crypto";

/**
 * Klien integrasi Dapodik (LIVE — tanpa data contoh).
 *
 * Dapodik berjalan di server lokal sekolah dan mengekspos "Web Service" JSON di
 * jaringan sekolah (default port 5774). SiSAKTI menarik data lewat konektor/agent
 * yang berada satu jaringan dengan Dapodik:
 *
 *   [Dapodik sekolah] --(LAN, token)--> [Agent/Connector] --(HTTPS)--> [SiSAKTI]
 *
 * Modul ini = sisi klien: buildToken(), request() ber-header Authorization,
 * fetchSnapshot() menarik sekolah/guru/siswa/rombel, plus normalizer tahan
 * variasi field antar versi Dapodik. Tidak ada mock; bila belum dikonfigurasi,
 * sinkronisasi akan menolak dengan pesan jelas.
 */

export interface DapodikConfig {
  baseUrl: string;
  npsn: string;
  tokenKey?: string;
  timeoutMs: number;
  configured: boolean;
}

// Pemetaan endpoint per entitas (kandidat nama action Web Service Dapodik).
// Nama action Web Service yang TERBUKTI ada di Dapodik (getSekolah, getPengguna,
// getPesertaDidik, getRombonganBelajar) + kandidat cadangan untuk versi lain.
export const KONFIG_ENDPOINTS = {
  sekolah: ["getSekolah", "sekolah"],
  guru: ["getPengguna", "getGuru", "getPTK"],
  siswa: ["getPesertaDidik", "getSiswa"],
  rombel: ["getRombonganBelajar", "getRombel"],
} as const;

// ---------------------------------------------------------------- normalizers
export interface DapodikSekolah {
  npsn: string;
  nama: string;
  bentuk: string;
  alamat: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  akreditasi?: string;
}
export interface DapodikGuru {
  id: string;
  nama: string;
  nuptk?: string;
  nip?: string;
  jk?: "L" | "P";
  bidangStudi?: string;
  statusKepegawaian?: string;
}
export interface DapodikSiswa {
  id: string;
  nama: string;
  nisn?: string;
  nis?: string;
  jk?: "L" | "P";
  rombel?: string;
  tingkat?: string;
  tanggalLahir?: string;
}
export interface DapodikRombel {
  id: string;
  nama: string;
  tingkat?: string;
  waliKelas?: string;
  jumlahSiswa?: number;
}

export interface DapodikSnapshot {
  sekolah: DapodikSekolah | null;
  guru: DapodikGuru[];
  siswa: DapodikSiswa[];
  rombel: DapodikRombel[];
  fetchedAt: string;
}

const pick = (o: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return "";
};
const normJK = (v: string): "L" | "P" | undefined => {
  const s = v.trim().toUpperCase();
  if (s === "L" || s === "LAKI-LAKI" || s === "LAKI LAKI" || s === "1") return "L";
  if (s === "P" || s === "PEREMPUAN" || s === "2") return "P";
  return undefined;
};

export function normalizeSekolah(raw: Record<string, unknown>): DapodikSekolah {
  return {
    npsn: pick(raw, ["npsn"]),
    nama: pick(raw, ["nama", "nama_sekolah"]),
    bentuk: pick(raw, ["bentuk_pendidikan_id_str", "bentuk_pendidikan", "bentuk"]),
    alamat: pick(raw, ["alamat_jalan", "alamat"]),
    kecamatan: pick(raw, ["kecamatan", "nm_kecamatan"]) || undefined,
    kabupaten: pick(raw, ["kabupaten_kota", "kabupaten", "nm_kabupaten"]) || undefined,
    provinsi: pick(raw, ["provinsi", "nm_provinsi"]) || undefined,
    akreditasi: pick(raw, ["akreditasi", "akreditasi_sekolah"]) || undefined,
  };
}
/** getPengguna mengembalikan semua pengguna; saring hanya guru/PTK. */
function isGuru(raw: Record<string, unknown>): boolean {
  const peran = pick(raw, ["peran_id_str", "peran", "role"]).toLowerCase();
  if (peran) {
    return peran.includes("ptk") || peran.includes("kepala sekolah") || peran.includes("guru");
  }
  return Boolean(pick(raw, ["ptk_id", "nuptk", "nip"]));
}

export function normalizeGuru(raw: Record<string, unknown>): DapodikGuru {
  return {
    id: pick(raw, ["ptk_id", "pengguna_id", "id"]),
    nama: pick(raw, ["nama", "nm_ptk"]),
    nuptk: pick(raw, ["nuptk"]) || undefined,
    nip: pick(raw, ["nip"]) || undefined,
    jk: normJK(pick(raw, ["jenis_kelamin", "jk"])),
    bidangStudi: pick(raw, ["bidang_studi_terakhir", "bidang_studi", "mapel"]) || undefined,
    statusKepegawaian: pick(raw, ["status_kepegawaian", "peran_id_str"]) || undefined,
  };
}
export function normalizeSiswa(raw: Record<string, unknown>): DapodikSiswa {
  return {
    id: pick(raw, ["peserta_didik_id", "registrasi_id", "id"]),
    nama: pick(raw, ["nama", "nm_siswa"]),
    nisn: pick(raw, ["nisn"]) || undefined,
    nis: pick(raw, ["nipd", "nis"]) || undefined,
    jk: normJK(pick(raw, ["jenis_kelamin", "jk"])),
    rombel: pick(raw, ["nama_rombel", "rombel"]) || undefined,
    tingkat: pick(raw, ["tingkat_pendidikan_id_str", "tingkat_pendidikan_id", "tingkat"]) || undefined,
    tanggalLahir: pick(raw, ["tanggal_lahir", "tgl_lahir"]) || undefined,
  };
}
export function normalizeRombel(raw: Record<string, unknown>): DapodikRombel {
  const anggota = Array.isArray(raw?.anggota_rombel) ? (raw.anggota_rombel as unknown[]) : [];
  return {
    id: pick(raw, ["rombongan_belajar_id", "id"]),
    nama: pick(raw, ["nama", "nm_rombel"]),
    tingkat: pick(raw, ["tingkat_pendidikan_id_str", "tingkat_pendidikan_id"]) || undefined,
    waliKelas: pick(raw, ["ptk_id_str", "nama_wali", "wali_kelas"]) || undefined,
    jumlahSiswa: anggota.length || Number(pick(raw, ["jumlah_siswa", "jml_siswa"])) || undefined,
  };
}

// ---------------------------------------------------------------- client
/** Normalisasi base URL: tambahkan /WebService bila belum ada. */
export function normalizeBaseUrl(raw: string): string {
  let u = (raw || "").trim().replace(/\/+$/, "");
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "http://" + u;
  if (!/\/webservice$/i.test(u)) u += "/WebService";
  return u;
}

export interface ProbeResult {
  endpoint: string;
  ok: boolean;
  status?: number;
  latencyMs: number;
  message: string;
  sample?: string;
}

export class DapodikClient {
  constructor(private cfg: DapodikConfig) {}

  /** Token Web Service dikirim sebagai `Authorization: Bearer <token>`. */
  buildToken(): string {
    return this.cfg.tokenKey ?? "";
  }

  private url(path: string, opts?: { npsn?: boolean; limit?: number }) {
    const base = normalizeBaseUrl(this.cfg.baseUrl);
    const u = new URL(`${base}/${path.replace(/^\//, "")}`);
    // Dapodik mewajibkan parameter `npsn`
    if (opts?.npsn !== false) u.searchParams.set("npsn", this.cfg.npsn);
    // `limit` besar agar semua baris terambil sekaligus (Dapodik mengembalikan semua)
    u.searchParams.set("limit", String(opts?.limit ?? 5000));
    return u.toString();
  }

  /** GET mentah: kembalikan teks + status agar bisa mendeteksi HTML/denied. */
  private async raw(path: string): Promise<{ status: number; text: string; ms: number }> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.cfg.timeoutMs);
    const started = Date.now();
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (this.cfg.tokenKey) headers.Authorization = `Bearer ${this.cfg.tokenKey}`;
      const res = await fetch(this.url(path), { headers, signal: ctrl.signal, cache: "no-store" });
      const text = await res.text();
      return { status: res.status, text, ms: Date.now() - started };
    } finally {
      clearTimeout(t);
    }
  }

  /** Diagnostik satu endpoint: klasifikasi hasil (ok / denied / html / network). */
  async probe(path: string): Promise<ProbeResult> {
    try {
      const { status, text, ms } = await this.raw(path);
      const trimmed = text.trim();
      if (status >= 200 && status < 300 && /access denied/i.test(trimmed)) {
        return { endpoint: path, ok: false, status, latencyMs: ms, message: "Access denied — token salah / belum diaktifkan di Dapodik.", sample: trimmed.slice(0, 120) };
      }
      if (trimmed.startsWith("<")) {
        return { endpoint: path, ok: false, status, latencyMs: ms, message: "Respons HTML (bukan JSON) — periksa URL & token.", sample: trimmed.slice(0, 120) };
      }
      try {
        const json = JSON.parse(trimmed);
        const arr = toArray(json);
        return { endpoint: path, ok: true, status, latencyMs: ms, message: `OK — ${arr.length} baris.`, sample: trimmed.slice(0, 120) };
      } catch {
        return { endpoint: path, ok: false, status, latencyMs: ms, message: "Bukan JSON yang valid.", sample: trimmed.slice(0, 120) };
      }
    } catch (e) {
      const err = e as Error & { cause?: { code?: string; message?: string } };
      const code = err.cause?.code ?? "";
      const why =
        code === "ECONNREFUSED" ? "Koneksi ditolak — Dapodik tidak jalan / port salah."
        : code === "ENOTFOUND" ? "Host tidak ditemukan — cek IP/nama host."
        : code === "ETIMEDOUT" || err.name === "AbortError" ? "Timeout — Dapodik tidak merespons."
        : err.message;
      return { endpoint: path, ok: false, latencyMs: 0, message: `${why}${code ? ` (${code})` : ""}`, sample: this.url(path) };
    }
  }

  async request<T = unknown>(path: string): Promise<T> {
    const { status, text, ms } = await this.raw(path);
    const trimmed = text.trim();
    if (/access denied/i.test(trimmed)) throw new Error(`Access denied di ${path} — token salah/belum aktif.`);
    if (trimmed.startsWith("<")) throw new Error(`Respons HTML dari ${path} — URL/token salah.`);
    if (status < 200 || status >= 300) throw new Error(`HTTP ${status} @ ${path} (${ms}ms)`);
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      throw new Error(`JSON tidak valid dari ${path}.`);
    }
  }

  private async pull(entity: keyof typeof KONFIG_ENDPOINTS): Promise<Record<string, unknown>[]> {
    const errors: string[] = [];
    for (const ep of KONFIG_ENDPOINTS[entity]) {
      try {
        return toArray(await this.request<unknown>(ep));
      } catch (e) {
        errors.push((e as Error).message);
      }
    }
    throw new Error(`Gagal menarik ${entity}: ${errors[0] ?? "tidak ada endpoint yang berhasil"}`);
  }

  async fetchSnapshot(): Promise<DapodikSnapshot> {
    // Dapodik (PHP) memproses satu request sekaligus -> tarik berurutan.
    const sek = await this.pull("sekolah");
    const guru = await this.pull("guru");
    const siswa = await this.pull("siswa");
    const rombel = await this.pull("rombel");
    return {
      sekolah: sek[0] ? normalizeSekolah(sek[0]) : null,
      guru: guru.filter(isGuru).map(normalizeGuru),
      siswa: siswa.map(normalizeSiswa),
      rombel: rombel.map(normalizeRombel),
      fetchedAt: new Date().toISOString(),
    };
  }
}

/** Uji semua endpoint utama + laporkan detail. */
export async function testDapodikConnection(cfg: DapodikConfig): Promise<{
  baseUrl: string;
  reachable: boolean;
  results: ProbeResult[];
}> {
  const client = new DapodikClient(cfg);
  const endpoints = ["getSekolah", "getPengguna", "getPesertaDidik", "getRombonganBelajar"];
  const results: ProbeResult[] = [];
  for (const e of endpoints) results.push(await client.probe(e));
  return {
    baseUrl: normalizeBaseUrl(cfg.baseUrl),
    reachable: results.some((r) => r.ok),
    results,
  };
}

function toArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "rows", "result", "results", "records"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
      // Dapodik: `rows` bisa berupa objek tunggal (mis. getSekolah)
      if (v && typeof v === "object") return [v as Record<string, unknown>];
    }
    return [obj];
  }
  return [];
}

// ---------------------------------------------------------------- sync (per-tenant)
export interface DapodikConn {
  baseUrl: string;
  npsn: string;
  token?: string;
  timeoutMs?: number;
}

export interface DapodikSyncResult {
  status: "success" | "error";
  message: string;
  snapshot?: DapodikSnapshot;
  counts?: { sekolah: number; guru: number; siswa: number; rombel: number };
  syncedAt: string;
}

/** Jalankan sinkronisasi live memakai koneksi milik satu tenant. */
export async function runDapodikSync(conn: DapodikConn): Promise<DapodikSyncResult> {
  if (!conn.baseUrl || !conn.npsn) {
    return {
      status: "error",
      message: "Koneksi Dapodik tenant belum lengkap (Base URL & NPSN wajib).",
      syncedAt: new Date().toISOString(),
    };
  }
  try {
    const snap = await new DapodikClient({
      baseUrl: conn.baseUrl,
      npsn: conn.npsn,
      tokenKey: conn.token,
      timeoutMs: conn.timeoutMs ?? 8000,
      configured: true,
    }).fetchSnapshot();
    return {
      status: "success",
      message: "Berhasil menarik data dari Web Service Dapodik.",
      snapshot: snap,
      counts: {
        sekolah: snap.sekolah ? 1 : 0,
        guru: snap.guru.length,
        siswa: snap.siswa.length,
        rombel: snap.rombel.length,
      },
      syncedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      status: "error",
      message: `Gagal sinkronisasi: ${(e as Error).message}`,
      syncedAt: new Date().toISOString(),
    };
  }
}
