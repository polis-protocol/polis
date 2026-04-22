import { builder } from './builder.js';

// Import resolvers to register types
import './types.js';
import './resolvers.js';

export const schema = builder.toSchema();
