import { NextResponse } from "next/server";
import { books } from "@/lib/seed";

// GET /api/books?subject=&q=
export async function GET(req: Request) {
  const url = new URL(req.url);
  const subject = url.searchParams.get("subject");
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  let list = books;
  if (subject && subject !== "Semua") list = list.filter((b) => b.subject === subject);
  if (q) list = list.filter((b) => b.title.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q));
  return NextResponse.json({ books: list });
}
