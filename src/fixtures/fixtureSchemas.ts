import { z } from "zod";
export const categorySchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      name: z.string(),
    }),
  }),
);

export const equipmentSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      name: z.string(),
    }),
  }),
);

export const muscleSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      name: z.string(),
      is_front: z.boolean(),
      name_en: z.string(),
    }),
  }),
);

export const licenceSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      full_name: z.string(),
      short_name: z.string(),
      url: z.string().url(),
    }),
  }),
);

export const translationSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      licence: z.number().optional(),
      licence_title: z.string().optional(),
      licence_object_url: z.string().optional(),
      licence_author: z.string().optional(),
      licence_author_url: z.string().optional(),
      licence_derivative_source_url: z.string().optional(),
      description: z.string(),
      name: z.string(),
      created: z.string().datetime(),
      last_update: z.string().datetime(),
      language: z.number(),
      uuid: z.string(),
      exercise_base: z.number(),
    }),
  }),
);

export const exerciseBaseSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      license: z.number(),
      license_title: z.string(),
      license_object_url: z.string(),
      license_author: z.string().nullable(),
      license_author_url: z.string(),
      license_derivative_source_url: z.string(),
      uuid: z.string(),
      category: z.number(),
      variations: z.number().nullable(),
      created: z.string().datetime(),
      last_update: z.string().datetime(),
      muscles: z.array(z.number()),
      muscles_secondary: z.array(z.number()),
      equipment: z.array(z.number()),
    }),
  }),
);
