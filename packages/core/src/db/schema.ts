import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Cities ────────────────────────────────────────────────────
export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    onChainCityId: integer('on_chain_city_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('cities_slug_idx').on(table.slug),
  ],
);

// ── Users ─────────────────────────────────────────────────────
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    cityId: integer('city_id')
      .references(() => cities.id)
      .notNull(),
    walletAddress: text('wallet_address').notNull(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    lumaUserId: text('luma_user_id'),
    discourseUserId: integer('discourse_user_id'),
    farcasterFid: integer('farcaster_fid'),
    residentVerifiedAt: timestamp('resident_verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_wallet_idx').on(table.walletAddress),
    index('users_luma_idx').on(table.lumaUserId),
    index('users_discourse_idx').on(table.discourseUserId),
  ],
);

// ── Sessions ──────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// ── Relations ─────────────────────────────────────────────────
export const citiesRelations = relations(cities, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  city: one(cities, { fields: [users.cityId], references: [cities.id] }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
