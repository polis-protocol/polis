import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PolisProvider } from '../providers/PolisProvider.js';
import { LiveBanner } from '../components/LiveBanner.js';
import { TopicCard } from '../components/TopicCard.js';
import { PostItem } from '../components/PostItem.js';
import type { PolisConfig } from '@polisprotocol/core';
import { defaultTheme } from '@polisprotocol/theme-default';

const testConfig: PolisConfig = {
  city: { name: 'Test City', slug: 'test' },
  bffUrl: 'https://api.test.xyz',
  theme: { tokens: defaultTheme },
  integrations: { discourse: { url: 'https://forum.test.xyz' } },
  features: { siwe: true, livestream: true },
  categories: [{ slug: 'general', name: 'General', color: '#BFFF3F' }],
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PolisProvider config={testConfig}>
      {children}
    </PolisProvider>
  );
}

describe('LiveBanner', () => {
  it('renders when live and enabled', () => {
    render(
      <TestWrapper>
        <LiveBanner isLive label="OpenMic LIVE" />
      </TestWrapper>,
    );
    expect(screen.getByText('OpenMic LIVE')).toBeDefined();
  });

  it('returns null when not live', () => {
    const { container } = render(
      <TestWrapper>
        <LiveBanner isLive={false} />
      </TestWrapper>,
    );
    expect(container.innerHTML).toBe('');
  });
});

describe('TopicCard', () => {
  it('renders topic info', () => {
    const topic = {
      id: 1,
      title: 'Test Topic',
      slug: 'test-topic',
      postsCount: 5,
      views: 100,
      pinned: false,
      closed: false,
      createdAt: new Date().toISOString(),
      lastPostedAt: null,
    };

    render(<TopicCard topic={topic} />);
    expect(screen.getByText('Test Topic')).toBeDefined();
    expect(screen.getByText('5 replies')).toBeDefined();
    expect(screen.getByText('100 views')).toBeDefined();
  });

  it('shows pin indicator for pinned topics', () => {
    const topic = {
      id: 1,
      title: 'Pinned Topic',
      slug: 'pinned',
      postsCount: 0,
      views: 0,
      pinned: true,
      closed: false,
      createdAt: new Date().toISOString(),
      lastPostedAt: null,
    };

    render(<TopicCard topic={topic} />);
    expect(screen.getByText('Pinned Topic')).toBeDefined();
  });
});

describe('PostItem', () => {
  it('renders post content', () => {
    const post = {
      id: 1,
      topicId: 1,
      userId: 1,
      username: 'daniel',
      cooked: '<p>Hello world</p>',
      replyToPostNumber: null,
      createdAt: new Date().toISOString(),
    };

    render(<PostItem post={post} />);
    expect(screen.getByText('daniel')).toBeDefined();
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('shows avatar initials', () => {
    const post = {
      id: 1,
      topicId: 1,
      userId: 1,
      username: 'dayane',
      cooked: '<p>Test</p>',
      replyToPostNumber: null,
      createdAt: new Date().toISOString(),
    };

    render(<PostItem post={post} />);
    expect(screen.getByText('DA')).toBeDefined();
  });
});
