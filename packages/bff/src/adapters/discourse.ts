import { z } from 'zod';

// ── Response schemas ──────────────────────────────────────────
const DiscourseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  color: z.string(),
  text_color: z.string().optional(),
  description: z.string().nullable().optional(),
  topic_count: z.number(),
  post_count: z.number(),
});

const DiscourseCategoriesResponseSchema = z.object({
  category_list: z.object({
    categories: z.array(DiscourseCategorySchema),
  }),
});

const DiscoursePostSchema = z.object({
  id: z.number(),
  topic_id: z.number(),
  user_id: z.number(),
  username: z.string(),
  cooked: z.string(),
  raw: z.string().optional(),
  reply_to_post_number: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

const DiscourseTopicSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  posts_count: z.number(),
  views: z.number(),
  pinned: z.boolean(),
  closed: z.boolean(),
  created_at: z.string(),
  last_posted_at: z.string().nullable().optional(),
  posters: z.array(z.object({
    user_id: z.number(),
  })).optional(),
});

const DiscourseTopicListResponseSchema = z.object({
  topic_list: z.object({
    topics: z.array(DiscourseTopicSummarySchema),
  }),
});

const DiscourseTopicDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  posts_count: z.number(),
  views: z.number(),
  pinned: z.boolean(),
  closed: z.boolean(),
  created_at: z.string(),
  last_posted_at: z.string().nullable().optional(),
  post_stream: z.object({
    posts: z.array(DiscoursePostSchema),
  }),
  category_id: z.number(),
});

const DiscourseTopicDetailResponseSchema = DiscourseTopicDetailSchema;

const DiscourseCreatePostResponseSchema = z.object({
  id: z.number(),
  topic_id: z.number(),
  topic_slug: z.string().optional(),
});

const DiscourseUserSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    name: z.string().nullable().optional(),
    avatar_template: z.string().optional(),
  }),
});

// ── Exported types ────────────────────────────────────────────
export type DiscourseCategory = z.infer<typeof DiscourseCategorySchema>;
export type DiscoursePost = z.infer<typeof DiscoursePostSchema>;
export type DiscourseTopicSummary = z.infer<typeof DiscourseTopicSummarySchema>;
export type DiscourseTopicDetail = z.infer<typeof DiscourseTopicDetailSchema>;

// ── Client ────────────────────────────────────────────────────
export interface DiscourseClientConfig {
  baseUrl: string;
  apiKey: string;
  apiUsername?: string;
}

export class DiscourseClient {
  private baseUrl: string;
  private apiKey: string;
  private apiUsername: string;

  constructor(config: DiscourseClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.apiUsername = config.apiUsername ?? 'system';
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    schema: z.ZodType<T>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Api-Key': this.apiKey,
      'Api-Username': this.apiUsername,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    let lastError: Error | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Discourse API error ${response.status}: ${body}`);
        }
        const json: unknown = await response.json();
        return schema.parse(json);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 500;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }

  async listCategories(): Promise<DiscourseCategory[]> {
    const data = await this.request(
      '/categories.json',
      { method: 'GET' },
      DiscourseCategoriesResponseSchema,
    );
    return data.category_list.categories;
  }

  async getTopicsInCategory(slug: string, categoryId: number): Promise<DiscourseTopicSummary[]> {
    const data = await this.request(
      `/c/${slug}/${categoryId}.json`,
      { method: 'GET' },
      DiscourseTopicListResponseSchema,
    );
    return data.topic_list.topics;
  }

  async getTopic(id: number): Promise<DiscourseTopicDetail> {
    return this.request(
      `/t/${id}.json`,
      { method: 'GET' },
      DiscourseTopicDetailResponseSchema,
    );
  }

  async createPost(params: {
    title?: string;
    raw: string;
    topic_id?: number;
    category?: number;
  }): Promise<{ id: number; topic_id: number; topic_slug?: string }> {
    return this.request(
      '/posts.json',
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      DiscourseCreatePostResponseSchema,
    );
  }

  async createReply(topicId: number, raw: string): Promise<{ id: number; topic_id: number }> {
    return this.createPost({ topic_id: topicId, raw });
  }

  async getUser(username: string): Promise<z.infer<typeof DiscourseUserSchema>> {
    return this.request(
      `/users/${username}.json`,
      { method: 'GET' },
      DiscourseUserSchema,
    );
  }

  async createUser(params: {
    name: string;
    username: string;
    email: string;
    password: string;
    active: boolean;
    approved: boolean;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/users.json`, {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Api-Username': this.apiUsername,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to create Discourse user: ${response.status} ${body}`);
    }
    return response.json();
  }
}
