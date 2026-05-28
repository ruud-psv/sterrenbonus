'use client';

import { useEffect, useRef, useCallback } from 'react';

export type DrawPhase = 'idle' | 'spinning' | 'celebrate';

interface StarCanvasProps {
  phase: DrawPhase;
}

interface Star {
  x: number;
  y: number;
  outerR: number;
  opacity: number;
  opacityPhase: number;
  opacitySpeed: number;
  driftX: number;
  driftY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

const PSV_RED = '#C8102E';
const WHITE = '#FFFFFF';
const GOLD = '#FFD700';

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  const r = Math.random();
  if (r < 0.55) return WHITE;
  if (r < 0.80) return PSV_RED;
  return GOLD;
}

// 4-pointed star, always star-shaped
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, outerR: number, rotation: number, color: string) {
  const innerR = outerR * 0.38;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (color === PSV_RED || color === GOLD) {
    ctx.shadowBlur = outerR * 4;
    ctx.shadowColor = color;
  }

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
    else ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function StarCanvas({ phase: _phase }: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);

  const initStars = useCallback((width: number, height: number) => {
    const count = Math.floor((width * height) / 7000);
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      outerR: randomBetween(4, 13),
      opacity: randomBetween(0.15, 0.85),
      opacityPhase: Math.random() * Math.PI * 2,
      opacitySpeed: randomBetween(0.4, 1.2),
      driftX: randomBetween(-0.2, 0.2),
      driftY: randomBetween(-0.35, -0.08),
      rotation: Math.random() * Math.PI,
      rotationSpeed: randomBetween(-0.003, 0.003),
      color: randomColor(),
    }));
  }, []);

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
      const t = now / 1000;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      for (const star of starsRef.current) {
        // Always gentle float — same in every phase
        star.x += star.driftX * delta * 0.05;
        star.y += star.driftY * delta * 0.05;
        star.rotation += star.rotationSpeed * delta;

        // Twinkle
        const twinkle = Math.sin(t * star.opacitySpeed + star.opacityPhase);
        const opacity = Math.max(0.06, Math.min(0.92, star.opacity + twinkle * 0.18));

        // Wrap edges
        if (star.x < -star.outerR * 2) star.x = width + star.outerR * 2;
        if (star.x > width + star.outerR * 2) star.x = -star.outerR * 2;
        if (star.y < -star.outerR * 2) star.y = height + star.outerR * 2;
        if (star.y > height + star.outerR * 2) star.y = -star.outerR * 2;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        drawStar(ctx, star.x, star.y, star.outerR, star.rotation, star.color);
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
