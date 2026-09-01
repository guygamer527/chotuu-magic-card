import { useEffect, useState } from "react";

type Piece = {
  id: number;
  left: number;
  dx: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  round: boolean;
};

const COLORS = [
  "var(--rose)",
  "var(--blush)",
  "var(--lavender)",
  "var(--peach)",
  "var(--paper-deep)",
];

export function Confetti({ burstKey, count = 70 }: { burstKey: number; count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!burstKey) return;
    const next: Piece[] = Array.from({ length: count }, (_, i) => ({
      id: burstKey * 1000 + i,
      left: Math.random() * 100,
      dx: (Math.random() - 0.5) * 160,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 1.8,
      color: COLORS[i % COLORS.length] ?? "var(--rose)",
      size: 6 + Math.random() * 8,
      round: Math.random() > 0.6,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 4600);
    return () => clearTimeout(t);
  }, [burstKey, count]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
            ["--dx" as string]: `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
