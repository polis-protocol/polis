import { describe, it, expect } from 'vitest';

describe('CLI', () => {
  it('modules are importable', async () => {
    const { initCommand } = await import('../commands/init.js');
    const { doctorCommand } = await import('../commands/doctor.js');
    expect(initCommand).toBeDefined();
    expect(doctorCommand).toBeDefined();
  });
});
