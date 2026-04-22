import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema.js';
import { DiscourseClient } from './adapters/discourse.js';
import type { Env } from './env.js';
import type { BffContext } from './graphql/builder.js';

export interface ServerConfig {
  env: Env;
  logger?: boolean;
}

export async function createServer(config: ServerConfig) {
  const { env } = config;

  const app = Fastify({
    logger: config.logger !== false
      ? {
          level: env.NODE_ENV === 'production' ? 'info' : 'debug',
          transport: env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        }
      : false,
  });

  // ── Plugins ───────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ── Discourse client ──────────────────────────────────────
  const discourse = new DiscourseClient({
    baseUrl: env.DISCOURSE_URL,
    apiKey: env.DISCOURSE_API_KEY,
    apiUsername: env.DISCOURSE_API_USERNAME,
  });

  // ── GraphQL Yoga ──────────────────────────────────────────
  const yoga = createYoga<BffContext>({
    schema,
    context: (): BffContext => ({
      discourse,
      userId: undefined,
    }),
    graphqlEndpoint: '/graphql',
    landingPage: env.NODE_ENV !== 'production',
  });

  app.route({
    url: '/graphql',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (request, reply) => {
      const url = `http://${env.HOST}:${env.PORT}${request.url}`;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(request.headers)) {
        if (typeof value === 'string') headers[key] = value;
      }
      const req = new Request(url, {
        method: request.method,
        headers,
        body: request.method !== 'GET' ? JSON.stringify(request.body) : undefined,
      });
      const response = await yoga.fetch(req, { discourse, userId: undefined });
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      const body = await response.text();
      reply.send(body);
    },
  });

  // ── Health check ──────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  }));

  // ── SSE stream endpoint ───────────────────────────────────
  app.get('/stream/:channel', async (request, reply) => {
    const { channel } = request.params as { channel: string };

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ channel })}\n\n`);

    const keepAlive = setInterval(() => {
      reply.raw.write(': keepalive\n\n');
    }, 30_000);

    request.raw.on('close', () => {
      clearInterval(keepAlive);
    });
  });

  return app;
}
