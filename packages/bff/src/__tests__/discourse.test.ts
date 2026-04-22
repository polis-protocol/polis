import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscourseClient } from '../adapters/discourse.js';

describe('DiscourseClient', () => {
  let client: DiscourseClient;

  beforeEach(() => {
    client = new DiscourseClient({
      baseUrl: 'https://forum.test.xyz',
      apiKey: 'test-key',
      apiUsername: 'system',
    });
  });

  it('creates instance with correct config', () => {
    expect(client).toBeDefined();
  });

  it('strips trailing slash from baseUrl', () => {
    const c = new DiscourseClient({
      baseUrl: 'https://forum.test.xyz/',
      apiKey: 'key',
    });
    expect(c).toBeDefined();
  });

  it('listCategories calls correct endpoint', async () => {
    const mockResponse = {
      category_list: {
        categories: [
          {
            id: 1,
            name: 'General',
            slug: 'general',
            color: 'BFFF3F',
            description: 'General discussion',
            topic_count: 10,
            post_count: 50,
          },
        ],
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const categories = await client.listCategories();
    expect(categories).toHaveLength(1);
    expect(categories[0]?.name).toBe('General');
    expect(categories[0]?.slug).toBe('general');

    vi.restoreAllMocks();
  });

  it('retries on 5xx errors', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            category_list: {
              categories: [
                { id: 1, name: 'Test', slug: 'test', color: '000000', topic_count: 0, post_count: 0 },
              ],
            },
          }),
      } as Response);

    const categories = await client.listCategories();
    expect(categories).toHaveLength(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it('throws after 3 failed attempts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server Error'),
    } as Response);

    await expect(client.listCategories()).rejects.toThrow('Discourse API error 500');

    vi.restoreAllMocks();
  });
});
