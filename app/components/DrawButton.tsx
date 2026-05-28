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
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className="btn-draw"
      style={{
        minWidth: 260,
        padding: '1.3rem 3.5rem',
        background: disabled
          ? 'rgba(200,16,46,0.35)'
          : 'linear-gradient(160deg, #e8102e 0%, #C8102E 50%, #9B0020 100%)',
        border: 'none',
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: 900,
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        fontFamily: 'var(--font-psv)',
        position: 'relative' as const,
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Shine sweep */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative' }}>TREKKEN</span>
    </motion.button>
  );
}
