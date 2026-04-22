import { describe, it, expect, vi } from 'vitest';
import { createServer } from '../server.js';
import type { Env } from '../env.js';

const testEnv: Env = {
  NODE_ENV: 'test',
  PORT: 4000,
  HOST: '0.0.0.0',
  DISCOURSE_URL: 'https://forum.test.xyz',
  DISCOURSE_API_KEY: 'test-key',
  DISCOURSE_API_USERNAME: 'system',
  CORS_ORIGIN: '*',
};

describe('createServer', () => {
  it('creates server instance', async () => {
    const server = await createServer({ env: testEnv, logger: false });
    expect(server).toBeDefined();
    await server.close();
  });

  it('responds to healthcheck', async () => {
    const server = await createServer({ env: testEnv, logger: false });
    const response = await server.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('ok');
    expect(body.version).toBe('0.1.0');
    await server.close();
  });

  it('responds to GraphQL introspection', async () => {
    const server = await createServer({ env: testEnv, logger: false });
    const response = await server.inject({
      method: 'POST',
      url: '/graphql',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({ query: '{ __typename }' }),
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.data.__typename).toBe('Query');
    await server.close();
  });
});
