import React from 'react';
import { useTopic } from '../hooks/useTopics.js';
import { PostItem } from './PostItem.js';
import { ReplyBar } from './ReplyBar.js';

export interface TopicViewProps {
  id: number;
  onBack?: () => void;
}

export function TopicView({ id, onBack }: TopicViewProps): React.JSX.Element {
  const { data, isLoading, error } = useTopic(id);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div
          style={{
            height: '32px',
            width: '60%',
            background: 'var(--polis-bg-card)',
            borderRadius: 'var(--polis-radius-md)',
            marginBottom: '1rem',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            height: '200px',
            background: 'var(--polis-bg-card)',
            borderRadius: 'var(--polis-radius-lg)',
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  if (error || !data?.topic) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--polis-text-muted)' }}>
        Topic not found
      </div>
    );
  }

  const { topic, topicPosts } = data;
  const [firstPost, ...replies] = topicPosts;

  return (
    <div className="polis-topic-view" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--polis-border)' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--polis-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '0.75rem',
              padding: 0,
            }}
          >
            &larr; Back
          </button>
        )}
        <h1
          style={{
            fontFamily: 'var(--polis-font-serif)',
            fontSize: '1.5rem',
            color: 'var(--polis-text-primary)',
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}
        >
          {topic.title}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--polis-text-muted)', fontSize: '0.8125rem' }}>
          <span>{topic.views} views</span>
          <span>{topic.postsCount} replies</span>
        </div>
      </div>

      {/* Original post */}
      {firstPost && <PostItem post={firstPost} isOriginal />}

      {/* Replies */}
      {replies.length > 0 && (
        <div>
          <div
            style={{
              padding: '0.75rem 1.5rem',
              color: 'var(--polis-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderBottom: '1px solid var(--polis-border)',
            }}
          >
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </div>
          {replies.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Reply bar */}
      <ReplyBar topicId={id} />
    </div>
  );
}
