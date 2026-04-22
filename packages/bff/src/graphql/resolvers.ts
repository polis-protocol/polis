import { builder, NotFoundError, UnauthorizedError, ValidationError } from './builder.js';
import { CategoryType, TopicType, PostType } from './types.js';

// ── Queries ───────────────────────────────────────────────────
builder.queryType({
  fields: (t) => ({
    categories: t.field({
      type: [CategoryType],
      resolve: async (_root, _args, ctx) => {
        const categories = await ctx.discourse.listCategories();
        return categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          color: `#${c.color}`,
          description: c.description ?? null,
          topicCount: c.topic_count,
          postCount: c.post_count,
        }));
      },
    }),

    topics: t.field({
      type: [TopicType],
      args: {
        categorySlug: t.arg.string({ required: true }),
        categoryId: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const topics = await ctx.discourse.getTopicsInCategory(
          args.categorySlug,
          args.categoryId,
        );
        return topics.map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          postsCount: t.posts_count,
          views: t.views,
          pinned: t.pinned,
          closed: t.closed,
          createdAt: new Date(t.created_at),
          lastPostedAt: t.last_posted_at ? new Date(t.last_posted_at) : null,
        }));
      },
    }),

    topic: t.field({
      type: TopicType,
      nullable: true,
      args: {
        id: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        try {
          const topic = await ctx.discourse.getTopic(args.id);
          return {
            id: topic.id,
            title: topic.title,
            slug: topic.slug,
            postsCount: topic.posts_count,
            views: topic.views,
            pinned: topic.pinned,
            closed: topic.closed,
            createdAt: new Date(topic.created_at),
            lastPostedAt: topic.last_posted_at ? new Date(topic.last_posted_at) : null,
            categoryId: topic.category_id,
          };
        } catch {
          return null;
        }
      },
    }),

    topicPosts: t.field({
      type: [PostType],
      args: {
        topicId: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const topic = await ctx.discourse.getTopic(args.topicId);
        return topic.post_stream.posts.map((p) => ({
          id: p.id,
          topicId: p.topic_id,
          userId: p.user_id,
          username: p.username,
          cooked: p.cooked,
          raw: p.raw,
          replyToPostNumber: p.reply_to_post_number ?? null,
          createdAt: new Date(p.created_at),
        }));
      },
    }),
  }),
});

// ── Mutations ─────────────────────────────────────────────────
builder.mutationType({
  fields: (t) => ({
    createTopic: t.field({
      type: TopicType,
      args: {
        title: t.arg.string({ required: true }),
        body: t.arg.string({ required: true }),
        categoryId: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.userId) {
          throw new UnauthorizedError('Must be signed in to create topics');
        }
        if (args.title.length < 3) {
          throw new ValidationError('Title must be at least 3 characters');
        }
        const result = await ctx.discourse.createPost({
          title: args.title,
          raw: args.body,
          category: args.categoryId,
        });
        const topic = await ctx.discourse.getTopic(result.topic_id);
        return {
          id: topic.id,
          title: topic.title,
          slug: topic.slug,
          postsCount: topic.posts_count,
          views: topic.views,
          pinned: topic.pinned,
          closed: topic.closed,
          createdAt: new Date(topic.created_at),
          lastPostedAt: topic.last_posted_at ? new Date(topic.last_posted_at) : null,
          categoryId: topic.category_id,
        };
      },
    }),

    createReply: t.field({
      type: PostType,
      args: {
        topicId: t.arg.int({ required: true }),
        body: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.userId) {
          throw new UnauthorizedError('Must be signed in to reply');
        }
        if (!args.body.trim()) {
          throw new ValidationError('Reply body cannot be empty');
        }
        const result = await ctx.discourse.createReply(args.topicId, args.body);
        const topic = await ctx.discourse.getTopic(args.topicId);
        const post = topic.post_stream.posts.find((p) => p.id === result.id);
        if (!post) throw new NotFoundError('Post not found after creation');
        return {
          id: post.id,
          topicId: post.topic_id,
          userId: post.user_id,
          username: post.username,
          cooked: post.cooked,
          raw: post.raw,
          replyToPostNumber: post.reply_to_post_number ?? null,
          createdAt: new Date(post.created_at),
        };
      },
    }),
  }),
});
