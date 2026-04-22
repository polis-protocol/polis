'use client';

import { CommunityHero, LiveBanner, CategoryList, LatestTopics } from '@polisprotocol/react';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const router = useRouter();

  return (
    <>
      <CommunityHero />
      <LiveBanner />
      <CategoryList onCategoryClick={(slug) => router.push(`/community/c/${slug}`)} />
      <LatestTopics onTopicClick={(id) => router.push(`/community/t/${id}`)} />
    </>
  );
}
