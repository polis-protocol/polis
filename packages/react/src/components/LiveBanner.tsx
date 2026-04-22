import React from 'react';
import { usePolisConfig } from '../providers/PolisProvider.js';

export interface LiveBannerProps {
  isLive?: boolean;
  label?: string;
}

export function LiveBanner({ isLive = false, label }: LiveBannerProps): React.JSX.Element | null {
  const config = usePolisConfig();
  const livestreamEnabled = config.features?.livestream ?? false;

  if (!livestreamEnabled || !isLive) return null;

  return (
    <div
      className="polis-live-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--polis-bg-card)',
        borderBottom: '1px solid var(--polis-border)',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--polis-accent-red)',
          animation: 'polis-pulse 2s ease-in-out infinite',
        }}
      />
      <span style={{ color: 'var(--polis-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
        {label ?? 'LIVE'}
      </span>
      <style>{`
        @keyframes polis-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
