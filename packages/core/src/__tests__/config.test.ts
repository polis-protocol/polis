import { describe, it, expect } from 'vitest';
import { defineConfig } from '../config.js';
import type { Theme } from '../theme.js';

const testTheme: Theme = {
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

describe('defineConfig', () => {
  it('validates and returns a valid config', () => {
    const config = defineConfig({
      city: { name: 'Ipê City', slug: 'ipe', cityId: 1 },
      bffUrl: 'https://api.ipehub.xyz',
      theme: { tokens: testTheme },
      integrations: {
        discourse: { url: 'https://forum.ipehub.xyz' },
      },
      categories: [
        { slug: 'general', name: 'General', color: '#BFFF3F' },
      ],
    });
    expect(config.city.slug).toBe('ipe');
    expect(config.categories).toHaveLength(1);
  });

  it('throws on invalid bffUrl', () => {
    expect(() =>
      defineConfig({
        city: { name: 'Test', slug: 'test' },
        bffUrl: 'not-a-url',
        theme: { tokens: testTheme },
        integrations: {
          discourse: { url: 'https://forum.test.xyz' },
        },
        categories: [
          { slug: 'general', name: 'General', color: '#000000' },
        ],
      }),
    ).toThrow();
  });

  it('throws on empty categories', () => {
    expect(() =>
      defineConfig({
        city: { name: 'Test', slug: 'test' },
        bffUrl: 'https://api.test.xyz',
        theme: { tokens: testTheme },
        integrations: {
          discourse: { url: 'https://forum.test.xyz' },
        },
        categories: [],
      }),
    ).toThrow();
  });

  it('accepts optional features and plugins', () => {
    const config = defineConfig({
      city: { name: 'Demo', slug: 'demo' },
      bffUrl: 'https://api.demo.xyz',
      theme: { tokens: testTheme },
      integrations: {
        discourse: { url: 'https://forum.demo.xyz' },
      },
      features: { siwe: true, livestream: true },
      categories: [
        { slug: 'general', name: 'General', color: '#FFFFFF' },
      ],
    });
    expect(config.features?.siwe).toBe(true);
    expect(config.features?.livestream).toBe(true);
  });
});
