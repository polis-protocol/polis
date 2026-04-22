'use client';

import { TopicView } from '@polis/react';
import { useParams } from 'next/navigation';

export default function TopicPage() {
  const params = useParams();
  const id = Number(params.id);
  return <TopicView id={id} />;
}
