'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import StarCanvas from '@/app/components/StarCanvas';
import PrizeReel from '@/app/components/PrizeReel';
import DrawButton from '@/app/components/DrawButton';
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
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ background: '#0A0A1A' }}
    >
      <StarCanvas phase={canvasPhase} />

      {/* Radial glow on done */}
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
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,16,46,0.18) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 w-full px-8">

        {/* Header */}
        <motion.div
          className="text-center"
          animate={phase === 'spinning' ? { opacity: 0.4, scale: 0.92 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="font-black tracking-tight leading-none"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              background: 'linear-gradient(135deg, #ffffff 30%, #C8102E 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(200,16,46,0.4))',
            }}
          >
            ⭐ STERRENBONUS
          </h1>
          <p
            className="mt-2 text-sm tracking-[0.3em] uppercase font-medium"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            PSV — Prijzentrekking
          </p>
        </motion.div>

        {error && (
          <div
            className="px-6 py-3 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(200,16,46,0.15)',
              border: '1px solid rgba(200,16,46,0.4)',
              color: '#ff6b6b',
            }}
          >
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* IDLE: draw button */}
          {phase === 'idle' && (
            <motion.div
              key="draw-area"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-3"
            >
              <DrawButton onClick={handleDraw} disabled={activePrizes.length === 0} />
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {activePrizes.length} prijs{activePrizes.length !== 1 ? 'en' : ''} beschikbaar
              </p>
            </motion.div>
          )}

          {/* SPINNING + DONE: reel */}
          {(phase === 'spinning' || phase === 'done') && (
            <motion.div
              key="reel-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              <PrizeReel
                prizes={activePrizes}
                winner={winner}
                spinning={phase === 'spinning'}
                onDone={handleReelDone}
              />

              <AnimatePresence>
                {phase === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-[#FFD700] text-lg font-bold tracking-widest uppercase mb-1">
                      🎉 Gefeliciteerd!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
                      De winnaar ontvangt:{' '}
                      <span className="text-white font-bold">{winner?.name}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showReset && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-full font-semibold text-base tracking-wider uppercase px-10 py-4"
                    style={{
                      background: 'transparent',
                      border: '2px solid rgba(200, 16, 46, 0.6)',
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                    }}
                  >
                    Opnieuw trekken
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prize ticker — only in idle */}
      <AnimatePresence>
        {phase === 'idle' && activePrizes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-10 left-0 right-0 z-10 overflow-hidden"
          >
            <p
              className="text-center text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Te winnen
            </p>
            <div className="overflow-hidden">
              <div className="ticker-track">
                {/* Triple the list for a seamless loop */}
                {[...activePrizes, ...activePrizes, ...activePrizes, ...activePrizes].map((prize, i) => (
                  <span key={i} className="ticker-item">
                    ⭐ {prize.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin link */}
      <div className="fixed bottom-6 right-8 z-20">
        <Link
          href="/admin"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: 'rgba(255,255,255,0.15)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.15)'; }}
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
