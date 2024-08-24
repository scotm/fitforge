import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const musclesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const muscles = await ctx.db.query.category.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
      columns: {
        id: true,
        name: true,
      },
    });

    return {
      items: muscles.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
      })),
    };
  }),
});
