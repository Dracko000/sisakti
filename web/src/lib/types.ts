// Domain types for SiSAKTI

export type Role = "student" | "teacher" | "parent" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  avatarColor: string;
  detail: string; // e.g. "Kelas 8A" or "Guru Matematika"
  classId?: string;
  childIds?: string[]; // for parents
  tenantId?: string; // tenant (sekolah) untuk peran non-platform
}

export type PaperKind = "grid" | "graph" | "lines" | "dotted" | "plain" | "music";

export interface SubjectTool {
  id: string; // lucide icon name
  label: string;
}

export interface Subject {
  key: string;
  name: string;
  color: string; // hex
  paper: PaperKind;
  paperLabel: string;
  tools: SubjectTool[];
}

export interface Book {
  id: string;
  title: string;
  subject: string;
  grade: string;
  cover: string; // hex
  rating: number;
  reads: string;
  kind: string; // "Buku Siswa"
  pages: number | null;
  // SIBI enrichment (optional)
  sibiId?: string;
  gradeNum?: number;
  coverImage?: string;
  author?: string;
  isbn?: string;
  source?: string;
  pdfUrl?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  studentIds: string[];
  joinCode: string;
}

export type BoardStatus = "empty" | "writing" | "submitted" | "graded";

export interface Board {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  color: string;
  subjectKey: string;
  paper: PaperKind;
  status: BoardStatus;
  strokes: number; // number of stroke operations (simulated)
  recognizedText: string;
  letters: { ch: string; conf: number; ok: boolean }[];
  submittedAt?: string;
  grade?: BoardGrade;
}

export interface BoardGrade {
  score: number;
  grade: string;
  rubric: { label: string; value: number }[];
  feedback: string;
  gradedBy: string;
  gradedAt: string;
}

export interface GradeRow {
  studentId: string;
  name: string;
  initials: string;
  color: string;
  t1: number;
  t2: number;
  quiz: number;
  uts: number;
  board: number;
}

export interface AttendanceRow {
  studentId: string;
  name: string;
  initials: string;
  color: string;
  joinedAt: string;
  durationMin: number;
  status: "Hadir" | "Izin" | "Alpa" | "Sakit";
}

export interface ScheduleItem {
  time: string;
  subject: string;
  room: string;
  color: string;
  live: boolean;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "auth" | "sync" | "class" | "grade" | "board";
}

export interface KPI {
  label: string;
  value: string;
  sub: string;
  color: string;
  tint: string;
  icon: string;
}
