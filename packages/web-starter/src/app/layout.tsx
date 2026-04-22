import type { Metadata } from 'next';
import { PolisProvider } from '@polisprotocol/react';
import polisConfig from '../../polis.config';

export const metadata: Metadata = {
  title: `${polisConfig.city.name} Community`,
  description: `Community forum for ${polisConfig.city.name}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: 'var(--polis-bg-deep, #0A0A0F)', minHeight: '100vh' }}>
        <PolisProvider config={polisConfig}>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--polis-border, #27272A)',
            }}
          >
            <a
              href="/"
              style={{
                fontFamily: 'var(--polis-font-serif)',
                fontSize: '1.25rem',
                color: 'var(--polis-primary, #BFFF3F)',
                textDecoration: 'none',
              }}
            >
              {polisConfig.city.name}
            </a>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a
                href="/community"
                style={{ color: 'var(--polis-text-secondary, #A1A1AA)', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                Community
              </a>
            </div>
          </nav>
          {children}
        </PolisProvider>
      </body>
    </html>
  );
}
