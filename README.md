# SiSAKTI

**Sistem Administrasi Kelas & Aktivitas Terintegrasi SIBI** — platform pembelajaran yang mengintegrasikan perbukuan resmi
[SIBI Kemendikbudristek](https://buku.kemdikbud.go.id) dengan kelas live, **papan interaktif paperless per mata pelajaran**,
kuis, dan manajemen kelas terpadu.

Repo ini berisi dua bagian:

| Folder | Isi |
|--------|-----|
| `design/` | Mockup desain di **FigCraft** (`SiSAKTI-Design.figcraft`) + preview PNG `design/preview/` |
| `web/` | Aplikasi **full-stack** Next.js yang dapat dijalankan (frontend + mock backend API) |

---

## 🚀 Menjalankan aplikasi

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

Build produksi:

```bash
cd web
npm run build && npm start
```

### Login (demo, tanpa kata sandi)

Di halaman awal pilih salah satu peran lalu klik **Masuk** — otomatis login sebagai pengguna demo:

| Peran | Akun demo |
|-------|-----------|
| Siswa | Rani Aulia (Kelas VIII-A) |
| Guru | Bu Rani Kartika (Matematika) |
| Orang Tua | Budi Santoso (wali Rani) |
| Admin | Admin SIBI |

Halaman publik **Design System** ada di [`/design-system`](http://localhost:3000/design-system).

---

## 🧱 Tech Stack

- **Next.js 16** (App Router, React 19, Server & Client Components)
- **TypeScript**
- **Tailwind CSS v4** (design token di `@theme`) + **lucide-react** (ikon)
- **Font**: Poppins (display) + Inter (body) via `next/font`
- **Backend**: Next.js Route Handlers (`src/app/api/**`) dengan **in-memory store** (mudah diganti ke PostgreSQL/Prisma)

---

## 🗂️ Struktur kode (modular)

```
web/src/
├─ app/
│  ├─ layout.tsx                # root layout + fonts + Providers
│  ├─ page.tsx                  # Login (pilih peran)
│  ├─ design-system/page.tsx    # dokumentasi token & komponen (publik)
│  │
│  ├─ student/                  # ── Dashboard Siswa ──
│  │  ├─ page.tsx               # Beranda
│  │  ├─ library/page.tsx       # Katalog SIBI
│  │  ├─ reader/page.tsx        # Interactive SIBI Reader
│  │  ├─ live/page.tsx          # Kelas Live (siswa)
│  │  ├─ board/page.tsx         # ★ Papan Interaktif (paperless, per mapel)
│  │  ├─ quiz/page.tsx          # Arena kuis
│  │  ├─ tasks/page.tsx         # Tugas
│  │  ├─ schedule/page.tsx      # Jadwal
│  │  └─ grades/page.tsx        # Nilai & rapor
│  │
│  ├─ teacher/                  # ── Dashboard Guru ──
│  │  ├─ page.tsx               # Dashboard
│  │  ├─ studio/page.tsx        # Studio Kelas Live + nilai papan
│  │  ├─ boards/page.tsx        # ★ Penilaian papan interaktif siswa
│  │  ├─ gradebook/page.tsx     # Buku nilai digital
│  │  ├─ attendance/page.tsx    # Presensi otomatis
│  │  ├─ modules/page.tsx       # Ekstraksi PDF SIBI → bahan ajar
│  │  ├─ bank/page.tsx          # Bank soal
│  │  └─ rpp/page.tsx           # RPP / silabus digital
│  │
│  ├─ parent/                   # ── Dashboard Orang Tua ──
│  │  ├─ page.tsx, progress/, attendance/, grades/, notes/
│  │
│  ├─ admin/                    # ── Dashboard Admin ──
│  │  ├─ page.tsx (analitik), users/, catalog/, classes/, logs/
│  │
│  └─ api/                      # ── Mock Backend (Route Handlers) ──
│     ├─ auth/login/route.ts
│     ├─ books/route.ts
│     ├─ boards/route.ts
│     ├─ boards/[id]/route.ts
│     ├─ boards/[id]/submit/route.ts
│     ├─ boards/[id]/grade/route.ts
│     ├─ boards/[id]/autograde/route.ts
│     ├─ gradebook/route.ts
│     ├─ attendance/route.ts
│     └─ admin/overview/route.ts
│
├─ components/
│  ├─ AppShell.tsx              # Sidebar + header per peran (role-aware)
│  ├─ InteractiveBoard.tsx      # ★ Papan: kertas & toolbar per mapel, baca-otomatis, submit
│  ├─ Mascot.tsx                # Maskot SiSAKTI (SVG)
│  ├─ Icon.tsx                  # render ikon lucide by name (data-driven)
│  ├─ Providers.tsx             # SessionProvider
│  └─ ui.tsx                    # Card, Pill, Progress, Avatar, StatCard, BarChart…
│
└─ lib/
   ├─ types.ts                  # Domain types (User, Board, BoardGrade, …)
   ├─ subjects.ts               # ★ Konfigurasi kertas + toolbar per mata pelajaran
   ├─ seed.ts                   # Data demo (users, books, boards, grades, …)
   ├─ store.ts                  # In-memory store + logika boards/grading
   ├─ ocr.ts                    # Simulasi pembacaan tulisan (OCR) → teks
   ├─ session.tsx               # Context otentikasi (demo)
   ├─ nav.ts                    # Menu navigasi per peran
   └─ cn.ts                     # util className
```

---

## 🧠 Konsep unggulan: Papan Interaktif (Paperless)

Papan interaktif adalah **buku tulis digital personal (1 papan per siswa)**. Kertasnya **menyesuaikan mata pelajaran**
dan toolbarnya **ikut berubah** — intinya paperless:

| Mapel | Jenis kertas | Toolbar |
|-------|--------------|---------|
| Matematika | **Kotak / Kuadran** (grid) | Pena, Penggaris, Jangka, Busur, Hitung, Simbol |
| Bahasa Indonesia | **Bergaris** | Pena, Stabilo, Cek Ejaan, Kamus, Cari Kata |
| IPA Terpadu | **Titik / Polos** | Pena, Bentuk, Tabel, Label, Kamera |
| Bahasa Inggris | **Bergaris** | Pen, Highlight, Spell Check, Dictionary, Speak |
| Seni Budaya | **Polos / Sketsa** | Pensil, Palet, Warna, Stiker, Lapisan |

Alur:
1. Siswa menulis jawaban di papan (kanvas kertas sesuai mapel).
2. Sistem **membaca tulisan otomatis** (OCR) → menghasilkan teks jawaban.
3. Teks dikirim ke guru (`POST /api/boards/:id/submit`).
4. Guru meninjau & **menilai** dengan rubrik (Akurasi/Proses/Penulisan) atau **nilai otomatis**
   (`POST /api/boards/:id/grade` / `:id/autograde`). Nilai langsung tercermin di **Buku Nilai**.

> Implementasi demo memakai simulator rekognisi (`lib/ocr.ts`) + `textarea` handwriting. Di produksi: ganti dengan
> engine OCR/handwriting (mis. Tesseract/PaddleOCR atau model handwriting) di atas data stroke kanvas.

---

## 🗃️ Skema Database (ERD ringkas)

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│    USER      │       │    CLASS      │       │    BOOK      │
├──────────────┤       ├───────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)       │       │ id (PK)      │
│ name         │  │    │ name          │       │ title        │
│ email        │  └───<│ teacher_id FK │       │ subject      │
│ role         │       │ join_code     │       │ grade        │
│ initials     │       └───────┬───────┘       │ sibi_id      │
│ detail       │               │               └──────────────┘
│ class_id FK >│───────────────┘
└──────┬───────┘
       │ 1..*
       │
┌──────▼────────┐     ┌────────────────┐     ┌────────────────────┐
│    BOARD      │     │ BOARD_GRADE    │     │   BOARD_LETTER     │
├───────────────┤     ├────────────────┤     ├────────────────────┤
│ id (PK)       │──1:1│ board_id FK    │     │ board_id FK        │
│ student_id FK │     │ score          │     │ idx                │
│ subject_key   │     │ grade          │     │ char               │
│ paper         │     │ feedback       │     │ confidence         │
│ status        │     │ rubric (json)  │     │ ok                 │
│ recognized_tx │     │ graded_by FK   │     └────────────────────┘
│ strokes       │     └────────────────┘
│ submitted_at  │
└──────┬────────┘
       │
       │            ┌────────────────┐     ┌──────────────────┐
       │            │  GRADE_ROW     │     │  ATTENDANCE      │
       │            ├────────────────┤     ├──────────────────┤
       └───────────<│ student_id FK  │     │ student_id FK    │
                    │ t1,t2,quiz,uts │     │ session_id FK    │
                    │ board          │     │ joined_at        │
                    └────────────────┘     │ duration_min     │
                                           │ status           │
┌──────────────┐   ┌──────────────┐        └──────────────────┘
│  PARENT_LINK │   │ ACTIVITY_LOG │
├──────────────┤   ├──────────────┤
│ parent_id FK │   │ id, actor    │
│ student_id FK│   │ action,target│
└──────────────┘   │ type, time   │
                   └──────────────┘
```

Relasi utama:
- **USER**(role) 1—* **BOARD** (siswa), **CLASS** (guru pengampu), **PARENT_LINK** (orang tua → anak)
- **BOARD** 1—1 **BOARD_GRADE**, 1—* **BOARD_LETTER** (data internal OCR, tidak ditampilkan di UI)
- **USER** 1—1 **GRADE_ROW**, 1—* **ATTENDANCE**

> Di kode demo, entitas di atas direpresentasikan di `lib/types.ts` & `lib/seed.ts` (in-memory).
> Untuk produksi: buat Prisma schema pada PostgreSQL dengan tabel di atas (tambahkan `SESSION`, `MESSAGE` di Redis/Mongo untuk realtime).

---

## 🔌 API Endpoint utama

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login demo berdasarkan peran (`{role}`) → user |
| `GET`  | `/api/books?subject=&q=` | Katalog buku SIBI (filter mapel / pencarian) |
| `GET`  | `/api/boards?studentId=` | Daftar papan + statistik |
| `POST` | `/api/boards` | `{action:"recognize",text}` → hasil pembacaan teks (OCR) |
| `GET`  | `/api/boards/:id` | Detail satu papan |
| `POST` | `/api/boards/:id/submit` | Kirim tulisan siswa `{text,strokes,seed}` → rekognisi + status `submitted` |
| `POST` | `/api/boards/:id/grade` | Nilai guru `{score,grade,rubric[],feedback}` → `graded` |
| `POST` | `/api/boards/:id/autograde` | Nilai otomatis sistem `{score}` |
| `GET`  | `/api/gradebook` | Baris nilai + ringkasan |
| `GET`  | `/api/attendance` | Presensi sesi |
| `GET`  | `/api/admin/overview` | KPI, log aktivitas, grafik |

Contoh:

```bash
curl -X POST http://localhost:3000/api/boards/bd-indah/submit \
  -H "content-type: application/json" \
  -d '{"text":"V = s x s x s = 512 cm3","strokes":12,"seed":2}'

curl -X POST http://localhost:3000/api/boards/bd-indah/grade \
  -H "content-type: application/json" \
  -d '{"score":90,"grade":"A","rubric":[{"label":"Akurasi","value":92}],"feedback":"Bagus"}'
```

---

> **Sumber data buku:** 75 buku siswa **SD/MI Kurikulum Merdeka** diambil dari API resmi SIBI
> `https://api.buku.cloudapp.web.id/api/catalogue/getPenggerakTextBooks` (di balik [buku.kemendikdasmen.go.id](https://buku.kemendikdasmen.go.id/katalog/buku-kurikulum-merdeka)).
> Setiap buku menyertakan **`pdfUrl` berkas PDF lengkap (semua halaman)** dari server SIBI + cover asli di `web/public/covers/sd/`.
> Interactive Reader (`/student/reader?book=<id>`) menampilkan PDF asli itu langsung. Lihat `web/src/lib/books-sd.ts`.


> **Papan Interaktif + buku inline:** di `/student/board`, PDF buku pelajaran **sesuai mapel yang dipilih** ditampilkan **langsung di halaman yang sama** (kolom kanan, `<iframe>`), lengkap dengan pemilih buku/kelas. Berganti otomatis saat mapel diganti.


> **Papan Interaktif (notebook):** `/student/board` kini berupa **buku tulis multi-halaman** per mata pelajaran (tambah/hapus/berpindah halaman, tersimpan otomatis di browser). **Tiap pelajaran = 1 buku** referensi SIBI yang **PDF-nya tampil inline** di kolom kanan pada halaman yang sama (berganti otomatis saat mapel diganti). `Kirim ke Guru` mengirim gabungan seluruh halaman.


### Peran & Akun (2 level admin)
- **Admin Platform** (`superadmin`) — mengelola **semua tenant**: buat/suspend/hapus sekolah, atur paket. Rute `/superadmin`.
- **Admin Sekolah** (`admin`) — mengelola **satu tenant** (guru, siswa, kelas, Dapodik sekolah itu). Login memilih tenant; rute `/admin`.
- **Guru / Siswa / Orang Tua** — terikat pada satu tenant (`tenantId`).

**Akun Admin Sekolah dibuat otomatis** saat tenant dibuat:
- Admin Platform mengisi form tenant (Nama, NPSN, Jenjang, Kota, Paket) + opsional **Nama Admin** & **Email Admin**.
- Sistem membuat baris `Tenant` **dan** akun `User` (role `admin`, `tenantId` terisi) dalam satu transaksi.
- **Kata sandi sementara** dibuat otomatis, di-hash **scrypt**, dan ditampilkan **sekali** di UI (email + password) untuk dibagikan ke admin sekolah.
- Admin Sekolah login dengan **email + kata sandi** (tidak bisa login hanya dengan memilih peran). Bila email admin tidak diisi, default `admin@<NPSN>.sisakti.id`.

> Rute: Admin Platform `/superadmin`, Admin Sekolah `/admin`. Di produksi tambahkan fitur **ganti kata sandi** & **reset via email**.

## 🗄️ Database (Prisma)

SiSAKTI memakai **Prisma ORM** dengan **SQLite** untuk pengembangan (langsung jalan) dan **PostgreSQL** untuk produksi.
Skema dirancang **multi-tenant** (semua tabel data memiliki `tenantId`).

```
web/prisma/schema.prisma   # skema (10 tabel)
web/src/lib/prisma.ts      # singleton PrismaClient
web/src/lib/tenants.ts     # CRUD tenant + koneksi Dapodik (DB)
web/src/lib/ingest.ts      # simpan hasil sinkronisasi Dapodik ke tabel master
```

**Tabel:** `Tenant`, `TenantDapodik`, `User`, `School`, `Teacher`, `Student`, `Rombel`, `Board`, `GradeRow`, `Attendance`.

### Setup (dev, SQLite)
```bash
cd web
npm install            # postinstall: prisma generate
npx prisma db push     # buat database dev.db + tabel
npm run dev
```
Perintah lain: `npm run db:studio` (GUI), `npm run db:reset` (reset), `npm run db:generate`.

### Pindah ke PostgreSQL (produksi)
1. Ubah `prisma/schema.prisma` → `provider = "postgresql"`.
2. Set `DATABASE_URL="postgresql://user:pass@host:5432/sisakti?schema=public"`.
3. `npx prisma migrate dev --name init` (dev) atau `npx prisma migrate deploy` (produksi).

### Alur data (production)
- **Admin Platform** membuat **Tenant** → tersimpan di tabel `Tenant`.
- Konfigurasi **Dapodik per-tenant** disimpan di `TenantDapodik` (token **terenkripsi** di produksi; API hanya mengembalikan `hasToken`).
- **Sinkronkan** → tarik dari Web Service Dapodik → `ingest.ts` menulis `School/Teacher/Student/Rombel` (idempoten, per `tenantId`).
- Data aplikasi (`Board`, `GradeRow`, `Attendance`) menyimpan `tenantId` → isolasi per sekolah.

> Isolasi tenant: setiap query difilter `tenantId`; untuk jaminan berlapis di Postgres pertimbangkan **Row-Level Security (RLS)**.
> Token Dapodik wajib **dienkripsi at-rest** (KMS/secret manager) sebelum go-live.


## 🎨 Design Tokens

| Token | Nilai |
|-------|-------|
| Primary | `#1E88E5` |
| Primary Dark | `#0D47A1` |
| Accent | `#FF9800` / `#FFB300` |
| Background | `#F5F7FA` (dark mode `#121212` siap) |
| Display font | Poppins |
| Body font | Inter |

Token didefinisikan di `web/src/app/globals.css` (`@theme`) dan dipakai via utility Tailwind (`bg-primary`, `text-ink`, dst).

---


## 🏫 Integrasi Dapodik (SaaS Multi-Tenant)

SiSAKTI adalah **SaaS multi-tenant**: satu platform melayani banyak sekolah (tenant). **Admin = admin platform** yang
mengatur tenant; **konfigurasi Dapodik disimpan per-tenant di database** (bukan lewat environment variable).

**Model akses Dapodik.** Dapodik berjalan di server **lokal tiap sekolah** (Web Service JSON, default port 5774).
Data per-siswa ada di instalasi lokal sekolah, bukan API pusat. Integrasi via **konektor/agent di sekolah**:

```
[Dapodik lokal sekolah] ──(LAN + token)──► [Agent SiSAKTI di sekolah] ──(HTTPS)──► [SiSAKTI pusat (per-tenant)]
   getSekolah/getPengguna/getPesertaDidik/             normalisasi                              simpan DB tenant
   getRombonganBelajar
```

### Alur produk
1. **Admin platform** membuat **Tenant** (sekolah): nama, NPSN, jenjang, kota, paket langganan → menu **Tenant & Sekolah** (`/admin`).
2. Admin membuka **Integrasi Dapodik** untuk tenant tsb (`/admin/dapodik?tenantId=…`): mengisi **Base URL Web Service**,
   **NPSN**, **Token** (milik sekolah), **timeout** → **disimpan per-tenant** di server (token tidak pernah dikirim ke browser).
3. Klik **Sinkronkan** → menarik sekolah/guru/siswa/rombel langsung dari Web Service Dapodik sekolah → disimpan ke DB tenant.
4. Tenant diaktifkan → guru/siswa/orang tua memakai SiSAKTI sesuai datanya.

### Sudah tersedia di repo
- **Model tenant** `web/src/lib/tenants.ts` (CRUD, koneksi Dapodik per tenant, `publicTenant()` menyembunyikan token, `tenantStats()`).
- **Klien Dapodik** `web/src/lib/dapodik.ts` — `DapodikClient` + normalizer (toleran variasi field antar versi) + `runDapodikSync(conn)` per-tenant. Tanpa data contoh.
- **API**:
  - `GET/POST /api/tenants`, `GET/PATCH/DELETE /api/tenants/:id` (kelola tenant & koneksi Dapodik)
  - `GET /api/dapodik/status?tenantId=`, `POST /api/dapodik/sync?tenantId=`
- **UI**: `Admin › Tenant & Sekolah` (`/admin`) dan `Admin › Integrasi Dapodik` (`/admin/dapodik?tenantId=…`).

### Web Service Dapodik — cara akses yang TERVERIFIKASI

Diuji langsung ke Dapodikdasmen (Apache/PHP, port 5774):

```
GET http://<host>:5774/WebService/<action>?npsn=<NPSN>&limit=5000
Authorization: Bearer <TOKEN>
```

- **Token** dari Dapodik: *Pengaturan → Web Service*. Dikirim sebagai **`Authorization: Bearer`** (bukan `?token=`).
- **`npsn` wajib** — tanpa itu: `403 {"message":"Parameter NPSN harap diisi"}`.
- Tanpa Bearer/token → `Access denied - You are not authorized…`.
- `limit` besar → Dapodik mengembalikan **semua baris** sekaligus.
- **Panggil berurutan** (jangan paralel) — Dapodik memproses satu request sekaligus.

| Action | Isi | Field penting |
|--------|-----|---------------|
| `getSekolah` | profil sekolah (`rows` = objek tunggal) | `nama`, `npsn`, `bentuk_pendidikan_id_str`, `alamat_jalan`, `kecamatan`, `kabupaten_kota`, `provinsi` |
| `getPengguna` | semua pengguna → saring **PTK/Kepala Sekolah** untuk guru | `nama`, `ptk_id`, `peran_id_str`, `nuptk`, `nip` |
| `getPesertaDidik` | peserta didik | `peserta_didik_id`, `nama`, `nisn`, `nipd`, `jenis_kelamin`, `nama_rombel`, `tingkat_pendidikan_id`, `tanggal_lahir` |
| `getRombonganBelajar` | rombel | `rombongan_belajar_id`, `nama`, `tingkat_pendidikan_id_str`, `ptk_id_str` (wali), `anggota_rombel[]` |

> `getGuru`/`getPTK`/`getRombel` **tidak ada** (404) → pakai `getPengguna` & `getRombonganBelajar`.
> Normalizer + `KONFIG_ENDPOINTS` (`src/lib/dapodik.ts`) memetakan field, dedupe `extId`, dan `ingest.ts` menyimpan idempoten per tenant.

**Contoh hasil uji nyata (SDN Dawuan Tengah VI, NPSN 20236167):** 1 sekolah, **17 guru (PTK)**, **356 siswa**, **12 rombel** — tersimpan ke database.

### Catatan produksi
- **Penyimpanan**: sudah memakai **Prisma** (`web/prisma/schema.prisma`) — dev SQLite, produksi PostgreSQL. Tabel `Tenant`,
  `TenantDapodik`, `School`, `Teacher`, `Student`, `Rombel`, `Board`, `GradeRow`, `Attendance` — semua ber-`tenantId` (isolasi per sekolah).
- **Keamanan token**: **enkripsi at-rest** token Dapodik (KMS/secret manager), jangan pernah di-log/dikirim ke klien.
- **Isolasi tenant**: setiap query difilter `tenant_id`; pertimbangkan Postgres RLS untuk jaminan berlapis.
- **Kepatuhan UU PDP 27/2022**: izin sekolah/dinas, minimalisasi data, audit log, retensi, HTTPS.
- **Agent konektor** di sekolah (Node/Python) untuk menjangkau Dapodik di LAN, plus endpoint ingestion bertanda tangan (`/api/dapodik/ingest`) + upsert idempoten by NISN/NUPTK.

## 🔭 Roadmap produksi

- **Realtime**: ganti polling dengan **Socket.io/WebSocket** (kelas live, chat, hand-raise, polling) + **WebRTC/Agora** untuk video.
- **Papan**: kanvas stroke asli (Excalidraw/tldraw) + engine OCR/handwriting sungguhan; simpan stroke & hasil rekognisi.
- **SIBI Reader**: integrasikan **PDF.js** untuk render buku + pencarian teks, bookmark, anotasi.
- **Ekstraksi PDF**: worker Python (**PyMuPDF/FastAPI**) untuk mengekstrak bab/sub-bab/glosarium → draf kuis.
- **Database**: PostgreSQL + Prisma (relasional) & Redis/Mongo (realtime/chat).
- **Auth**: Auth.js/NextAuth dengan peran & kontrol akses per rute (middleware).
- **Dapodik**: bangun agent konektor di sekolah + endpoint ingestion bertanda tangan & pemetaan akun berbasis NISN/NUPTK (lihat bagian Integrasi Dapodik).

---

© 2025 SiSAKTI — Terintegrasi SIBI Kemendikbudristek.
