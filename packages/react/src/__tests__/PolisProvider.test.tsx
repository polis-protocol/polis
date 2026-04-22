import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { PolisProvider, usePolisConfig } from '../providers/PolisProvider.js';
import type { PolisConfig } from '@polis/core';
import { defaultTheme } from '@polis/theme-default';

const testConfig: PolisConfig = {
  city: { name: 'Test City', slug: 'test' },
  bffUrl: 'https://api.test.xyz',
  theme: { tokens: defaultTheme },
  integrations: {
    discourse: { url: 'https://forum.test.xyz' },
  },
  categories: [
    { slug: 'general', name: 'General', color: '#BFFF3F' },
  ],
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <PolisProvider config={testConfig}>{children}</PolisProvider>;
}

describe('PolisProvider', () => {
  it('provides config via usePolisConfig', () => {
    const { result } = renderHook(() => usePolisConfig(), { wrapper });
    expect(result.current.city.slug).toBe('test');
    expect(result.current.bffUrl).toBe('https://api.test.xyz');
  });

  it('throws when usePolisConfig used outside provider', () => {
    expect(() => {
      renderHook(() => usePolisConfig());
    }).toThrow('usePolisConfig must be used within <PolisProvider>');
  });
});
