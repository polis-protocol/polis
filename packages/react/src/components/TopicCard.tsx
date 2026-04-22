import React from 'react';
import type { TopicData } from '../hooks/useTopics.js';

export interface TopicCardProps {
  topic: TopicData;
  onClick?: (id: number) => void;
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

export function TopicCard({ topic, onClick }: TopicCardProps): React.JSX.Element {
  return (
    <button
      onClick={() => onClick?.(topic.id)}
      style={{
        display: 'block',
        width: '100%',
        padding: '1rem',
        background: 'var(--polis-bg-card)',
        border: '1px solid var(--polis-border)',
        borderRadius: 'var(--polis-radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s',
      }}
    >
      <div
        style={{
          color: 'var(--polis-text-primary)',
          fontWeight: 500,
          fontSize: '0.9375rem',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
        }}
      >
        {topic.pinned && (
          <span style={{ color: 'var(--polis-primary)', marginRight: '0.5rem' }}>&#x1F4CC;</span>
        )}
        {topic.title}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          color: 'var(--polis-text-muted)',
          fontSize: '0.75rem',
        }}
      >
        <span>{topic.postsCount} replies</span>
        <span>{topic.views} views</span>
        <span>{timeAgo(topic.createdAt)}</span>
      </div>
    </button>
  );
}
