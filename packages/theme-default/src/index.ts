import type { Theme } from '@polisprotocol/core';

export const defaultTheme: Theme = {
  colors: {
    primary: '#BFFF3F',
    'bg-deep': '#0A0A0F',
    'bg-card': '#12121A',
    'bg-surface': '#1A1A24',
    'text-primary': '#F5F5F7',
    'text-secondary': '#A1A1AA',
    'text-muted': '#52525B',
    'accent-cyan': '#22D3EE',
    'accent-amber': '#F59E0B',
    'accent-violet': '#C084FC',
    'accent-pink': '#F472B6',
    'accent-orange': '#FB923C',
    'accent-blue': '#60A5FA',
    'accent-red': '#EF4444',
    border: '#27272A',
  },
  fonts: {
    serif: 'Instrument Serif',
    sans: 'Manrope',
    mono: 'JetBrains Mono',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
};

export default defaultTheme;
