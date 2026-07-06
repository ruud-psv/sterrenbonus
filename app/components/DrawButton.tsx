'use client';

import { motion } from 'framer-motion';

interface DrawButtonProps {
  onClick: () => void;
  disabled?: boolean;
  primaryColor?: string;
  primaryDark?: string;
}

export default function DrawButton({
  onClick,
  disabled = false,
  primaryColor = '#C8102E',
  primaryDark = '#9B0020',
}: DrawButtonProps) {
  // Lighten primary slightly for gradient top
  const primaryLight = primaryColor;

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
          ? `${primaryColor}59`
          : `linear-gradient(160deg, ${primaryLight} 0%, ${primaryColor} 50%, ${primaryDark} 100%)`,
        border: 'none',
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: 900,
        letterSpacing: 'normal',
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
      <span style={{ position: 'relative' }}>START</span>
    </motion.button>
  );
}
