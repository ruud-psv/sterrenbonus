'use client';

import { motion } from 'framer-motion';
import type { DrawPhase } from './StarCanvas';

interface DrawButtonProps {
  phase: DrawPhase;
  onDraw: () => void;
  onReset: () => void;
  showReset: boolean;
}

export default function DrawButton({ phase, onDraw, onReset, showReset }: DrawButtonProps) {
  const isDrawing = phase === 'buildup' || phase === 'vortex';
  const isIdle = phase === 'idle';

  return (
    <div className="relative z-10 flex flex-col items-center gap-6">
      {/* TREKKEN button */}
      {(isIdle || isDrawing) && (
        <motion.button
          onClick={onDraw}
          disabled={isDrawing}
          whileHover={isIdle ? { scale: 1.06 } : {}}
          whileTap={isIdle ? { scale: 0.97 } : {}}
          animate={
            isDrawing
              ? {
                  scale: [1, 1.04, 0.98, 1.04, 1],
                  transition: { duration: 0.5, repeat: Infinity },
                }
              : {}
          }
          className="btn-draw relative overflow-hidden rounded-full font-black text-2xl tracking-[0.15em] uppercase text-white"
          style={{
            minWidth: 240,
            paddingTop: 22,
            paddingBottom: 22,
            paddingLeft: 56,
            paddingRight: 56,
            background: isDrawing
              ? 'linear-gradient(135deg, #a00020, #C8102E)'
              : 'linear-gradient(135deg, #C8102E, #e8102e)',
            cursor: isDrawing ? 'default' : 'pointer',
            transition: 'background 0.3s',
          }}
        >
          {/* Shine overlay */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
            }}
          />
          <span className="relative">
            {isDrawing ? (
              <span className="flex items-center gap-3">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block text-xl"
                >
                  ⭐
                </motion.span>
                Trekken...
              </span>
            ) : (
              'TREKKEN'
            )}
          </span>
        </motion.button>
      )}

      {/* Reset button */}
      {showReset && (
        <motion.button
          onClick={onReset}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full font-semibold text-base tracking-wider uppercase px-10 py-4"
          style={{
            background: 'transparent',
            border: '2px solid rgba(200, 16, 46, 0.6)',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#C8102E';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(200, 16, 46, 0.6)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'rgba(255,255,255,0.8)';
          }}
        >
          Opnieuw
        </motion.button>
      )}
    </div>
  );
}
