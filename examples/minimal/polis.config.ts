import { defineConfig } from '@polisprotocol/core';
import { defaultTheme } from '@polisprotocol/theme-default';

export default defineConfig({
  city: { name: 'Minimal City', slug: 'minimal', cityId: 1 },
  bffUrl: process.env['NEXT_PUBLIC_BFF_URL'] ?? 'http://localhost:4000',
  theme: {
    tokens: defaultTheme,
  },
  integrations: {
    discourse: { url: 'http://localhost:3000' },
  },
  features: { siwe: false, livestream: false },
  categories: [
    { slug: 'general', name: 'General', color: '#60A5FA' },
    { slug: 'feedback', name: 'Feedback', color: '#F59E0B' },
  ],
});
