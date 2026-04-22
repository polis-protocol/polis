import { createServer } from './server.js';
import { validateEnv } from './env.js';

async function main(): Promise<void> {
  const env = validateEnv();
  const server = await createServer({ env });

  try {
    await server.listen({ port: env.PORT, host: env.HOST });
    server.log.info(`BFF running at http://${env.HOST}:${env.PORT}`);
    server.log.info(`GraphQL playground at http://${env.HOST}:${env.PORT}/graphql`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
