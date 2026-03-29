// src/components/Shared/GlassPanel.tsx
import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'teal' | 'blue' | 'purple' | 'none';
  padding?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const glowMap: Record<string, string> = {
  teal: '0 0 20px rgba(0, 245, 196, 0.12), 0 0 40px rgba(0, 245, 196, 0.04)',
  blue: '0 0 20px rgba(26, 240, 255, 0.12), 0 0 40px rgba(26, 240, 255, 0.04)',
  purple: '0 0 20px rgba(180, 79, 255, 0.12), 0 0 40px rgba(180, 79, 255, 0.04)',
  none: 'none',
};

const borderMap: Record<string, string> = {
  teal: 'rgba(0, 245, 196, 0.2)',
  blue: 'rgba(26, 240, 255, 0.2)',
  purple: 'rgba(180, 79, 255, 0.2)',
  none: 'rgba(255,255,255,0.06)',
};

/**
 * Reusable glassmorphism panel component.
 * Applies the Cyber-Odisha glass aesthetic consistently.
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  glowColor = 'teal',
  padding = '1rem',
  style,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'rgba(0, 245, 196, 0.05)',
        border: `1px solid ${borderMap[glowColor]}`,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '12px',
        boxShadow: `${glowMap[glowColor]}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        padding,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {/* Corner accent lines */}
      <span
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          width: 14,
          height: 14,
          borderTop: `1.5px solid ${borderMap[glowColor]}`,
          borderLeft: `1.5px solid ${borderMap[glowColor]}`,
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          width: 14,
          height: 14,
          borderBottom: `1.5px solid ${borderMap[glowColor]}`,
          borderRight: `1.5px solid ${borderMap[glowColor]}`,
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
};
