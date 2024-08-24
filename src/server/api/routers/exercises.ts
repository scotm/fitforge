import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exercisesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.db.query.exercises.findMany({
      orderBy: (exercises, { desc }) => [desc(exercises.createdAt)],
      columns: {
        id: true,
        name: true,
        how_to_perform: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        category: true,
        licence: true,
        muscles: {
          with: {
            muscles: true,
          },
        },
        equipment: {
          with: {
            equipment: true,
          },
        },
      },
    });

    if (!exercises) {
      return null;
    }

    return exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      how_to_perform: exercise.how_to_perform,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      category: exercise.category.name,
      licence: exercise.licence.full_name,
      equipment: exercise.equipment.map((equipment) => ({
        p: equipment.equipment.id,
        d: equipment.equipment.name,
      })),
    }));
  }),
});
