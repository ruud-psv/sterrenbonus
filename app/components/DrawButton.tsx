'use client';

import { motion } from 'framer-motion';

interface DrawButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function DrawButton({ onClick, disabled = false }: DrawButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.06 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className="btn-draw relative overflow-hidden rounded-full font-black text-2xl tracking-[0.15em] uppercase text-white"
      style={{
        minWidth: 240,
        paddingTop: 22,
        paddingBottom: 22,
        paddingLeft: 56,
        paddingRight: 56,
        background: 'linear-gradient(135deg, #C8102E, #e8102e)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
      />
      <span className="relative">TREKKEN</span>
    </motion.button>
  );
}
