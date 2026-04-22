import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePolisConfig } from '../providers/PolisProvider.js';

export interface AuthUser {
  id: number;
  walletAddress: string;
  displayName: string | null;
}

export type AuthStatus = 'idle' | 'signing' | 'verifying' | 'authenticated' | 'error';

export function useMe() {
  const config = usePolisConfig();

  return useQuery({
    queryKey: ['polis', 'me'],
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        const res = await fetch(`${config.bffUrl}/auth/me`, {
          credentials: 'include',
        });
        if (!res.ok) return null;
        return res.json() as Promise<AuthUser>;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useSIWE() {
  const config = usePolisConfig();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async (signMessage: (message: string) => Promise<string>, address: string) => {
      setError(null);
      try {
        // Step 1: Get nonce
        setStatus('signing');
        const nonceRes = await fetch(`${config.bffUrl}/auth/nonce`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!nonceRes.ok) throw new Error('Failed to get nonce');
        const { nonce } = (await nonceRes.json()) as { nonce: string };

        // Step 2: Construct SIWE message
        const domain = config.integrations.discourse?.url
          ? new URL(config.integrations.discourse.url).host
          : 'localhost';
        const message = [
          `${domain} wants you to sign in with your Ethereum account:`,
          address,
          '',
          'Sign in to Polis Community',
          '',
          `URI: ${config.bffUrl}`,
          `Version: 1`,
          `Chain ID: 8453`,
          `Nonce: ${nonce}`,
          `Issued At: ${new Date().toISOString()}`,
        ].join('\n');

        // Step 3: Sign
        const signature = await signMessage(message);

        // Step 4: Verify
        setStatus('verifying');
        const verifyRes = await fetch(`${config.bffUrl}/auth/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature }),
        });
        if (!verifyRes.ok) throw new Error('Verification failed');

        setStatus('authenticated');
        queryClient.invalidateQueries({ queryKey: ['polis', 'me'] });
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Sign in failed');
      }
    },
    [config, queryClient],
  );

  const signOut = useCallback(async () => {
    await fetch(`${config.bffUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setStatus('idle');
    queryClient.invalidateQueries({ queryKey: ['polis', 'me'] });
  }, [config, queryClient]);

  return { signIn, signOut, status, error };
}
