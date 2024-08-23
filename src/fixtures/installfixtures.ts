/* eslint-disable drizzle/enforce-delete-with-where */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { z } from "zod";
import { db } from "../server/db";
import { category as categoryTable } from "../server/db/schema";
import { equipment as equipmentTable } from "../server/db/schema";
import { muscles as musclesTable } from "../server/db/schema";
import { licence as licenceTable } from "../server/db/schema";
import TurndownService from "turndown";

const turndownService = new TurndownService();

const categorySchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      name: z.string(),
    }),
  }),
);

const equipmentSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      name: z.string(),
    }),
  }),
);

const muscleSchema = z.array(
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

const licenceSchema = z.array(
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

const translationSchema = z.array(
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

const exerciseBaseSchema = z.array(
  z.object({
    model: z.string(),
    pk: z.number(),
    fields: z.object({
      license: z.number(),
      license_title: z.string(),
      license_object_url: z.string(),
      license_author: z.string(),
      license_author_url: z.string(),
      license_derivative_source_url: z.string(),
      uuid: z.string(),
      category: z.number(),
      variations: z.number(),
      created: z.string().datetime(),
      last_update: z.string().datetime(),
      muscles: z.array(z.number()),
      muscles_secondary: z.array(z.number()),
      equipment: z.array(z.number()),
    }),
  }),
);

// get directory of this file
const categoryFile = Bun.file(__dirname + "/categories.json");
const categories = categorySchema.parse(await categoryFile.json());
const equipmentFile = Bun.file(__dirname + "/equipment.json");
const equipment = equipmentSchema.parse(await equipmentFile.json());
const musclesFile = Bun.file(__dirname + "/muscles.json");
const muscles = muscleSchema.parse(await musclesFile.json());
const licencesFile = Bun.file(__dirname + "/licenses.json");
const licences = licenceSchema.parse(await licencesFile.json());
const translationFile = Bun.file(__dirname + "/translations.json");
const unverifiedTranslations = await translationFile.json();

const translations = translationSchema.parse(
  unverifiedTranslations.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (x: any) => x.model === "exercises.exercise" && x.fields.language === 2,
  ),
);

const translationsMapped = translations.map((translation) => ({
  ...translation,
  fields: {
    ...translation.fields,
    description: turndownService.turndown(translation.fields.description),
  },
}));

console.log(translationsMapped);

await db.delete(categoryTable);
await db.delete(equipmentTable);
await db.delete(musclesTable);
await db.delete(licenceTable);

for (const category of categories) {
  await db.insert(categoryTable).values({
    id: category.pk,
    ...category.fields,
  });
}

for (const piece of equipment) {
  await db.insert(equipmentTable).values({
    id: piece.pk,
    ...piece.fields,
  });
}

for (const muscle of muscles) {
  await db.insert(musclesTable).values({
    id: muscle.pk,
    name: muscle.fields.name,
    short_name: muscle.fields.name_en || muscle.fields.name,
    is_front: muscle.fields.is_front,
  });
}

for (const licence of licences) {
  await db.insert(licenceTable).values({
    id: licence.pk,
    ...licence.fields,
  });
}
