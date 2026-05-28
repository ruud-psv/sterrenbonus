'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Prize } from '@/app/types';

interface PrizeCardProps {
  prize: Prize | null;
  visible: boolean;
}

export default function PrizeCard({ prize, visible }: PrizeCardProps) {
  return (
    <AnimatePresence>
      {visible && prize && (
        <motion.div
          key="prize-card"
          initial={{ scale: 0, rotateY: -180, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            duration: 0.8,
            type: 'spring',
            stiffness: 120,
            damping: 14,
          }}
          style={{ perspective: 1200 }}
          className="relative z-20"
        >
          <div className="card-revealed relative w-[480px] max-w-[90vw] rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  'linear-gradient(135deg, #111128 0%, #1a0a18 50%, #0d0d22 100%)',
              }}
            />

            {/* Animated border glow */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  'linear-gradient(135deg, #C8102E, #FFD700, #C8102E)',
                padding: '2px',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            {/* Content */}
            <div className="relative px-10 py-12 flex flex-col items-center gap-6">
              {/* Stars top */}
              <div className="flex gap-3 text-3xl">
                {['⭐', '🌟', '⭐'].map((s, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>

              {/* Label */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-semibold uppercase tracking-[0.25em]"
                style={{ color: '#C8102E' }}
              >
                Gefeliciteerd!
              </motion.p>

              {/* Prize name */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
                className="prize-name-shimmer text-5xl font-black text-center leading-tight"
              >
                {prize.name}
              </motion.h2>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="w-3/4 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, #C8102E, #FFD700, #C8102E, transparent)',
                }}
              />

              {/* PSV branding */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-sm tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                ⭐ Sterrenbonus — PSV
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
