import { z } from 'zod';

export const ThemeColorsSchema = z.object({
  primary: z.string(),
  'bg-deep': z.string(),
  'bg-card': z.string(),
  'bg-surface': z.string(),
  'text-primary': z.string(),
  'text-secondary': z.string(),
  'text-muted': z.string(),
  'accent-cyan': z.string(),
  'accent-amber': z.string(),
  'accent-violet': z.string(),
  'accent-pink': z.string(),
  'accent-orange': z.string(),
  'accent-blue': z.string(),
  'accent-red': z.string(),
  border: z.string(),
});
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const ThemeFontsSchema = z.object({
  serif: z.string(),
  sans: z.string(),
  mono: z.string(),
});
export type ThemeFonts = z.infer<typeof ThemeFontsSchema>;

export const ThemeRadiusSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
});
export type ThemeRadius = z.infer<typeof ThemeRadiusSchema>;

export const ThemeSchema = z.object({
  colors: ThemeColorsSchema,
  fonts: ThemeFontsSchema,
  radius: ThemeRadiusSchema,
});
export type Theme = z.infer<typeof ThemeSchema>;

export const ThemeOverridesSchema = z.record(z.string()).optional();
export type ThemeOverrides = z.infer<typeof ThemeOverridesSchema>;

export function injectThemeCSS(theme: Theme, prefix = 'polis'): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`  --${prefix}-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.fonts)) {
    lines.push(`  --${prefix}-font-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.radius)) {
    lines.push(`  --${prefix}-radius-${key}: ${value};`);
  }
  return `:root {\n${lines.join('\n')}\n}`;
}
