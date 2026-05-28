'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      style={{ background: '#0D0D0D', fontFamily: 'var(--font-psv)' }}
    >
      <StarCanvas phase={canvasPhase} />

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

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 w-full px-8">

        {/* Logo / header */}
        <motion.div
          className="text-center"
          animate={phase === 'spinning' ? { opacity: 0.35, scale: 0.92 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* PSV wordmark */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Image
              src="/psv-logo-white.svg"
              alt="PSV"
              width={72}
              height={72}
              priority
              style={{ flexShrink: 0 }}
            />
            <div className="text-left">
              <div
                style={{
                  fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
                  fontWeight: 900,
                  lineHeight: 0.9,
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  fontFamily: 'var(--font-psv)',
                  textTransform: 'uppercase',
                }}
              >
                Sterren
                <span style={{ color: 'var(--psv-red)' }}>bonus</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, var(--psv-red) 30%, var(--psv-red) 70%, transparent 100%)',
              marginBottom: '0.6rem',
            }}
          />
          <p
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-psv)',
            }}
          >
            Kwartaal prijzentrekking
          </p>
        </motion.div>

        {error && (
          <div
            className="px-6 py-3 rounded text-sm font-bold"
            style={{
              background: 'rgba(200,16,46,0.15)',
              border: '1px solid rgba(200,16,46,0.5)',
              color: '#ff6b6b',
              fontFamily: 'var(--font-psv)',
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
              className="flex flex-col items-center gap-4"
            >
              <DrawButton onClick={handleDraw} disabled={activePrizes.length === 0} />
              <p
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'var(--font-psv)',
                }}
              >
                {activePrizes.length} prijs{activePrizes.length !== 1 ? 'en' : ''} beschikbaar
              </p>
            </motion.div>
          )}

          {/* SPINNING + DONE */}
          {(phase === 'spinning' || phase === 'done') && (
            <motion.div
              key="reel-area"
              initial={{ opacity: 0, y: 16 }}
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <p
                      style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: 'var(--psv-gold)',
                        fontWeight: 700,
                        marginBottom: '0.3rem',
                        fontFamily: 'var(--font-psv)',
                      }}
                    >
                      Gefeliciteerd!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', fontFamily: 'var(--font-psv)' }}>
                      De winnaar ontvangt:{' '}
                      <span style={{ color: '#fff', fontWeight: 800 }}>{winner?.name}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showReset && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'transparent',
                      border: '2px solid rgba(200, 16, 46, 0.6)',
                      color: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                      padding: '0.9rem 2.5rem',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-psv)',
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

      {/* ── Prize ticker ── */}
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

      {/* Admin link */}
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
