// Client-safe per-letter recognition simulator.
export interface RecognizedLetter {
  ch: string;
  conf: number;
  ok: boolean;
}

export function recognize(text: string, seed = 1): RecognizedLetter[] {
  return Array.from(text).map((ch, i) => {
    const conf = ch === " " ? 100 : 86 + ((i * 7 + seed * 13) % 14);
    return { ch, conf, ok: conf >= 90 };
  });
}

export function averageConfidence(letters: RecognizedLetter[]): number {
  const real = letters.filter((l) => l.ch.trim() !== "");
  if (!real.length) return 0;
  return Math.round(real.reduce((a, l) => a + l.conf, 0) / real.length);
}
