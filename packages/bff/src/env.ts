import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),

  DISCOURSE_URL: z.string().url(),
  DISCOURSE_API_KEY: z.string().min(1),
  DISCOURSE_API_USERNAME: z.string().default('system'),

  SESSION_SECRET: z.string().min(32).optional(),
  SIWE_DOMAIN: z.string().optional(),

  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}
