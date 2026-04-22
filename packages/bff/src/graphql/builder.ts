import SchemaBuilder from '@pothos/core';
import type { DiscourseClient } from '../adapters/discourse.js';

export interface BffContext {
  discourse: DiscourseClient;
  userId?: number;
}

export const builder = new SchemaBuilder<{
  Context: BffContext;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
}>({});

// ── Scalar ────────────────────────────────────────────────────
builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value as string),
});

// ── Error types ───────────────────────────────────────────────
export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}
