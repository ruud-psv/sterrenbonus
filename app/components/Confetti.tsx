'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  fire: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = ['#C8102E', '#ffffff', '#F5C400', '#ffffff', '#C8102E', '#ffffff'];

function shoot(originX: number, angle: number, delay: number, count: number, velocity: number, colors: string[]) {
  setTimeout(() => {
    confetti({
      particleCount: count,
      angle,
      spread: 62,
      origin: { x: originX, y: 1 },
      colors,
      startVelocity: velocity,
      gravity: 0.78,
      ticks: 280,
      scalar: 1.15,
      drift: originX === 0 ? 0.2 : -0.2,
    });
  }, delay);
}

export default function Confetti({ fire, colors = DEFAULT_COLORS }: Props) {
  useEffect(() => {
    if (!fire) return;

    shoot(0.02, 60,  0,   120, 65, colors);
    shoot(0.02, 55, 180,   70, 58, colors);
    shoot(0.02, 65, 360,   45, 50, colors);

    shoot(0.98, 120,  0,  120, 65, colors);
    shoot(0.98, 125, 180,  70, 58, colors);
    shoot(0.98, 115, 360,  45, 50, colors);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire]);

  return null;
}
