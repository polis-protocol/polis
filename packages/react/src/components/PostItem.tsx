import React from 'react';
import type { PostData } from '../hooks/useTopics.js';

export interface PostItemProps {
  post: PostData;
  isOriginal?: boolean;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PostItem({ post, isOriginal }: PostItemProps): React.JSX.Element {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--polis-border)',
        background: isOriginal ? 'var(--polis-bg-surface)' : 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--polis-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            color: 'var(--polis-text-secondary)',
            fontWeight: 600,
          }}
        >
          {post.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ color: 'var(--polis-text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
            {post.username}
          </div>
          <div style={{ color: 'var(--polis-text-muted)', fontSize: '0.75rem' }}>
            {timeAgo(post.createdAt)}
          </div>
        </div>
      </div>
      <div
        className="polis-post-content"
        style={{
          color: 'var(--polis-text-primary)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: post.cooked }}
      />
    </div>
  );
}
