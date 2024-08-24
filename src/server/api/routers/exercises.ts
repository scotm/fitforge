import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { count, type TableConfig } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { type SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { exercises as exercisesTable, muscles } from "~/server/db/schema";

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
          licence: exercise.licence.short_name,
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
});
