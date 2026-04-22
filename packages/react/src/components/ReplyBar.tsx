import React, { useState } from 'react';
import { useCreateReply } from '../hooks/useMutations.js';

export interface ReplyBarProps {
  topicId: number;
}

export function ReplyBar({ topicId }: ReplyBarProps): React.JSX.Element {
  const [body, setBody] = useState('');
  const { mutate, isPending } = useCreateReply();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!body.trim() || isPending) return;
    mutate(
      { topicId, body },
      { onSuccess: () => setBody('') },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--polis-bg-card)',
        borderTop: '1px solid var(--polis-border)',
      }}
    >
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply..."
        disabled={isPending}
        style={{
          flex: 1,
          padding: '0.625rem 1rem',
          background: 'var(--polis-bg-surface)',
          border: '1px solid var(--polis-border)',
          borderRadius: 'var(--polis-radius-md)',
          color: 'var(--polis-text-primary)',
          fontSize: '0.875rem',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={!body.trim() || isPending}
        style={{
          padding: '0.625rem 1.25rem',
          background: body.trim() ? 'var(--polis-primary)' : 'var(--polis-border)',
          color: body.trim() ? 'var(--polis-bg-deep)' : 'var(--polis-text-muted)',
          border: 'none',
          borderRadius: 'var(--polis-radius-md)',
          cursor: body.trim() ? 'pointer' : 'default',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {isPending ? '...' : 'Send'}
      </button>
    </form>
  );
}
