import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import chalk from 'chalk';

interface Check {
  name: string;
  check: () => boolean;
  fix?: string;
}

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getVersion(cmd: string): string {
  try {
    return execSync(`${cmd} --version`, { stdio: 'pipe' }).toString().trim().split('\n')[0] ?? '';
  } catch {
    return 'not found';
  }
}

export const doctorCommand = defineCommand({
  meta: {
    name: 'doctor',
    description: 'Check environment for Polis development',
  },
  async run() {
    p.intro(chalk.hex('#BFFF3F')('🩺 Polis Doctor'));

    const checks: Check[] = [
      {
        name: 'Node.js >= 22',
        check: () => {
          const v = process.versions.node.split('.')[0];
          return Number(v) >= 22;
        },
        fix: 'nvm install 22 && nvm use 22',
      },
      {
        name: 'pnpm installed',
        check: () => commandExists('pnpm'),
        fix: 'corepack enable && corepack prepare pnpm@latest --activate',
      },
      {
        name: 'Docker running',
        check: () => {
          try {
            execSync('docker info', { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Start Docker Desktop or the docker daemon',
      },
      {
        name: 'git installed',
        check: () => commandExists('git'),
        fix: 'Install git from https://git-scm.com',
      },
      {
        name: 'polis.config.ts exists',
        check: () => existsSync('polis.config.ts'),
        fix: 'Run "polis init" to create a project first',
      },
      {
        name: '.env.local exists',
        check: () => existsSync('.env.local'),
        fix: 'Copy .env.example to .env.local and fill in values',
      },
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      const ok = check.check();
      if (ok) {
        p.log.success(`${check.name}`);
        passed++;
      } else {
        p.log.error(`${check.name}${check.fix ? ` → ${chalk.dim(check.fix)}` : ''}`);
        failed++;
      }
    }

    p.log.info('');
    p.log.info(`Node: ${getVersion('node')}`);
    p.log.info(`pnpm: ${getVersion('pnpm')}`);
    p.log.info(`git:  ${getVersion('git')}`);

    if (failed === 0) {
      p.outro(chalk.green(`All ${passed} checks passed ✓`));
    } else {
      p.outro(chalk.yellow(`${passed} passed, ${failed} failed`));
    }
  },
});
