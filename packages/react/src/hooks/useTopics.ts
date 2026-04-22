import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGqlClient } from '../providers/PolisProvider.js';

const TOPICS_QUERY = gql`
  query Topics($categorySlug: String!, $categoryId: Int!) {
    topics(categorySlug: $categorySlug, categoryId: $categoryId) {
      id
      title
      slug
      postsCount
      views
      pinned
      closed
      createdAt
      lastPostedAt
    }
  }
`;

const TOPIC_QUERY = gql`
  query Topic($id: Int!) {
    topic(id: $id) {
      id
      title
      slug
      postsCount
      views
      pinned
      closed
      createdAt
      lastPostedAt
    }
    topicPosts(topicId: $id) {
      id
      topicId
      userId
      username
      cooked
      raw
      replyToPostNumber
      createdAt
    }
  }
`;

export interface TopicData {
  id: number;
  title: string;
  slug: string;
  postsCount: number;
  views: number;
  pinned: boolean;
  closed: boolean;
  createdAt: string;
  lastPostedAt: string | null;
}

export interface PostData {
  id: number;
  topicId: number;
  userId: number;
  username: string;
  cooked: string;
  raw?: string;
  replyToPostNumber: number | null;
  createdAt: string;
}

export function useTopics(categorySlug: string, categoryId: number) {
  const client = useGqlClient();

  return useQuery({
    queryKey: ['polis', 'topics', categorySlug],
    queryFn: async () => {
      const data = await client.request<{ topics: TopicData[] }>(TOPICS_QUERY, {
        categorySlug,
        categoryId,
      });
      return data.topics;
    },
    staleTime: 30_000,
  });
}

export function useTopic(id: number) {
  const client = useGqlClient();

  return useQuery({
    queryKey: ['polis', 'topic', id],
    queryFn: async () => {
      const data = await client.request<{
        topic: TopicData | null;
        topicPosts: PostData[];
      }>(TOPIC_QUERY, { id });
      return data;
    },
    staleTime: 15_000,
    enabled: id > 0,
  });
}
