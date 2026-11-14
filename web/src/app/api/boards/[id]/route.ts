import { NextResponse } from "next/server";
import { getBoard } from "@/lib/store";

// GET /api/boards/:id
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const board = getBoard(id);
  if (!board) return NextResponse.json({ error: "Papan tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ board });
}
