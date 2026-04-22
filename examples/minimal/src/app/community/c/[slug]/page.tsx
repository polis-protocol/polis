'use client';

import { CategoryView } from '@polis/react';
import { useParams } from 'next/navigation';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  return <CategoryView slug={slug} />;
}
