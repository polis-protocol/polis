'use client';

import { CategoryView } from '@polisprotocol/react';
import { useRouter, useParams } from 'next/navigation';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <CategoryView
      slug={slug}
      onTopicClick={(id) => router.push(`/community/t/${id}`)}
      onCreateTopic={() => {
        // TODO: open compose dialog
      }}
    />
  );
}
