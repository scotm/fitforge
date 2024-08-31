import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { count, eq, type TableConfig } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { type SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  exercises as exercisesTable,
  equipment as equipmentTable,
  exerciseToEquipment,
} from "~/server/db/schema";

import { getExerciseChatCompletion } from "@/lib/llms";

const getRowCount = async <
  T extends TableConfig,
  K extends Record<string, unknown>,
>(
  db: LibSQLDatabase<K>,
  table: SQLiteTableWithColumns<T>,
) => {
  const totalResult = await db.select({ count: count() }).from(table);
  return totalResult[0]?.count ?? 0;
};

export const exercisesRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const exercise = await ctx.db.query.exercises.findFirst({
        where: (exercises, { eq }) => eq(exercises.id, input.id),
        columns: {
          id: true,
          name: true,
          how_to_perform: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          category: true,
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

      return exercise;
    }),
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().optional(),
        categoryId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = input.page ?? 0;

      const totalItems = await getRowCount(ctx.db, exercisesTable);

      const exercises = await ctx.db.query.exercises.findMany({
        offset: page * DEFAULT_PAGE_SIZE,
        limit: DEFAULT_PAGE_SIZE,
        orderBy: (exercises, { asc }) => [asc(exercises.name)],
        where: (exercises, { eq }) =>
          input.categoryId
            ? eq(exercises.categoryId, input.categoryId)
            : undefined,
        columns: {
          id: true,
          name: true,
          how_to_perform: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          category: true,
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

      return {
        page,
        totalItems,
        hasNextPage: page < totalItems / DEFAULT_PAGE_SIZE,
        items: exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          how_to_perform: exercise.how_to_perform,
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
          category: exercise.category.name,
          equipment: exercise.equipment.map((equipment) => ({
            id: equipment.equipment.id,
            name: equipment.equipment.name,
          })),
          muscles: exercise.muscles.map((muscle) => ({
            id: muscle.muscles.id,
            name: muscle.muscles.name,
          })),
        })),
      };
    }),
  UpdateExerciseDescriptionWithAI: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const cat = ctx.db.select().from(category);
      const exercise = await ctx.db.query.exercises.findFirst({
        where: (exercises, { eq }) => eq(exercises.id, input.id),
        columns: {
          id: true,
          name: true,
        },
      });
      if (!exercise) throw new Error("Exercise not found");

      const response = await getExerciseChatCompletion(exercise);
      console.log(response);
      if (response) {
        await ctx.db
          .update(exercisesTable)
          .set({
            short_summary: response.short_summary,
            how_to_perform: response.how_to_perform,
          })
          .where(eq(exercisesTable.id, exercise.id));
        if (response.equipment_used.length > 0) {
          const equipment_available = await ctx.db.query.equipment.findMany({
            columns: {
              id: true,
              name: true,
            },
          });
          const equipmentToInsert = response.equipment_used.filter((x) => {
            return !equipment_available.some(
              (y) => y.name?.toLocaleLowerCase() === x.toLocaleLowerCase(),
            );
          });
          for (const equipment of equipmentToInsert) {
            const equipmentId = await ctx.db
              .insert(equipmentTable)
              .values({
                name: equipment,
              })
              .returning({ insertedId: equipmentTable.id });
            if (!equipmentId[0]) continue;
            await ctx.db.insert(exerciseToEquipment).values({
              equipmentId: equipmentId[0].insertedId,
              exerciseId: exercise.id,
            });
          }
        }
      }
    }),
});
