'use client';

import { TopicView } from '@polisprotocol/react';
import { useRouter, useParams } from 'next/navigation';

export default function TopicPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  return <TopicView id={id} onBack={() => router.back()} />;
}
