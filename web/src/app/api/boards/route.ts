import { NextResponse, connection } from "next/server";
import { boardStats, listBoards } from "@/lib/store";
import { recognize } from "@/lib/store";

// GET /api/boards?studentId=...  (returns all boards + stats)
export async function GET(req: Request) {
  await connection();
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const all = listBoards();
  const data = studentId ? all.filter((b) => b.studentId === studentId) : all;
  return NextResponse.json({ boards: data, stats: boardStats() });
}

// POST /api/boards  { action: "recognize", text } -> per-letter preview
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.action === "recognize") {
    return NextResponse.json({ letters: recognize(body.text ?? "", body.seed ?? 1) });
  }
  return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
}
