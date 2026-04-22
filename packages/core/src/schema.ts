import { z } from 'zod';

// ── City ──────────────────────────────────────────────────────
export const CitySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  cityId: z.number().int().positive().optional(),
});
export type City = z.infer<typeof CitySchema>;

// ── Category ──────────────────────────────────────────────────
export const CategorySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().optional(),
  live: z.boolean().optional(),
  residentsOnly: z.boolean().optional(),
});
export type Category = z.infer<typeof CategorySchema>;

// ── User ──────────────────────────────────────────────────────
export const UserSchema = z.object({
  id: z.number().int().positive(),
  walletAddress: z.string().min(1),
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  discourseUserId: z.number().int().nullable().optional(),
  farcasterFid: z.number().int().nullable().optional(),
  lumaUserId: z.string().nullable().optional(),
  residentVerifiedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

// ── Post ──────────────────────────────────────────────────────
export const PostSchema = z.object({
  id: z.number().int().positive(),
  topicId: z.number().int().positive(),
  authorId: z.number().int().positive(),
  body: z.string().min(1),
  cooked: z.string().optional(),
  replyToPostId: z.number().int().positive().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});
export type Post = z.infer<typeof PostSchema>;

// ── Topic ─────────────────────────────────────────────────────
export const TopicSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(300),
  categorySlug: z.string(),
  authorId: z.number().int().positive(),
  postsCount: z.number().int().nonnegative().default(0),
  viewsCount: z.number().int().nonnegative().default(0),
  pinned: z.boolean().default(false),
  closed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  lastPostedAt: z.coerce.date().optional(),
});
export type Topic = z.infer<typeof TopicSchema>;

// ── Reply (alias for Post used in create context) ─────────────
export const CreateReplySchema = z.object({
  topicId: z.number().int().positive(),
  body: z.string().min(1).max(32000),
});
export type CreateReply = z.infer<typeof CreateReplySchema>;

export const CreateTopicSchema = z.object({
  title: z.string().min(3).max(300),
  body: z.string().min(1).max(32000),
  categorySlug: z.string().min(1),
});
export type CreateTopic = z.infer<typeof CreateTopicSchema>;

// ── Integration configs ───────────────────────────────────────
export const DiscourseIntegrationSchema = z.object({
  url: z.string().url(),
});

export const LumaIntegrationSchema = z.object({
  enabled: z.boolean().default(false),
  eventId: z.string().optional(),
});

export const FarcasterIntegrationSchema = z.object({
  channel: z.string().optional(),
});

export const OnchainIntegrationSchema = z.object({
  chain: z.enum(['base', 'base-sepolia']).default('base'),
  archive: z.string().optional(),
});

export const AuthIntegrationSchema = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('rainbowkit'),
    projectId: z.string().optional(),
  }),
  z.object({
    provider: z.literal('privy'),
    appId: z.string(),
    loginMethods: z
      .array(z.enum(['email', 'google', 'apple', 'twitter', 'farcaster', 'wallet', 'sms']))
      .default(['email', 'wallet']),
    embeddedWallets: z.enum(['users-without-wallets', 'all-users', 'off']).default('users-without-wallets'),
  }),
  z.object({
    provider: z.literal('custom'),
  }),
]);

export const LivestreamIntegrationSchema = z.object({
  statusUrl: z.string().url(),
  playerUrl: z.string().url(),
  chatChannelSlug: z.string().optional(),
});

export const IntegrationsSchema = z.object({
  discourse: DiscourseIntegrationSchema,
  auth: AuthIntegrationSchema.optional(),
  luma: LumaIntegrationSchema.optional(),
  farcaster: FarcasterIntegrationSchema.optional(),
  onchain: OnchainIntegrationSchema.optional(),
  livestream: LivestreamIntegrationSchema.optional(),
});
export type Integrations = z.infer<typeof IntegrationsSchema>;

// ── Features ──────────────────────────────────────────────────
export const FeaturesSchema = z.object({
  siwe: z.boolean().default(true),
  livestream: z.boolean().default(false),
});
export type Features = z.infer<typeof FeaturesSchema>;
