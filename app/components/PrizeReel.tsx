'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Prize } from '@/app/types';

const ITEM_H = 96;
// Kortere, snellere spin → hogere doorloop bij 2 kiosks (FANdag).
const SPIN_REVOLUTIONS = 5;

// Reel sizing — the reel widens with the viewport and the prize text is scaled
// to a single, shared font size so the longest name fits on one line.
const PERSPECTIVE = 700;
const REEL_MAX_WIDTH = 1000;
const VIEWPORT_FRACTION = 0.92;
const TEXT_PADDING_X = 32; // matches the '0 2rem' horizontal padding on each item
const APPARENT_FONT_MAX = 40; // px, on-screen cap so short names don't blow up
const FIT_SAFETY = 0.9; // margin for letter-spacing and rounding

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

  // Responsive reel width + a single shared font size for every prize.
  const [layout, setLayout] = useState({ width: 540, fontSize: 30 });

  useEffect(() => {
    if (n === 0) return;

    const measure = () => {
      const width = Math.min(Math.round(window.innerWidth * VIEWPORT_FRACTION), REEL_MAX_WIDTH);
      // The centered front face is pushed `radius` px toward the viewer, which
      // enlarges it. Divide it out so the on-screen text stays within bounds.
      const perspScale = PERSPECTIVE / Math.max(80, PERSPECTIVE - radius);
      const availableOnScreen = (width - 2 * TEXT_PADDING_X) * FIT_SAFETY;

      // Default: cap at the maximum apparent size (used when names are short).
      let fontSize = APPARENT_FONT_MAX / perspScale;

      const ctx = document.createElement('canvas').getContext('2d');
      if (ctx) {
        const REF = 100;
        ctx.font = `italic 700 ${REF}px PSVBranding, sans-serif`;
        let maxW = 0;
        for (const p of prizes) {
          const w = ctx.measureText(p.name.toUpperCase()).width;
          if (w > maxW) maxW = w;
        }
        if (maxW > 0) {
          const fitFontSize = (availableOnScreen * REF) / (maxW * perspScale);
          fontSize = Math.min(fitFontSize, APPARENT_FONT_MAX / perspScale);
        }
      }

      setLayout({ width, fontSize });
    };

    measure();
    window.addEventListener('resize', measure);
    // Re-measure once the branding font has loaded for accurate widths.
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener('resize', measure);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prizes, n, radius]);

  useEffect(() => {
    if (!spinning || !winner || n === 0) return;
    const winnerIdx = Math.max(0, prizes.findIndex(p => p.id === winner.id));
    const finalAngle = SPIN_REVOLUTIONS * 360 + winnerIdx * faceAngle;

    const goesBackward = Math.random() < 0.6;
    const overshoot = faceAngle * (0.28 + Math.random() * 0.42);
    const preSnapAngle = goesBackward
      ? finalAngle + overshoot
      : finalAngle - overshoot;

    ctrl.set({ rotateX: 0 });

    ctrl.start({
      rotateX: preSnapAngle,
      transition: { duration: 5, ease: [0.12, 0.9, 0.25, 1.0] },
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
        width: layout.width,
        maxWidth: '92vw',
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
                  fontSize: `${layout.fontSize}px`,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  padding: '0 2rem',
                  whiteSpace: 'nowrap',
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
