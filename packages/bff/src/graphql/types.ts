import { builder } from './builder.js';

// ── Category ──────────────────────────────────────────────────
export const CategoryType = builder.objectRef<{
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  topicCount: number;
  postCount: number;
}>('Category');

builder.objectType(CategoryType, {
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    color: t.exposeString('color'),
    description: t.exposeString('description', { nullable: true }),
    topicCount: t.exposeInt('topicCount'),
    postCount: t.exposeInt('postCount'),
  }),
});

// ── Topic ─────────────────────────────────────────────────────
export const TopicType = builder.objectRef<{
  id: number;
  title: string;
  slug: string;
  postsCount: number;
  views: number;
  pinned: boolean;
  closed: boolean;
  createdAt: Date;
  lastPostedAt: Date | null;
  categoryId?: number;
}>('Topic');

builder.objectType(TopicType, {
  fields: (t) => ({
    id: t.exposeInt('id'),
    title: t.exposeString('title'),
    slug: t.exposeString('slug'),
    postsCount: t.exposeInt('postsCount'),
    views: t.exposeInt('views'),
    pinned: t.exposeBoolean('pinned'),
    closed: t.exposeBoolean('closed'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    lastPostedAt: t.expose('lastPostedAt', { type: 'DateTime', nullable: true }),
  }),
});

// ── Post ──────────────────────────────────────────────────────
export const PostType = builder.objectRef<{
  id: number;
  topicId: number;
  userId: number;
  username: string;
  cooked: string;
  raw?: string;
  replyToPostNumber: number | null;
  createdAt: Date;
}>('Post');

builder.objectType(PostType, {
  fields: (t) => ({
    id: t.exposeInt('id'),
    topicId: t.exposeInt('topicId'),
    userId: t.exposeInt('userId'),
    username: t.exposeString('username'),
    cooked: t.exposeString('cooked'),
    raw: t.exposeString('raw', { nullable: true }),
    replyToPostNumber: t.exposeInt('replyToPostNumber', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});
