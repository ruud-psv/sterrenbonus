'use client';

import { useEffect, useRef, useCallback } from 'react';

export type DrawPhase = 'idle' | 'buildup' | 'vortex' | 'reveal';

interface StarCanvasProps {
  phase: DrawPhase;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
  color: string;
  // For vortex effect
  vortexAngle: number;
  vortexRadius: number;
  // Drift direction for idle
  driftX: number;
  driftY: number;
}

const PSV_RED = '#C8102E';
const WHITE = '#FFFFFF';
const GOLD = '#FFD700';

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  const r = Math.random();
  if (r < 0.5) return WHITE;
  if (r < 0.8) return PSV_RED;
  return GOLD;
}

export default function StarCanvas({ phase }: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<DrawPhase>(phase);
  const phaseStartRef = useRef<number>(0);

  const initStars = useCallback((width: number, height: number) => {
    const count = Math.floor((width * height) / 6000);
    starsRef.current = Array.from({ length: count }, () => {
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.random() * width - cx;
      const dy = Math.random() * height - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: randomBetween(0.5, 3),
        opacity: randomBetween(0.2, 1),
        speed: randomBetween(0.1, 0.4),
        angle: Math.atan2(dy, dx),
        color: randomColor(),
        vortexAngle: Math.atan2(dy, dx),
        vortexRadius: dist,
        driftX: randomBetween(-0.3, 0.3),
        driftY: randomBetween(-0.15, -0.5),
      };
    });
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    phaseStartRef.current = performance.now();
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const draw = (now: number) => {
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;
      const currentPhase = phaseRef.current;
      const phaseElapsed = now - phaseStartRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Background
      if (currentPhase === 'buildup') {
        const progress = Math.min(phaseElapsed / 1500, 1);
        const alpha = 0.08 + progress * 0.06;
        ctx.fillStyle = `rgba(10, 10, 26, ${alpha})`;
      } else if (currentPhase === 'vortex') {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
      } else if (currentPhase === 'reveal') {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.08)';
      } else {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.12)';
      }
      ctx.fillRect(0, 0, width, height);

      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (currentPhase === 'idle') {
          star.x += star.driftX * delta * 0.05;
          star.y += star.driftY * delta * 0.05;
          star.opacity += Math.sin(now * 0.001 + i) * 0.003;
          star.opacity = Math.max(0.1, Math.min(1, star.opacity));

          // Wrap around
          if (star.x < -5) star.x = width + 5;
          if (star.x > width + 5) star.x = -5;
          if (star.y < -5) star.y = height + 5;
          if (star.y > height + 5) star.y = -5;

        } else if (currentPhase === 'buildup') {
          const progress = Math.min(phaseElapsed / 1500, 1);
          const speedMult = 1 + progress * 8;

          // Move toward center
          const dx = cx - star.x;
          const dy = cy - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const moveSpeed = star.speed * speedMult * delta * 0.05;

          if (dist > 5) {
            star.x += (dx / dist) * moveSpeed;
            star.y += (dy / dist) * moveSpeed;
          } else {
            // Respawn from edge
            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) { star.x = Math.random() * width; star.y = -5; }
            else if (edge === 1) { star.x = width + 5; star.y = Math.random() * height; }
            else if (edge === 2) { star.x = Math.random() * width; star.y = height + 5; }
            else { star.x = -5; star.y = Math.random() * height; }
          }

          star.opacity = 0.4 + progress * 0.6;

        } else if (currentPhase === 'vortex') {
          const progress = Math.min(phaseElapsed / 1000, 1);
          const speedMult = 3 + progress * 12;

          // Spiral inward
          const dx = cx - star.x;
          const dy = cy - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 3) {
            const towardCenter = star.speed * speedMult * delta * 0.05;
            const tangential = star.speed * speedMult * delta * 0.04;
            const nx = dx / dist;
            const ny = dy / dist;
            star.x += nx * towardCenter - ny * tangential;
            star.y += ny * towardCenter + nx * tangential;
          } else {
            // Respawn from edge
            const angle = Math.random() * Math.PI * 2;
            const r = Math.max(width, height) * 0.6;
            star.x = cx + Math.cos(angle) * r;
            star.y = cy + Math.sin(angle) * r;
          }

          star.opacity = 0.6 + progress * 0.4;
          star.size = star.size * (1 + delta * 0.002);

        } else if (currentPhase === 'reveal') {
          const progress = Math.min(phaseElapsed / 1000, 1);

          // Explode outward from center
          if (phaseElapsed < 50) {
            // Reset to center
            star.x = cx + randomBetween(-20, 20);
            star.y = cy + randomBetween(-20, 20);
            star.angle = Math.random() * Math.PI * 2;
            star.speed = randomBetween(3, 12);
            star.size = randomBetween(1, 4);
          }

          const explodeSpeed = star.speed * (1 + progress * 3) * delta * 0.08;
          star.x += Math.cos(star.angle) * explodeSpeed;
          star.y += Math.sin(star.angle) * explodeSpeed;
          star.opacity = Math.max(0, 1 - progress * 0.8);
          star.size = Math.max(0.3, star.size - delta * 0.01);
        }

        // Draw star
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
        ctx.fillStyle = star.color;

        if (star.size > 1.5 && (star.color === GOLD || currentPhase === 'reveal')) {
          // Draw 4-pointed star shape for larger particles
          ctx.translate(star.x, star.y);
          ctx.beginPath();
          const s = star.size;
          ctx.moveTo(0, -s * 2);
          ctx.lineTo(s * 0.5, -s * 0.5);
          ctx.lineTo(s * 2, 0);
          ctx.lineTo(s * 0.5, s * 0.5);
          ctx.lineTo(0, s * 2);
          ctx.lineTo(-s * 0.5, s * 0.5);
          ctx.lineTo(-s * 2, 0);
          ctx.lineTo(-s * 0.5, -s * 0.5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glow effect for PSV red
        if (star.color === PSV_RED && star.opacity > 0.5) {
          ctx.shadowBlur = star.size * 6;
          ctx.shadowColor = PSV_RED;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Draw pulsing ring during buildup
      if (currentPhase === 'buildup') {
        const progress = Math.min(phaseElapsed / 1500, 1);
        const pulse = Math.sin(phaseElapsed * 0.006) * 0.5 + 0.5;
        const radius = 60 + progress * 80 + pulse * 20;
        const alpha = 0.3 + pulse * 0.4;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 16, 46, ${alpha})`;
        ctx.lineWidth = 2 + pulse * 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = PSV_RED;
        ctx.stroke();

        // Second ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 16, 46, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Draw vortex ring
      if (currentPhase === 'vortex') {
        const progress = Math.min(phaseElapsed / 1000, 1);
        const pulse = Math.sin(phaseElapsed * 0.015) * 0.5 + 0.5;
        const radius = 120 - progress * 100;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(5, radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 16, 46, ${0.6 + pulse * 0.4})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = PSV_RED;
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initStars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
