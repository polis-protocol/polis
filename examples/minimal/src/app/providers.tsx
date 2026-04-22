'use client';

import type { ReactNode } from 'react';
import { PolisProvider } from '@polisprotocol/react';
import polisConfig from '../../polis.config';

export function Providers({ children }: { children: ReactNode }) {
  return <PolisProvider config={polisConfig}>{children}</PolisProvider>;
}
