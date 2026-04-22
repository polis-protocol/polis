import React from 'react';
import { useCategories } from '../hooks/useCategories.js';

export interface CategoryListProps {
  onCategoryClick?: (slug: string) => void;
}

export function CategoryList({ onCategoryClick }: CategoryListProps): React.JSX.Element {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="polis-category-list" style={{ padding: '1.5rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '80px',
              background: 'var(--polis-bg-card)',
              borderRadius: 'var(--polis-radius-lg)',
              marginBottom: '0.75rem',
              animation: 'polis-shimmer 1.5s ease-in-out infinite',
            }}
          />
        ))}
        <style>{`
          @keyframes polis-shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', color: 'var(--polis-accent-red)' }}>
        Failed to load categories
      </div>
    );
  }

  return (
    <div className="polis-category-list" style={{ padding: '1.5rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {categories?.map((category) => (
          <button
            key={category.slug}
            onClick={() => onCategoryClick?.(category.slug)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              background: 'var(--polis-bg-card)',
              border: '1px solid var(--polis-border)',
              borderRadius: 'var(--polis-radius-lg)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
              width: '100%',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: category.color,
                flexShrink: 0,
                marginTop: '4px',
              }}
            />
            <div>
              <div
                style={{
                  color: 'var(--polis-text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  marginBottom: '0.25rem',
                }}
              >
                {category.name}
              </div>
              {category.description && (
                <div
                  style={{
                    color: 'var(--polis-text-muted)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.4,
                    marginBottom: '0.5rem',
                  }}
                >
                  {category.description}
                </div>
              )}
              <div style={{ color: 'var(--polis-text-muted)', fontSize: '0.75rem' }}>
                {category.topicCount} topics · {category.postCount} posts
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
