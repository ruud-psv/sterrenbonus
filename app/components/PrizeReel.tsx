'use client';

import { useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Prize } from '@/app/types';

const ITEM_H = 88;
const VISIBLE = 5;
const CENTER = Math.floor(VISIBLE / 2); // 2
const REEL_H = ITEM_H * VISIBLE;       // 440
const REPS = 15;

interface Props {
  prizes: Prize[];
  winner: Prize | null;
  spinning: boolean;
  onDone: () => void;
}

export default function PrizeReel({ prizes, winner, spinning, onDone }: Props) {
  const ctrl = useAnimation();

  const items = useMemo(
    () => Array.from({ length: REPS }, () => prizes).flat(),
    [prizes]
  );

  useEffect(() => {
    if (!spinning || !winner || prizes.length === 0) return;

    const winnerPos = prizes.findIndex(p => p.id === winner.id);
    const targetRep = REPS - 4;
    const targetIdx = targetRep * prizes.length + winnerPos;
    // Shift so the winner lands in the center slot
    const targetY = -(targetIdx * ITEM_H) + CENTER * ITEM_H;

    ctrl.set({ y: 0 });
    ctrl.start({
      y: targetY,
      transition: {
        duration: 5,
        ease: [0.05, 0.95, 0.08, 1.0],
      },
    }).then(onDone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, winner]);

  return (
    <div
      className="relative mx-auto"
      style={{ height: REEL_H, width: 520, overflow: 'hidden' }}
    >
      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0A0A1A 20%, transparent)' }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0A0A1A 20%, transparent)' }}
      />

      {/* Center selection window */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none"
        style={{
          top: CENTER * ITEM_H,
          height: ITEM_H,
          borderTop: '2px solid rgba(200, 16, 46, 0.7)',
          borderBottom: '2px solid rgba(200, 16, 46, 0.7)',
          background: 'rgba(200, 16, 46, 0.06)',
          boxShadow: '0 0 40px rgba(200, 16, 46, 0.2) inset',
        }}
      />

      <motion.div animate={ctrl} initial={{ y: 0 }}>
        {items.map((prize, i) => (
          <div
            key={i}
            className="flex items-center justify-center px-8"
            style={{ height: ITEM_H }}
          >
            <span className="text-2xl font-bold tracking-wide text-center text-white leading-snug">
              {prize.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
