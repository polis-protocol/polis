import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGqlClient } from '../providers/PolisProvider.js';
import type { TopicData, PostData } from './useTopics.js';

const CREATE_TOPIC_MUTATION = gql`
  mutation CreateTopic($title: String!, $body: String!, $categoryId: Int!) {
    createTopic(title: $title, body: $body, categoryId: $categoryId) {
      id
      title
      slug
      postsCount
      views
      pinned
      closed
      createdAt
      lastPostedAt
    }
  }
`;

const CREATE_REPLY_MUTATION = gql`
  mutation CreateReply($topicId: Int!, $body: String!) {
    createReply(topicId: $topicId, body: $body) {
      id
      topicId
      userId
      username
      cooked
      raw
      replyToPostNumber
      createdAt
    }
  }
`;

export function useCreateTopic() {
  const client = useGqlClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { title: string; body: string; categoryId: number }) => {
      const data = await client.request<{ createTopic: TopicData }>(
        CREATE_TOPIC_MUTATION,
        variables,
      );
      return data.createTopic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polis', 'topics'] });
    },
  });
}

export function useCreateReply() {
  const client = useGqlClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { topicId: number; body: string }) => {
      const data = await client.request<{ createReply: PostData }>(
        CREATE_REPLY_MUTATION,
        variables,
      );
      return data.createReply;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polis', 'topic', variables.topicId] });
    },
  });
}
