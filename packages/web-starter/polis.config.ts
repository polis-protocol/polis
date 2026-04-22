import { defineConfig } from '@polisprotocol/core';
import themeDefault from '@polisprotocol/theme-default';

export default defineConfig({
  city: { name: 'My City', slug: 'my-city' },
  bffUrl: process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:4000',
  theme: {
    tokens: themeDefault,
    overrides: {},
  },
  integrations: {
    discourse: { url: process.env.NEXT_PUBLIC_DISCOURSE_URL ?? 'http://localhost:4200' },
  },
  features: { siwe: true, livestream: false },
  categories: [
    { slug: 'general', name: 'General', color: '#BFFF3F' },
    { slug: 'announcements', name: 'Announcements', color: '#F59E0B' },
    { slug: 'builders', name: 'Builders', color: '#60A5FA' },
    { slug: 'governance', name: 'Governance', color: '#C084FC' },
    { slug: 'lounge', name: 'Lounge', color: '#EF4444' },
  ],
});
