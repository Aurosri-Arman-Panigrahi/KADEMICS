// src/components/Shared/NeonText.tsx
import React from 'react';

type GlowColor = 'teal' | 'blue' | 'purple';
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';

interface NeonTextProps {
  children: React.ReactNode;
  as?: HeadingLevel;
  glow?: GlowColor;
  size?: string;
  className?: string;
  style?: React.CSSProperties;
  tracking?: string;
}

const shadowMap: Record<GlowColor, string> = {
  teal: '0 0 5px #00f5c4, 0 0 15px #00f5c4, 0 0 30px rgba(0,245,196,0.5), 0 0 60px rgba(0,245,196,0.2)',
  blue: '0 0 5px #1af0ff, 0 0 15px #1af0ff, 0 0 30px rgba(26,240,255,0.5)',
  purple: '0 0 5px #b44fff, 0 0 15px #b44fff, 0 0 30px rgba(180,79,255,0.5)',
};

const colorMap: Record<GlowColor, string> = {
  teal: '#00f5c4',
  blue: '#1af0ff',
  purple: '#b44fff',
};

/**
 * Neon-glowing heading/text using Orbitron font.
 */
export const NeonText: React.FC<NeonTextProps> = ({
  children,
  as: Tag = 'h2',
  glow = 'teal',
  size = '1.5rem',
  className = '',
  style,
  tracking = '0.1em',
}) => {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: size,
        color: colorMap[glow],
        textShadow: shadowMap[glow],
        letterSpacing: tracking,
        fontWeight: 700,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};
