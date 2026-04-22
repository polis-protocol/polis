import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories.js';
import { useCreateTopic } from '../hooks/useMutations.js';

export interface ComposeDialogProps {
  open: boolean;
  onClose: () => void;
  defaultCategorySlug?: string;
  onSuccess?: (topicId: number) => void;
}

export function ComposeDialog({
  open,
  onClose,
  defaultCategorySlug,
  onSuccess,
}: ComposeDialogProps): React.JSX.Element | null {
  const { data: categories } = useCategories();
  const { mutate, isPending } = useCreateTopic();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!open) return null;

  const defaultCategory = categories?.find((c) => c.slug === defaultCategorySlug);
  const activeCategoryId = selectedCategoryId ?? defaultCategory?.id ?? categories?.[0]?.id;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !activeCategoryId || isPending) return;
    mutate(
      { title, body, categoryId: activeCategoryId },
      {
        onSuccess: (topic) => {
          setTitle('');
          setBody('');
          onClose();
          onSuccess?.(topic.id);
        },
      },
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--polis-bg-deep)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--polis-border)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--polis-text-secondary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Cancel
        </button>
        <span style={{ color: 'var(--polis-text-primary)', fontWeight: 600 }}>New Topic</span>
        <button
          onClick={handleSubmit as () => void}
          disabled={!title.trim() || !body.trim() || !activeCategoryId || isPending}
          style={{
            background: 'var(--polis-primary)',
            color: 'var(--polis-bg-deep)',
            border: 'none',
            borderRadius: 'var(--polis-radius-md)',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            opacity: !title.trim() || !body.trim() ? 0.5 : 1,
          }}
        >
          {isPending ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {/* Category selector */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '1rem 1.5rem',
          overflowX: 'auto',
          borderBottom: '1px solid var(--polis-border)',
        }}
      >
        {categories?.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategoryId(cat.id)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--polis-radius-xl)',
              border: `1px solid ${activeCategoryId === cat.id ? cat.color : 'var(--polis-border)'}`,
              background: activeCategoryId === cat.id ? `${cat.color}20` : 'transparent',
              color: activeCategoryId === cat.id ? cat.color : 'var(--polis-text-secondary)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Topic title..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--polis-font-serif)',
            fontSize: '1.5rem',
            color: 'var(--polis-text-primary)',
            marginBottom: '1rem',
          }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your thoughts..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--polis-font-sans)',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--polis-text-primary)',
          }}
        />
      </form>
    </div>
  );
}
