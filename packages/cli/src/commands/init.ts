import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import chalk from 'chalk';

export const initCommand = defineCommand({
  meta: {
    name: 'init',
    description: 'Scaffold a new Polis city',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Project directory name',
      required: false,
    },
  },
  async run({ args }) {
    p.intro(chalk.hex('#BFFF3F')('🏛️ create-polis-city'));

    const projectName =
      args.name ??
      ((await p.text({
        message: 'Project name:',
        placeholder: 'my-city',
        validate: (v) => (v.length < 1 ? 'Required' : undefined),
      })) as string);

    if (p.isCancel(projectName)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const cityName = (await p.text({
      message: 'City display name:',
      placeholder: 'My City',
      initialValue: projectName
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    })) as string;

    if (p.isCancel(cityName)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const citySlug = (await p.text({
      message: 'City slug (lowercase, hyphens):',
      placeholder: 'my-city',
      initialValue: projectName.toLowerCase().replace(/\s+/g, '-'),
      validate: (v) => (/^[a-z0-9-]+$/.test(v) ? undefined : 'Only lowercase letters, numbers, hyphens'),
    })) as string;

    if (p.isCancel(citySlug)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const features = (await p.multiselect({
      message: 'Features:',
      options: [
        { value: 'siwe', label: 'Wallet sign-in (SIWE)', hint: 'recommended' },
        { value: 'livestream', label: 'Livestream integration' },
        { value: 'farcaster', label: 'Farcaster cross-posting' },
      ],
      initialValues: ['siwe'],
    })) as string[];

    if (p.isCancel(features)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    const targetDir = resolve(projectName);

    const s = p.spinner();

    // Clone template
    s.start('Cloning template...');
    try {
      execSync(`npx --yes degit polis-protocol/polis/packages/web-starter ${targetDir}`, {
        stdio: 'pipe',
      });
    } catch {
      // Fallback: if degit fails (e.g., repo not yet public), create from scratch
      execSync(`mkdir -p ${targetDir}`);
      s.message('Template clone failed, creating minimal structure...');
    }
    s.stop('Template cloned.');

    // Replace placeholders
    s.start('Configuring project...');
    const configTemplatePath = join(targetDir, 'polis.config.ts.template');
    const configPath = join(targetDir, 'polis.config.ts');

    if (existsSync(configTemplatePath)) {
      let configContent = readFileSync(configTemplatePath, 'utf-8');
      configContent = configContent.replace(/\{\{CITY_NAME\}\}/g, cityName);
      configContent = configContent.replace(/\{\{CITY_SLUG\}\}/g, citySlug);
      writeFileSync(configPath, configContent);
    } else {
      // Generate config from scratch
      const configContent = `import { defineConfig } from '@polisprotocol/core';
import themeDefault from '@polisprotocol/theme-default';

export default defineConfig({
  city: { name: '${cityName}', slug: '${citySlug}' },
  bffUrl: process.env.NEXT_PUBLIC_BFF_URL!,
  theme: {
    tokens: themeDefault,
    overrides: {},
  },
  integrations: {
    discourse: { url: process.env.NEXT_PUBLIC_DISCOURSE_URL! },${features.includes('farcaster') ? "\n    farcaster: { channel: '" + citySlug + "' }," : ''}
  },
  features: { siwe: ${features.includes('siwe')}, livestream: ${features.includes('livestream')} },
  categories: [
    { slug: 'general', name: 'General', color: '#BFFF3F' },
    { slug: 'announcements', name: 'Announcements', color: '#F59E0B' },
    { slug: 'builders', name: 'Builders', color: '#60A5FA' },
    { slug: 'governance', name: 'Governance', color: '#C084FC' },
    { slug: 'lounge', name: 'Lounge', color: '#EF4444' },
  ],
});
`;
      writeFileSync(configPath, configContent);
    }

    // Create .env.local
    writeFileSync(
      join(targetDir, '.env.local'),
      `NEXT_PUBLIC_BFF_URL=http://localhost:4000\nNEXT_PUBLIC_DISCOURSE_URL=http://localhost:4200\n`,
    );

    // Update package.json name
    const pkgPath = join(targetDir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      pkg.name = citySlug;
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }

    s.stop('Project configured.');

    p.note(
      [
        `${chalk.bold('cd')} ${projectName}`,
        `${chalk.bold('pnpm install')}`,
        `${chalk.bold('pnpm dev')}`,
      ].join('\n'),
      'Next steps',
    );

    p.outro(chalk.hex('#BFFF3F')(`${cityName} is ready! 🎉`));
  },
});
