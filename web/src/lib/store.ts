// In-memory store (production: ganti dengan PostgreSQL/Prisma).
// TIDAK berisi data contoh — kosong sampai diisi dari sumber nyata (Dapodik/DB/impor).
import type { Board, BoardGrade, GradeRow } from "./types";
import { recognize as recognizeImpl } from "./ocr";

type Store = {
  boards: Board[];
  grades: GradeRow[];
};

// Reuse across HMR reloads
const g = globalThis as unknown as { __sisaktiStore?: Store };
if (!g.__sisaktiStore) {
  g.__sisaktiStore = { boards: [], grades: [] };
}
export const store = g.__sisaktiStore;

// ----------------------------------------------------------- recognition
export const recognize = recognizeImpl;

function average(nums: number[]) {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

// ----------------------------------------------------------- boards
/** Ambil papan milik siswa untuk mapel tertentu; buat halaman baru bila belum ada. */
export function getOrCreateBoard(studentId: string, subjectKey: string, init: { studentName: string; initials: string; color: string; paper?: string }) {
  let b = store.boards.find((x) => x.studentId === studentId && x.subjectKey === subjectKey);
  if (!b) {
    b = {
      id: "bd-" + studentId + "-" + subjectKey,
      studentId,
      studentName: init.studentName,
      initials: init.initials,
      color: init.color,
      subjectKey,
      paper: (init.paper as Board["paper"]) ?? "grid",
      status: "empty",
      strokes: 0,
      recognizedText: "",
      letters: [],
    };
    store.boards.push(b);
  }
  return b;
}

/** Minta Mapel -> satu papan per mapel untuk satu siswa. */
export function createBoardsForStudent(studentId: string, init: { studentName: string; initials: string; color: string }, subjects: string[]) {
  return subjects.map((sk) => getOrCreateBoard(studentId, sk, init));
}

export function listBoards() {
  return store.boards;
}

export function getBoard(id: string) {
  return store.boards.find((b) => b.id === id);
}

export function submitBoard(id: string, payload: { text: string; strokes: number; seed?: number }) {
  const b = store.boards.find((x) => x.id === id);
  if (!b) return null;
  b.recognizedText = payload.text;
  b.letters = recognize(payload.text, payload.seed ?? 1);
  b.strokes = payload.strokes;
  b.status = "submitted";
  b.submittedAt = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return b;
}

export function gradeBoard(id: string, grade: BoardGrade) {
  const b = store.boards.find((x) => x.id === id);
  if (!b) return null;
  b.grade = grade;
  b.status = "graded";
  // reflect into gradebook board column
  const row = store.grades.find((g) => g.studentId === b.studentId);
  if (row) row.board = grade.score;
  return b;
}

export function autoGrade(id: string, score: number) {
  const b = store.boards.find((x) => x.id === id);
  if (!b) return null;
  const grade = score >= 90 ? "A" : score >= 80 ? "B+" : score >= 70 ? "B" : "C";
  return gradeBoard(id, {
    score,
    grade,
    rubric: [
      { label: "Akurasi", value: Math.min(100, score + 4) },
      { label: "Proses", value: Math.max(50, score - 2) },
      { label: "Penulisan", value: Math.max(50, score - 4) },
    ],
    feedback: "Dinilai otomatis oleh sistem. Guru dapat menyesuaikan.",
    gradedBy: "Sistem Otomatis",
    gradedAt: "baru saja",
  });
}

// ----------------------------------------------------------- stats
export function boardStats() {
  const graded = store.boards.filter((b) => b.status === "graded");
  const submitted = store.boards.filter((b) => b.status === "submitted");
  const avg = graded.length ? average(graded.map((b) => b.grade!.score)) : 0;
  return {
    total: store.boards.length,
    graded: graded.length,
    pending: submitted.length,
    avg,
  };
}

// ----------------------------------------------------------- gradebook
export function getGradeRows() {
  return store.grades;
}

function mean(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function gradeSummary() {
  const rows = store.grades;
  if (!rows.length) {
    return { collected: "0 / 0", average: "—", tuntas: "0 dari 0", ungraded: boardStats().pending };
  }
  const overall = mean(rows.flatMap((r) => [r.t1, r.t2, r.quiz, r.uts]));
  const tuntas = rows.filter((r) => average([r.t1, r.t2, r.quiz, r.uts]) >= 75).length;
  return {
    collected: `${rows.length} siswa`,
    average: overall.toFixed(1).replace(".", ","),
    tuntas: `${tuntas} dari ${rows.length}`,
    ungraded: boardStats().pending,
  };
}

// ----------------------------------------------------------- generic board (tanpa data siswa contoh)
export function getOrCreateGenericBoard(subjectKey: string): Board {
  return getOrCreateBoard("role-student", subjectKey, {
    studentName: "Saya",
    initials: "SW",
    color: "#1e88e5",
    paper: "grid",
  });
}
