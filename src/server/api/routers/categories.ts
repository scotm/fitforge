import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.input(z.object({})).query(async ({ ctx }) => {
    const categories = await ctx.db.query.category.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
      columns: {
        id: true,
        name: true,
      },
    });

    return {
      items: categories.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
      })),
    };
  }),
});
