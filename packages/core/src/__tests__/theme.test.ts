import { describe, it, expect } from 'vitest';
import { ThemeSchema, injectThemeCSS } from '../theme.js';
import type { Theme } from '../theme.js';

const validTheme: Theme = {
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

describe('ThemeSchema', () => {
  it('validates a complete theme', () => {
    const result = ThemeSchema.safeParse(validTheme);
    expect(result.success).toBe(true);
  });

  it('rejects missing color', () => {
    const { primary, ...rest } = validTheme.colors;
    const result = ThemeSchema.safeParse({
      ...validTheme,
      colors: rest,
    });
    expect(result.success).toBe(false);
  });
});

describe('injectThemeCSS', () => {
  it('generates valid CSS with polis prefix', () => {
    const css = injectThemeCSS(validTheme);
    expect(css).toContain(':root {');
    expect(css).toContain('--polis-primary: #BFFF3F');
    expect(css).toContain('--polis-font-serif: Instrument Serif');
    expect(css).toContain('--polis-radius-md: 8px');
    expect(css).toContain('}');
  });

  it('supports custom prefix', () => {
    const css = injectThemeCSS(validTheme, 'ipe');
    expect(css).toContain('--ipe-primary: #BFFF3F');
    expect(css).not.toContain('--polis-');
  });
});
