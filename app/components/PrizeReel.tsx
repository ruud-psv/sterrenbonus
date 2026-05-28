'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Prize } from '@/app/types';

const ITEM_H = 96;
const SPIN_REVOLUTIONS = 7;

interface Props {
  prizes: Prize[];
  winner: Prize | null;
  spinning: boolean;
  onDone: () => void;
}

export default function PrizeReel({ prizes, winner, spinning, onDone }: Props) {
  const ctrl = useAnimation();
  const n = prizes.length;

  const faceAngle = n > 0 ? 360 / n : 0;
  // Radius so adjacent faces are separated by ~ITEM_H on the cylinder surface
  const radius = n > 0 ? Math.round((ITEM_H * n) / (2 * Math.PI)) : 0;
  const windowH = ITEM_H * 3;

  useEffect(() => {
    if (!spinning || !winner || n === 0) return;
    const winnerIdx = prizes.findIndex(p => p.id === winner.id);
    const finalAngle = SPIN_REVOLUTIONS * 360 + winnerIdx * faceAngle;
    ctrl.set({ rotateX: 0 });
    ctrl.start({
      rotateX: finalAngle,
      transition: { duration: 10, ease: [0.05, 0.95, 0.08, 1.0] },
    }).then(onDone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, winner]);

  if (n === 0) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: 540,
        height: windowH,
        borderRadius: 16,
        border: '2px solid rgba(200, 16, 46, 0.7)',
        boxShadow: [
          '0 0 0 1px rgba(200, 16, 46, 0.2)',
          '0 0 40px rgba(200, 16, 46, 0.4)',
          '0 0 80px rgba(200, 16, 46, 0.15)',
          'inset 0 0 40px rgba(200, 16, 46, 0.06)',
        ].join(', '),
        overflow: 'hidden',
        background: 'rgba(8, 8, 20, 0.85)',
      }}
    >
      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H, background: 'linear-gradient(to bottom, rgba(8,8,20,1) 0%, rgba(8,8,20,0.5) 60%, transparent 100%)' }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H, background: 'linear-gradient(to top, rgba(8,8,20,1) 0%, rgba(8,8,20,0.5) 60%, transparent 100%)' }}
      />

      {/* Center selection window */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none"
        style={{
          top: ITEM_H,
          height: ITEM_H,
          borderTop: '1px solid rgba(200, 16, 46, 0.55)',
          borderBottom: '1px solid rgba(200, 16, 46, 0.55)',
          background: 'rgba(200, 16, 46, 0.05)',
        }}
      />

      {/* 3D perspective wrapper */}
      <div
        style={{
          width: '100%',
          height: '100%',
          perspective: '700px',
          perspectiveOrigin: '50% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Rotating drum — Framer Motion drives rotateX */}
        <motion.div
          animate={ctrl}
          initial={{ rotateX: 0 }}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '100%',
            height: ITEM_H,
          }}
        >
          {prizes.map((prize, i) => (
            <div
              key={prize.id}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Place each face at its angle on the cylinder
                transform: `rotateX(${-i * faceAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#ffffff',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  padding: '0 2rem',
                  textShadow: '0 0 20px rgba(255,255,255,0.3)',
                }}
              >
                {prize.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
