import { describe, it, expect } from 'vitest';
import {
  CitySchema,
  CategorySchema,
  UserSchema,
  TopicSchema,
  PostSchema,
  CreateTopicSchema,
  CreateReplySchema,
  FeaturesSchema,
} from '../schema.js';

describe('CitySchema', () => {
  it('validates a valid city', () => {
    const result = CitySchema.safeParse({ name: 'Ipê City', slug: 'ipe', cityId: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = CitySchema.safeParse({ name: '', slug: 'ipe' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug characters', () => {
    const result = CitySchema.safeParse({ name: 'Test', slug: 'Invalid Slug!' });
    expect(result.success).toBe(false);
  });

  it('allows city without cityId', () => {
    const result = CitySchema.safeParse({ name: 'Demo City', slug: 'demo' });
    expect(result.success).toBe(true);
  });
});

describe('CategorySchema', () => {
  it('validates a full category', () => {
    const result = CategorySchema.safeParse({
      slug: 'network-state',
      name: 'Network State & Theory',
      color: '#F59E0B',
      live: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid hex color', () => {
    const result = CategorySchema.safeParse({
      slug: 'test',
      name: 'Test',
      color: 'red',
    });
    expect(result.success).toBe(false);
  });

  it('allows optional fields', () => {
    const result = CategorySchema.safeParse({
      slug: 'lounge',
      name: 'Lounge',
      color: '#EF4444',
    });
    expect(result.success).toBe(true);
  });
});

describe('UserSchema', () => {
  it('validates a valid user', () => {
    const result = UserSchema.safeParse({
      id: 1,
      walletAddress: '0x1234567890abcdef',
      displayName: 'Daniel',
      createdAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('coerces date strings', () => {
    const result = UserSchema.safeParse({
      id: 1,
      walletAddress: '0xabc',
      createdAt: '2026-04-22T00:00:00Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdAt).toBeInstanceOf(Date);
    }
  });
});

describe('TopicSchema', () => {
  it('validates a topic with defaults', () => {
    const result = TopicSchema.safeParse({
      id: 1,
      title: 'Hello World',
      categorySlug: 'general',
      authorId: 1,
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postsCount).toBe(0);
      expect(result.data.pinned).toBe(false);
    }
  });

  it('rejects title exceeding 300 chars', () => {
    const result = TopicSchema.safeParse({
      id: 1,
      title: 'a'.repeat(301),
      categorySlug: 'general',
      authorId: 1,
      createdAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe('PostSchema', () => {
  it('validates a valid post', () => {
    const result = PostSchema.safeParse({
      id: 1,
      topicId: 1,
      authorId: 1,
      body: 'Hello!',
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
  });
});

describe('CreateTopicSchema', () => {
  it('validates create topic input', () => {
    const result = CreateTopicSchema.safeParse({
      title: 'My First Topic',
      body: 'This is the body',
      categorySlug: 'general',
    });
    expect(result.success).toBe(true);
  });

  it('rejects too short title', () => {
    const result = CreateTopicSchema.safeParse({
      title: 'ab',
      body: 'body',
      categorySlug: 'general',
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateReplySchema', () => {
  it('validates reply input', () => {
    const result = CreateReplySchema.safeParse({
      topicId: 42,
      body: 'Great point!',
    });
    expect(result.success).toBe(true);
  });
});

describe('FeaturesSchema', () => {
  it('applies defaults', () => {
    const result = FeaturesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.siwe).toBe(true);
      expect(result.data.livestream).toBe(false);
    }
  });
});
