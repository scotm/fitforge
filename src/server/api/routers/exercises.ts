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
import { exercises as exercisesTable } from "~/server/db/schema";

import OpenAI from "openai";

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
          how_to_perform: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!exercise) throw new Error("Exercise not found");

      const client = new OpenAI({
        baseURL: "http://localhost:11434/v1/",
        apiKey: "fake-api-key",
      });
      console.log("generating response");
      const chatCompletion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant, and you are very good at writing detailed summaries of physical exercises.",
          },
          {
            role: "user",
            content: `Write a detailed set of step by step instructions for the exercise ${exercise.name}. Use Markdown. Do not include any other text. Only include the instructions.`,
          },
        ],
        model: "llama3.1:latest",
      });
      const response = chatCompletion.choices[0]?.message;
      console.log(response);
      if (response?.content) {
        await ctx.db
          .update(exercisesTable)
          .set({
            how_to_perform: response.content,
          })
          .where(eq(exercisesTable.id, exercise.id));
      }
    }),
});
