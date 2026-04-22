'use client';

import { CommunityHero, CategoryList, LatestTopics } from '@polisprotocol/react';

export default function CommunityPage() {
  return (
    <>
      <CommunityHero />
      <CategoryList />
      <LatestTopics limit={5} />
    </>
  );
}
