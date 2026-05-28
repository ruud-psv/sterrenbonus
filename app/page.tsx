'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import StarCanvas from '@/app/components/StarCanvas';
import PrizeReel from '@/app/components/PrizeReel';
import DrawButton from '@/app/components/DrawButton';
import Confetti from '@/app/components/Confetti';
import type { Prize } from '@/app/types';

type Phase = 'idle' | 'spinning' | 'done';

export default function DrawPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<Prize | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/prizes')
      .then(r => r.json())
      .then((data: Prize[]) => setPrizes(data))
      .catch(() => setError('Kon prijzen niet laden'));
    return () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current); };
  }, []);

  const activePrizes = prizes.filter(p => p.active);

  const handleDraw = useCallback(() => {
    if (phase !== 'idle' || activePrizes.length === 0) return;
    const picked = activePrizes[Math.floor(Math.random() * activePrizes.length)];
    setWinner(picked);
    setShowReset(false);
    setPhase('spinning');
  }, [phase, activePrizes]);

  const handleReelDone = useCallback(() => {
    setPhase('done');
    resetTimerRef.current = setTimeout(() => setShowReset(true), 4000);
  }, []);

  const handleReset = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setPhase('idle');
    setWinner(null);
    setShowReset(false);
  }, []);

  const canvasPhase = phase === 'done' ? 'celebrate' : phase === 'spinning' ? 'spinning' : 'idle';

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: '#0D0D0D', fontFamily: 'var(--font-psv)' }}
    >
      <StarCanvas phase={canvasPhase} />
      <Confetti fire={phase === 'done'} />

      {/* Subtle red radial bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,16,46,0.07) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Done: stronger glow */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(200,16,46,0.22) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Header — fixed at top, never moves or fades ── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-10"
      >
        <div className="flex items-center gap-4">
          <Image
            src="/psv-logo-white.svg"
            alt="PSV"
            width={72}
            height={72}
            priority
            style={{ flexShrink: 0 }}
          />
          <div
            style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: 0.9,
              letterSpacing: '0.01em',
              color: '#ffffff',
              fontFamily: 'PSVBranding, var(--font-psv)',
              textTransform: 'uppercase',
            }}
          >
            Sterrenbonus
          </div>
        </div>
      </div>

      {/* ── Center content — always viewport-centered ── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {error && (
          <div
            className="px-6 py-3 rounded text-sm font-bold"
            style={{
              background: 'rgba(200,16,46,0.15)',
              border: '1px solid rgba(200,16,46,0.5)',
              color: '#ff6b6b',
            }}
          >
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* IDLE */}
          {phase === 'idle' && (
            <motion.div
              key="draw-area"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.35 }}
            >
              <DrawButton onClick={handleDraw} disabled={activePrizes.length === 0} />
            </motion.div>
          )}

          {/* SPINNING + DONE */}
          {(phase === 'spinning' || phase === 'done') && (
            <motion.div
              key="reel-area"
              initial={{ opacity: 0, scale: 0.78, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1.0] }}
              className="flex flex-col items-center gap-6"
            >
              <PrizeReel
                prizes={activePrizes}
                winner={winner}
                spinning={phase === 'spinning'}
                onDone={handleReelDone}
              />

              {/* Fixed-height spacer keeps reel position stable when text appears */}
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        fontStyle: 'italic',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        fontFamily: 'PSVBranding, var(--font-psv)',
                        textAlign: 'center',
                        margin: 0,
                      }}
                    >
                      Gefeliciteerd!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Prize ticker — bottom, idle only ── */}
      <AnimatePresence>
        {phase === 'idle' && activePrizes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-10 left-0 right-0 z-10 overflow-hidden"
          >
            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(200,16,46,0.4), transparent)',
                marginBottom: '0.75rem',
              }}
            />
            <div className="overflow-hidden">
              <div className="ticker-track">
                {[...activePrizes, ...activePrizes, ...activePrizes, ...activePrizes].map((prize, i) => (
                  <span key={i} className="ticker-item">
                    ★&nbsp;&nbsp;{prize.name}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(200,16,46,0.4), transparent)',
                marginTop: '0.75rem',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Opnieuw trekken — icon only, fixed bottom-left ── */}
      <AnimatePresence>
        {showReset && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            onClick={handleReset}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            title="Opnieuw trekken"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '1.5rem',
              zIndex: 20,
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(200,16,46,0.15)',
              border: '1.5px solid rgba(200,16,46,0.5)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Admin link — fixed bottom-right ── */}
      <div className="fixed bottom-5 right-6 z-20">
        <Link
          href="/admin"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.12)',
            textDecoration: 'none',
            fontFamily: 'var(--font-psv)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.12)'; }}
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
