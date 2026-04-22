import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import { injectThemeCSS } from '@polisprotocol/core';
import type { PolisConfig } from '@polisprotocol/core';

// ── Context ──────────────────────────────────────���──────────
interface PolisContextValue {
  config: PolisConfig;
  gqlClient: GraphQLClient;
}

const PolisContext = createContext<PolisContextValue | null>(null);

export function usePolisConfig(): PolisConfig {
  const ctx = useContext(PolisContext);
  if (!ctx) throw new Error('usePolisConfig must be used within <PolisProvider>');
  return ctx.config;
}

export function useGqlClient(): GraphQLClient {
  const ctx = useContext(PolisContext);
  if (!ctx) throw new Error('useGqlClient must be used within <PolisProvider>');
  return ctx.gqlClient;
}

// ── Provider ────────────────────────────────────────────────
interface PolisProviderProps {
  config: PolisConfig;
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function PolisProvider({ config, children }: PolisProviderProps): React.JSX.Element {
  const gqlClient = useMemo(
    () =>
      new GraphQLClient(`${config.bffUrl}/graphql`, {
        credentials: 'include',
      }),
    [config.bffUrl],
  );

  // Inject theme CSS variables
  useEffect(() => {
    const styleId = 'polis-theme-vars';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    const theme = config.theme.tokens;
    style.textContent = injectThemeCSS(theme);

    return () => {
      style?.remove();
    };
  }, [config.theme.tokens]);

  const value = useMemo(() => ({ config, gqlClient }), [config, gqlClient]);

  return (
    <PolisContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PolisContext.Provider>
  );
}
