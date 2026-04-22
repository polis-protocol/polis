import { z } from 'zod';
import {
  CitySchema,
  CategorySchema,
  IntegrationsSchema,
  FeaturesSchema,
} from './schema.js';
import { ThemeSchema, ThemeOverridesSchema } from './theme.js';
import { PluginMetaSchema } from './plugin.js';
import type { PluginDefinition } from './plugin.js';

export const ThemeConfigSchema = z.object({
  tokens: ThemeSchema,
  overrides: ThemeOverridesSchema,
});

export const PolisConfigSchema = z.object({
  city: CitySchema,
  bffUrl: z.string().url(),
  theme: ThemeConfigSchema,
  integrations: IntegrationsSchema,
  features: FeaturesSchema.optional(),
  categories: z.array(CategorySchema).min(1),
  plugins: z.array(PluginMetaSchema).optional(),
});

export type PolisConfig = z.infer<typeof PolisConfigSchema> & {
  plugins?: PluginDefinition[];
};

export function defineConfig(config: PolisConfig): PolisConfig {
  PolisConfigSchema.parse(config);
  return config;
}
