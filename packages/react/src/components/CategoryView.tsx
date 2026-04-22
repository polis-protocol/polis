import React from 'react';
import { useCategories } from '../hooks/useCategories.js';
import { useTopics } from '../hooks/useTopics.js';
import { TopicCard } from './TopicCard.js';

export interface CategoryViewProps {
  slug: string;
  onTopicClick?: (id: number) => void;
  onCreateTopic?: () => void;
}

export function CategoryView({ slug, onTopicClick, onCreateTopic }: CategoryViewProps): React.JSX.Element {
  const { data: categories } = useCategories();
  const category = categories?.find((c) => c.slug === slug);
  const { data: topics, isLoading } = useTopics(slug, category?.id ?? 0);

  if (!category) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--polis-text-muted)' }}>
        Category not found
      </div>
    );
  }

  return (
    <div className="polis-category-view">
      {/* Category header */}
      <div
        style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid var(--polis-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: category.color,
            }}
          />
          <h1
            style={{
              fontFamily: 'var(--polis-font-serif)',
              fontSize: '1.75rem',
              color: 'var(--polis-text-primary)',
            }}
          >
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p style={{ color: 'var(--polis-text-secondary)', fontSize: '0.9375rem' }}>
            {category.description}
          </p>
        )}
        <div style={{ color: 'var(--polis-text-muted)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
          {category.topicCount} topics · {category.postCount} posts
        </div>
      </div>

      {/* Topics list */}
      <div style={{ padding: '1.5rem' }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '70px',
                background: 'var(--polis-bg-card)',
                borderRadius: 'var(--polis-radius-md)',
                marginBottom: '0.5rem',
                opacity: 0.5,
              }}
            />
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topics?.map((topic) => (
              <TopicCard key={topic.id} topic={topic} onClick={onTopicClick} />
            ))}
            {(!topics || topics.length === 0) && (
              <p style={{ color: 'var(--polis-text-muted)', textAlign: 'center', padding: '2rem' }}>
                No topics in this category yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* FAB — Create topic */}
      {onCreateTopic && (
        <button
          onClick={onCreateTopic}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--polis-primary)',
            color: 'var(--polis-bg-deep)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      )}
    </div>
  );
}
