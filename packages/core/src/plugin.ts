import { z } from 'zod';

export interface PluginHooks {
  onPostCreated?: (ctx: PluginContext, post: unknown) => Promise<void>;
  onTopicCreated?: (ctx: PluginContext, topic: unknown) => Promise<void>;
  onUserCreated?: (ctx: PluginContext, user: unknown) => Promise<void>;
}

export interface PluginContext {
  config: unknown;
  db: unknown;
  logger: unknown;
}

export interface PluginDefinition {
  name: string;
  version?: string;
  schema?: (builder: unknown) => void;
  hooks?: PluginHooks;
}

export const PluginMetaSchema = z.object({
  name: z.string().min(1),
  version: z.string().optional(),
});

export function definePlugin(definition: PluginDefinition): PluginDefinition {
  PluginMetaSchema.parse({ name: definition.name, version: definition.version });
  return definition;
}
