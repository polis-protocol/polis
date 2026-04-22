import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGqlClient } from '../providers/PolisProvider.js';

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      slug
      color
      description
      topicCount
      postCount
    }
  }
`;

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  topicCount: number;
  postCount: number;
}

export function useCategories() {
  const client = useGqlClient();

  return useQuery({
    queryKey: ['polis', 'categories'],
    queryFn: async () => {
      const data = await client.request<{ categories: CategoryData[] }>(CATEGORIES_QUERY);
      return data.categories;
    },
    staleTime: 60_000,
  });
}
