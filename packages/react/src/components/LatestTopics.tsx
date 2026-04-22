import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGqlClient } from '../providers/PolisProvider.js';
import { TopicCard } from './TopicCard.js';
import type { TopicData } from '../hooks/useTopics.js';

const LATEST_TOPICS_QUERY = gql`
  query LatestTopics($categorySlug: String!, $categoryId: Int!) {
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

export interface LatestTopicsProps {
  limit?: number;
  categorySlug?: string;
  categoryId?: number;
  onTopicClick?: (id: number) => void;
}

export function LatestTopics({
  limit = 4,
  categorySlug = 'general',
  categoryId = 1,
  onTopicClick,
}: LatestTopicsProps): React.JSX.Element {
  const client = useGqlClient();

  const { data, isLoading } = useQuery({
    queryKey: ['polis', 'latest-topics', categorySlug],
    queryFn: async () => {
      const result = await client.request<{ topics: TopicData[] }>(LATEST_TOPICS_QUERY, {
        categorySlug,
        categoryId,
      });
      return result.topics.slice(0, limit);
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--polis-font-serif)',
            color: 'var(--polis-text-primary)',
            fontSize: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          Latest Topics
        </h2>
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '60px',
              background: 'var(--polis-bg-card)',
              borderRadius: 'var(--polis-radius-md)',
              marginBottom: '0.5rem',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2
        style={{
          fontFamily: 'var(--polis-font-serif)',
          color: 'var(--polis-text-primary)',
          fontSize: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        Latest Topics
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data?.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onClick={onTopicClick} />
        ))}
        {(!data || data.length === 0) && (
          <p style={{ color: 'var(--polis-text-muted)', fontSize: '0.875rem' }}>
            No topics yet. Be the first to start a conversation!
          </p>
        )}
      </div>
    </div>
  );
}
