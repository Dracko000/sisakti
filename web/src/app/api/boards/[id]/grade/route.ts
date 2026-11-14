import { NextResponse } from "next/server";
import { gradeBoard } from "@/lib/store";

// POST /api/boards/:id/grade  { score, grade, rubric, feedback, gradedBy }
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  if (typeof b?.score !== "number") {
    return NextResponse.json({ error: "score wajib berupa angka" }, { status: 400 });
  }
  const board = gradeBoard(id, {
    score: b.score,
    grade: b.grade ?? "B",
    rubric: b.rubric ?? [],
    feedback: b.feedback ?? "",
    gradedBy: b.gradedBy ?? "Guru",
    gradedAt: "baru saja",
  });
  if (!board) return NextResponse.json({ error: "Papan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ board });
}
