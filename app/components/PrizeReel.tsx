'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Prize } from '@/app/types';

const ITEM_H = 96;
const SPIN_REVOLUTIONS = 8;

interface Props {
  prizes: Prize[];
  winner: Prize | null;
  spinning: boolean;
  onDone: () => void;
  primaryColor?: string;
  bgCard?: string;
}

export default function PrizeReel({
  prizes,
  winner,
  spinning,
  onDone,
  primaryColor = '#C8102E',
  bgCard = 'rgba(8, 8, 20, 0.85)',
}: Props) {
  const ctrl = useAnimation();
  const n = prizes.length;

  const faceAngle = n > 0 ? 360 / n : 0;
  const radius = n > 0 ? Math.round((ITEM_H * n) / (2 * Math.PI)) : 0;
  const windowH = ITEM_H * 3;

  useEffect(() => {
    if (!spinning || !winner || n === 0) return;
    const winnerIdx = prizes.findIndex(p => p.id === winner.id);
    const finalAngle = SPIN_REVOLUTIONS * 360 + winnerIdx * faceAngle;

    const goesBackward = Math.random() < 0.6;
    const overshoot = faceAngle * (0.28 + Math.random() * 0.42);
    const preSnapAngle = goesBackward
      ? finalAngle + overshoot
      : finalAngle - overshoot;

    ctrl.set({ rotateX: 0 });

    ctrl.start({
      rotateX: preSnapAngle,
      transition: { duration: 10, ease: [0.12, 0.9, 0.25, 1.0] },
    }).then(() =>
      ctrl.start({
        rotateX: finalAngle,
        transition: {
          type: 'spring',
          stiffness: goesBackward ? 300 : 450,
          damping:   goesBackward ? 18  : 28,
          mass:      goesBackward ? 0.8 : 0.5,
        },
      })
    ).then(onDone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, winner]);

  if (n === 0) return null;

  // Parse primary color to rgba for consistent usage
  const p = primaryColor;

  return (
    <div
      style={{
        position: 'relative',
        width: 540,
        height: windowH,
        borderRadius: 4,
        border: `2px solid ${p}b3`,
        boxShadow: [
          `0 0 0 1px ${p}33`,
          `0 0 40px ${p}66`,
          `0 0 80px ${p}26`,
          `inset 0 0 40px ${p}0f`,
        ].join(', '),
        overflow: 'hidden',
        background: bgCard,
      }}
    >
      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H, background: `linear-gradient(to bottom, ${bgCard} 0%, ${bgCard.replace('0.85', '0.5')} 60%, transparent 100%)` }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H, background: `linear-gradient(to top, ${bgCard} 0%, ${bgCard.replace('0.85', '0.5')} 60%, transparent 100%)` }}
      />

      {/* Center selection window */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none"
        style={{
          top: ITEM_H,
          height: ITEM_H,
          borderTop: `1px solid ${p}8c`,
          borderBottom: `1px solid ${p}8c`,
          background: `${p}0d`,
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
                transform: `rotateX(${-i * faceAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  padding: '0 2rem',
                  fontFamily: 'PSVBranding, var(--font-psv)',
                  textShadow: '0 0 20px rgba(255,255,255,0.25)',
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
