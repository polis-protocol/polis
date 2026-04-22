import { describe, it, expect } from 'vitest';
import { ThemeSchema, injectThemeCSS } from '@polisprotocol/core';
import { defaultTheme } from '../index.js';

describe('defaultTheme', () => {
  it('passes schema validation', () => {
    const result = ThemeSchema.safeParse(defaultTheme);
    expect(result.success).toBe(true);
  });

  it('has primary color set to neon green', () => {
    expect(defaultTheme.colors.primary).toBe('#BFFF3F');
  });

  it('has dark background', () => {
    expect(defaultTheme.colors['bg-deep']).toBe('#0A0A0F');
  });

  it('generates valid CSS', () => {
    const css = injectThemeCSS(defaultTheme);
    expect(css).toContain(':root {');
    expect(css).toContain('--polis-primary: #BFFF3F');
    expect(css).toContain('--polis-bg-deep: #0A0A0F');
    expect(css).toContain('--polis-font-serif: Instrument Serif');
    expect(css).toContain('--polis-radius-xl: 16px');
  });
});
