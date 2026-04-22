import type { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'Minimal Polis Example',
  description: 'Smallest viable Polis deployment',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0A0A0F', color: '#F5F5F5' }}>
        <Providers>
          <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #2A2A3E' }}>
            <a href="/" style={{ color: '#BFFF3F', textDecoration: 'none', fontWeight: 700 }}>
              Minimal City
            </a>
            {' | '}
            <a href="/community" style={{ color: '#F5F5F5', textDecoration: 'none' }}>
              Community
            </a>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
