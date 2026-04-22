import React from 'react';
import { usePolisConfig } from '../providers/PolisProvider.js';
import { useCategories } from '../hooks/useCategories.js';

export interface CommunityHeroProps {
  title?: string;
  subtitle?: string;
}

export function CommunityHero({ title, subtitle }: CommunityHeroProps): React.JSX.Element {
  const config = usePolisConfig();
  const { data: categories } = useCategories();

  const totalTopics = categories?.reduce((sum, c) => sum + c.topicCount, 0) ?? 0;
  const totalPosts = categories?.reduce((sum, c) => sum + c.postCount, 0) ?? 0;

  return (
    <section
      className="polis-hero"
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--polis-bg-deep)',
        borderBottom: '1px solid var(--polis-border)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--polis-font-serif)',
          fontSize: '2.5rem',
          color: 'var(--polis-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {title ?? `${config.city.name} Community`}
      </h1>
      {subtitle && (
        <p
          style={{
            color: 'var(--polis-text-secondary)',
            fontSize: '1.1rem',
            marginBottom: '1.5rem',
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          color: 'var(--polis-text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <span>
          <strong style={{ color: 'var(--polis-primary)' }}>{totalTopics}</strong> topics
        </span>
        <span>
          <strong style={{ color: 'var(--polis-primary)' }}>{totalPosts}</strong> posts
        </span>
        <span>
          <strong style={{ color: 'var(--polis-primary)' }}>{categories?.length ?? 0}</strong>{' '}
          categories
        </span>
      </div>
    </section>
  );
}
