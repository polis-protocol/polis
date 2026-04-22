import { describe, it, expect } from 'vitest';
import { validateEnv } from '../env.js';

describe('validateEnv', () => {
  const validEnv = {
    DISCOURSE_URL: 'https://forum.ipehub.xyz',
    DISCOURSE_API_KEY: 'test-api-key-1234',
  };

  it('validates minimal valid env', () => {
    const env = validateEnv(validEnv);
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.DISCOURSE_URL).toBe('https://forum.ipehub.xyz');
  });

  it('applies defaults', () => {
    const env = validateEnv(validEnv);
    expect(env.HOST).toBe('0.0.0.0');
    expect(env.CORS_ORIGIN).toBe('*');
    expect(env.DISCOURSE_API_USERNAME).toBe('system');
  });

  it('throws on missing DISCOURSE_URL', () => {
    expect(() => validateEnv({ DISCOURSE_API_KEY: 'key' })).toThrow('Environment validation failed');
  });

  it('throws on missing DISCOURSE_API_KEY', () => {
    expect(() => validateEnv({ DISCOURSE_URL: 'https://forum.test.xyz' })).toThrow(
      'Environment validation failed',
    );
  });

  it('coerces PORT to number', () => {
    const env = validateEnv({ ...validEnv, PORT: '3000' });
    expect(env.PORT).toBe(3000);
  });
});
