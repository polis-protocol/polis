import { defineCommand, runMain } from 'citty';
import { initCommand } from './commands/init.js';
import { doctorCommand } from './commands/doctor.js';

const main = defineCommand({
  meta: {
    name: 'polis',
    version: '0.1.0',
    description: 'CLI for Polis Protocol pop-up cities',
  },
  subCommands: {
    init: initCommand,
    doctor: doctorCommand,
  },
});

runMain(main);
