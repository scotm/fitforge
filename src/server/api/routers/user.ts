import {
  defaultDistanceUnit,
  defaultGenderOptions,
  defaultHeightUnit,
  defaultWeightUnit,
} from "@/lib/constants";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { type NewUser } from "~/server/db/tablesSchemas/users";

export const userRouter = createTRPCRouter({
  invite: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user: NewUser = {
        name: input.name,
        email: input.email,
      };
      await ctx.db.insert(users).values(user);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ctx.session.user.id),
      });

      return user;
    }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        defaultWeightUnit: z.enum(defaultWeightUnit).optional(),
        defaultDistanceUnit: z.enum(defaultDistanceUnit).optional(),
        defaultHeightUnit: z.enum(defaultHeightUnit).optional(),
        phoneNumber: z.string().optional(),
        birthdate: z.date().optional(),
        height: z.number().optional(),
        gender: z.enum(defaultGenderOptions).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.session.user.id));
    }),
});
