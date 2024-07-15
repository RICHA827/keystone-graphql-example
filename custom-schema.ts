import { graphql } from "@keystone-6/core";
import { Context } from ".keystone/types";

export const extendGraphqlSchema = graphql.extend((base) => {
  const Statistics = graphql.object<{ authorId: string }>()({
    name: "Statistics",
    fields: {
      draft: graphql.field({
        type: graphql.Int,
        resolve: async ({ authorId }, args, context: Context) => {
          return context.query.Post.count({
            where: {
              author: { id: { equals: authorId } },
              status: { equals: "draft" },
            },
          });
        },
      }),
      published: graphql.field({
        type: graphql.Int,
        resolve: async ({ authorId }, args, context: Context) => {
          return context.query.Post.count({
            where: {
              author: { id: { equals: authorId } },
              status: { equals: "published" },
            },
          });
        },
      }),
      latest: graphql.field({
        type: base.object("Post"),
        async resolve({ authorId }, args, context: Context) {
          const [post] = await context.db.Post.findMany({
            take: 1,
            orderBy: { publishDate: "desc" },
            where: { author: { id: { equals: authorId } } },
          });
          return post;
        },
      }),
    },
  });

  return {
    mutation: {
      publishPost: graphql.field({
        type: base.object("Post"),
        args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
        resolve: async (source, { id }, context: Context) => {
          return context.db.Post.updateOne({
            where: { id },
            data: {
              status: "published",
              publishDate: new Date().toISOString(),
            },
          });
        },
      }),
    },
    query: {
      recentPosts: graphql.field({
        type: graphql.list(graphql.nonNull(base.object("Post"))),
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          seconds: graphql.arg({
            type: graphql.nonNull(graphql.Int),
            defaultValue: 600,
          }),
        },
        resolve: async (source, { id, seconds }, context: Context) => {
          const cutoff = new Date(Date.now() - seconds * 1000);

          return context.db.Post.findMany({
            where: {
              author: { id: { equals: id } },
              publishDate: { gt: cutoff },
            },
          });
        },
      }),
      stats: graphql.field({
        type: Statistics,
        args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
        resolve: (source, { id }) => {
          return { authorId: id };
        },
      }),
    },
  };
});
