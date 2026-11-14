import type {
  User, Book, GradeRow, AttendanceRow, ScheduleItem,
  ActivityLog, KPI, ClassRoom,
} from "./types";

/**
 * PRODUCTION MODE — tidak ada data contoh.
 * Semua entitas di bawah KOSONG dan WAJIB diisi dari sumber nyata:
 *  - Users / Classes   : sinkronisasi Dapodik atau impor
 *  - Books             : katalog SIBI (lihat src/lib/books-sd.ts / API katalog)
 *  - Grades/Attendance : aktivitas nyata setelah kelas berjalan
 */
export const users: User[] = [];
export const students = users.filter((u) => u.role === "student");

export function userById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

// role -> id pengguna (diisi dari DB pada implementasi produksi)
export const DEMO_USER: Record<string, string> = {};

export const classes: ClassRoom[] = [];
export const books: Book[] = [];
export const gradeRows: GradeRow[] = [];
export const attendance: AttendanceRow[] = [];
export const schedule: ScheduleItem[] = [];
export const activityLogs: ActivityLog[] = [];
export const kpis: KPI[] = [];
export const subjectMastery: { name: string; value: number; color: string }[] = [];
export const gradeDist: number[] = [];
export const gradeDistLabels: string[] = [];
export const trendPoints: number[] = [];
export const activityBars = { active: [] as number[], live: [] as number[], labels: [] as string[] };

export const COLORS: string[] = [];
