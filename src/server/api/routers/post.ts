import { z } from "zod";
import cuid from "cuid";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.db.database.from('Post').insert({
        id: cuid(),
        name: input.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).select().single();
      if (error) throw new Error(error.message);
      return data;
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.db.database.from('Post')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? null;
  }),
});
