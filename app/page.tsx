'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import StarCanvas, { type DrawPhase } from '@/app/components/StarCanvas';
import PrizeCard from '@/app/components/PrizeCard';
import DrawButton from '@/app/components/DrawButton';
import type { Prize } from '@/app/types';

export default function DrawPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [phase, setPhase] = useState<DrawPhase>('idle');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    fetch('/api/prizes')
      .then((r) => r.json())
      .then((data: Prize[]) => setPrizes(data))
      .catch(() => setError('Kon prijzen niet laden'));

    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const activePrizes = prizes.filter((p) => p.active);

  const handleDraw = useCallback(() => {
    if (phase !== 'idle' || activePrizes.length === 0) return;

    clearAllTimeouts();
    setShowCard(false);
    setShowReset(false);
    setSelectedPrize(null);

    // Pick a winner immediately but don't show it yet
    const winner = activePrizes[Math.floor(Math.random() * activePrizes.length)];

    // Phase 1: Build-up (1.5s)
    setPhase('buildup');

    // Phase 2: Vortex (1s after buildup)
    addTimeout(() => {
      setPhase('vortex');
    }, 1500);

    // Phase 3: Reveal (1s after vortex)
    addTimeout(() => {
      setPhase('reveal');
      setSelectedPrize(winner);
      // Slight delay before card appears to sync with explosion
      addTimeout(() => {
        setShowCard(true);
      }, 200);
    }, 2500);

    // Show reset button 5 seconds after reveal
    addTimeout(() => {
      setShowReset(true);
    }, 7500);
  }, [phase, activePrizes, clearAllTimeouts, addTimeout]);

  const handleReset = useCallback(() => {
    clearAllTimeouts();
    setPhase('idle');
    setShowCard(false);
    setShowReset(false);
    // Keep prize visible briefly during fade
    addTimeout(() => setSelectedPrize(null), 500);
  }, [clearAllTimeouts, addTimeout]);

  const isDimmed = phase === 'buildup' || phase === 'vortex';
  const isReveal = phase === 'reveal';

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ background: '#0A0A1A' }}
    >
      {/* Star canvas background */}
      <StarCanvas phase={phase} />

      {/* Dim overlay during build-up */}
      <AnimatePresence>
        {isDimmed && (
          <motion.div
            key="dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
            style={{ background: '#000', zIndex: 1 }}
          />
        )}
      </AnimatePresence>

      {/* Radial glow on reveal */}
      <AnimatePresence>
        {isReveal && (
          <motion.div
            key="radial-glow"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,16,46,0.18) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 w-full px-8">
        {/* Header */}
        <motion.div
          className="text-center"
          animate={
            isDimmed
              ? { opacity: 0.5, scale: 0.95 }
              : isReveal
              ? { opacity: 0.6, scale: 0.9 }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.5 }}
        >
          <h1
            className="font-black tracking-tight leading-none"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              background: 'linear-gradient(135deg, #ffffff 30%, #C8102E 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
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

        {/* Error state */}
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

        {/* Draw button — hidden when card is showing */}
        <AnimatePresence>
          {!showCard && (
            <motion.div
              key="draw-area"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <DrawButton
                phase={phase}
                onDraw={handleDraw}
                onReset={handleReset}
                showReset={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prize card */}
        <PrizeCard prize={selectedPrize} visible={showCard} />

        {/* Reset button appears after card */}
        <AnimatePresence>
          {showReset && (
            <motion.button
              key="reset-btn"
              onClick={handleReset}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative z-20 rounded-full font-semibold text-base tracking-wider uppercase px-10 py-4"
              style={{
                background: 'transparent',
                border: '2px solid rgba(200, 16, 46, 0.6)',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
              }}
            >
              Opnieuw
            </motion.button>
          )}
        </AnimatePresence>

        {/* Active prizes count */}
        <AnimatePresence>
          {phase === 'idle' && activePrizes.length > 0 && (
            <motion.p
              key="prize-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {activePrizes.length} prijs{activePrizes.length !== 1 ? 'en' : ''} beschikbaar
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Admin link */}
      <div className="fixed bottom-6 right-8 z-20">
        <Link
          href="/admin"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: 'rgba(255,255,255,0.15)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              'rgba(255,255,255,0.15)';
          }}
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
