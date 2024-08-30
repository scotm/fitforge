import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const musclesRouter = createTRPCRouter({
  getAll: publicProcedure.input(z.object({})).query(async ({ ctx }) => {
    const muscles = await ctx.db.query.muscles.findMany({
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
