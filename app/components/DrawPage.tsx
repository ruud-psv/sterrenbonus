'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import StarCanvas from '@/app/components/StarCanvas';
import PrizeReel from '@/app/components/PrizeReel';
import DrawButton from '@/app/components/DrawButton';
import Confetti from '@/app/components/Confetti';
import type { Prize } from '@/app/types';
import type { Theme } from '@/lib/themes';
import { hexToRgb } from '@/lib/themes';

type Phase = 'idle' | 'spinning' | 'done';

interface DrawPageProps {
  theme: Theme;
}

export default function DrawPage({ theme }: DrawPageProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<Prize | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { r, g, b } = hexToRgb(theme.colors.primary);

  useEffect(() => {
    fetch(`/api/prizes?theme=${theme.id}`)
      .then(res => res.json())
      .then((data: Prize[]) => setPrizes(data))
      .catch(() => setError('Kon prijzen niet laden'));
    return () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current); };
  }, [theme.id]);

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
  const confettiColors = [theme.colors.primary, '#ffffff', theme.colors.gold, '#ffffff', theme.colors.primary, '#ffffff'];
  const primary = theme.colors.primary;
  const bw = theme.borderWidth;

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none"
      style={{
        background: theme.colors.bg,
        fontFamily: 'var(--font-psv)',
        // CSS variables for the glowPulse animation
        ['--theme-r' as string]: r,
        ['--theme-g' as string]: g,
        ['--theme-b' as string]: b,
      }}
    >
      {/* Colored border frame */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: bw, background: primary, pointerEvents: 'none', zIndex: 99999 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: bw, background: primary, pointerEvents: 'none', zIndex: 99999 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: bw, background: primary, pointerEvents: 'none', zIndex: 99999 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: bw, background: primary, pointerEvents: 'none', zIndex: 99999 }} />

      {/* Background image */}
      {theme.backgroundImage && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: theme.backgroundPosition,
            zIndex: 0,
          }}
        />
      )}


      {theme.showStars && (
        <StarCanvas
          phase={canvasPhase}
          colors={{ primary: theme.colors.primary, gold: theme.colors.gold }}
        />
      )}

      <Confetti fire={phase === 'done'} colors={confettiColors} />

      {/* Subtle radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${primary}12 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Stronger glow on win */}
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
              background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${primary}38 0%, transparent 70%)`,
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center">
        {theme.showTitle ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              background: primary,
              padding: '1rem 2rem 1.2rem',
              borderRadius: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.logo}
              alt={theme.label}
              width={theme.logoSize}
              height={theme.logoSize}
              style={{ flexShrink: 0, objectFit: 'contain' }}
            />
            <div
              style={{
                fontSize: 'clamp(1.3rem, 3.25vw, 2.6rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 0.9,
                letterSpacing: '0.01em',
                color: '#ffffff',
                fontFamily: 'PSVBranding, var(--font-psv)',
                textTransform: 'uppercase',
              }}
            >
              {theme.appTitle}
            </div>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', background: primary, padding: '1rem 2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.logo}
              alt={theme.label}
              style={{ height: 200, width: 'auto', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {error && (
          <div
            className="px-6 py-3 rounded text-sm font-bold"
            style={{
              background: `${primary}26`,
              border: `1px solid ${primary}80`,
              color: '#ff6b6b',
            }}
          >
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="draw-area"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.35 }}
            >
              <DrawButton
                onClick={handleDraw}
                disabled={activePrizes.length === 0}
                primaryColor={theme.colors.primary}
                primaryDark={theme.colors.primaryDark}
              />
            </motion.div>
          )}

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
                primaryColor={theme.colors.primary}
                bgCard={`${theme.colors.bgCard}d9`}
              />

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

      {/* Prize ticker */}
      <AnimatePresence>
        {phase === 'idle' && activePrizes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100000, background: primary }}
          >
            <div className="overflow-hidden" style={{ padding: '0.65rem 0' }}>
              <div
                className="ticker-track"
                style={{ animationDuration: `${Math.max(40, activePrizes.length * 6)}s` }}
              >
                {[...activePrizes, ...activePrizes, ...activePrizes, ...activePrizes].map((prize, i) => (
                  <span key={i} className="ticker-item" style={{ color: '#ffffff' }}>
                    {theme.showStars ? '★' : '◆'}&nbsp;&nbsp;{prize.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button */}
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
              background: `${primary}26`,
              border: `1.5px solid ${primary}80`,
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

      {/* Admin link */}
      <div className="fixed bottom-5 right-6 z-20">
        <Link
          href={`/admin?theme=${theme.id}`}
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
