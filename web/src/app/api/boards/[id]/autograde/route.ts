import { NextResponse } from "next/server";
import { autoGrade } from "@/lib/store";

// POST /api/boards/:id/autograde  { score }
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const score = typeof body?.score === "number" ? body.score : 85;
  const board = autoGrade(id, score);
  if (!board) return NextResponse.json({ error: "Papan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ board });
}
