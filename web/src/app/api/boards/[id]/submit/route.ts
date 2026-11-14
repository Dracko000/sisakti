import { NextResponse } from "next/server";
import { submitBoard } from "@/lib/store";

// POST /api/boards/:id/submit  { text, strokes, seed }
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const board = submitBoard(id, {
    text: body?.text ?? "",
    strokes: body?.strokes ?? 0,
    seed: body?.seed ?? 1,
  });
  if (!board) return NextResponse.json({ error: "Papan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ board });
}
