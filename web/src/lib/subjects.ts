import type { Subject } from "./types";

// Per-subject paper + adaptive toolbar (data-driven, mirrors the FigCraft design)
export const SUBJECTS: Record<string, Subject> = {
  math: {
    key: "math",
    name: "Matematika",
    color: "#1e88e5",
    paper: "grid",
    paperLabel: "Kertas Kotak (Kuadran)",
    tools: [
      { id: "penLine", label: "Pena" },
      { id: "move", label: "Penggaris" },
      { id: "compass", label: "Jangka" },
      { id: "maximize", label: "Busur" },
      { id: "plus", label: "Hitung" },
      { id: "type", label: "Simbol" },
      { id: "eraser", label: "Hapus" },
      { id: "undo", label: "Urungkan" },
    ],
  },
  bindo: {
    key: "bindo",
    name: "Bahasa Indonesia",
    color: "#ff9800",
    paper: "lines",
    paperLabel: "Kertas Bergaris",
    tools: [
      { id: "penLine", label: "Pena" },
      { id: "highlighter", label: "Stabilo" },
      { id: "checkCircle", label: "Cek Ejaan" },
      { id: "book", label: "Kamus" },
      { id: "search", label: "Cari Kata" },
      { id: "eraser", label: "Hapus" },
      { id: "undo", label: "Urungkan" },
    ],
  },
  ipa: {
    key: "ipa",
    name: "IPA Terpadu",
    color: "#14b8a6",
    paper: "dotted",
    paperLabel: "Kertas Titik / Polos",
    tools: [
      { id: "penLine", label: "Pena" },
      { id: "component", label: "Bentuk" },
      { id: "grid", label: "Tabel" },
      { id: "type", label: "Label" },
      { id: "camera", label: "Kamera" },
      { id: "eraser", label: "Hapus" },
      { id: "undo", label: "Urungkan" },
    ],
  },
  bing: {
    key: "bing",
    name: "Bahasa Inggris",
    color: "#22c55e",
    paper: "lines",
    paperLabel: "Kertas Bergaris",
    tools: [
      { id: "penLine", label: "Pen" },
      { id: "highlighter", label: "Highlight" },
      { id: "checkCircle", label: "Spell Check" },
      { id: "book", label: "Dictionary" },
      { id: "mic", label: "Speak" },
      { id: "eraser", label: "Erase" },
      { id: "undo", label: "Undo" },
    ],
  },
  seni: {
    key: "seni",
    name: "Seni Budaya",
    color: "#8b5cf6",
    paper: "plain",
    paperLabel: "Kertas Polos / Sketsa",
    tools: [
      { id: "pencil", label: "Pensil" },
      { id: "palette", label: "Palet" },
      { id: "highlighter", label: "Warna" },
      { id: "star", label: "Stiker" },
      { id: "layers", label: "Lapisan" },
      { id: "eraser", label: "Hapus" },
      { id: "undo", label: "Urungkan" },
    ],
  },
};

export const SUBJECT_LIST = Object.values(SUBJECTS);

export const PAPER_LABELS: Record<string, string> = {
  grid: "Kotak",
  graph: "Grafik",
  lines: "Bergaris",
  dotted: "Titik",
  plain: "Polos",
  music: "Paranada",
};

export const PAPER_OPTIONS = ["grid", "lines", "dotted", "plain", "music"] as const;

export function paperClass(kind: string): string {
  const map: Record<string, string> = {
    grid: "paper-grid",
    graph: "paper-graph",
    lines: "paper-lines",
    dotted: "paper-dotted",
    plain: "paper-plain",
    music: "paper-music",
  };
  return map[kind] ?? "paper-grid";
}
