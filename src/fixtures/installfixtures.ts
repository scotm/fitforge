/* eslint-disable drizzle/enforce-delete-with-where */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { db } from "../server/db";
import {
  category as categoryTable,
  exercises as exercisesTable,
  equipment as equipmentTable,
  muscles as musclesTable,
  licence as licenceTable,
  exerciseToEquipment as exerciseToEquipmentTable,
  exerciseToMuscles as exerciseToMusclesTable,
} from "../server/db/schema";
import TurndownService from "turndown";
import {
  categorySchema,
  equipmentSchema,
  exerciseBaseSchema,
  licenceSchema,
  muscleSchema,
  translationSchema,
} from "./fixtureSchemas";
import { type z } from "zod";
import { join } from "path";

const turndownService = new TurndownService();

async function readAndParseFile<T>(
  filePath: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const file = Bun.file(join(__dirname, filePath));
  const data = await file.json();

  return schema.parse(data);
}

const categories = await readAndParseFile("/categories.json", categorySchema);
const equipment = await readAndParseFile("/equipment.json", equipmentSchema);
const muscles = await readAndParseFile("/muscles.json", muscleSchema);
const licences = await readAndParseFile("/licenses.json", licenceSchema);
const exercisesFile = Bun.file(__dirname + "/exercise-base-data.json");
const unverifiedExercises = await exercisesFile.json();
const filteredExercises = unverifiedExercises.filter(
  (x: unknown) =>
    typeof x === "object" &&
    x !== null &&
    "model" in x &&
    typeof x.model === "string" &&
    x.model === "exercises.exercisebase",
);
const exercises = exerciseBaseSchema.parse(filteredExercises);
const translationFile = Bun.file(__dirname + "/translations.json");
const unverifiedTranslations = await translationFile.json();

const translations = translationSchema.parse(
  unverifiedTranslations.filter(
    (x: unknown) =>
      typeof x === "object" &&
      x !== null &&
      "model" in x &&
      typeof x.model === "string" &&
      x.model === "exercises.exercise" &&
      "fields" in x &&
      typeof x.fields === "object" &&
      x.fields !== null &&
      "language" in x.fields &&
      typeof x.fields.language === "number" &&
      x.fields.language === 2,
  ),
);

const translationsMapped = translations.map((translation) => ({
  ...translation,
  fields: {
    ...translation.fields,
    description: turndownService.turndown(translation.fields.description),
  },
}));

const translationMap = new Map(
  translationsMapped.map((t) => [t.fields.exercise_base, t]),
);

await eraseOldTables();

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

for (const exercise of exercises) {
  await db.insert(exercisesTable).values({
    id: exercise.pk,
    categoryId: exercise.fields.category,
    licenceId: exercise.fields.license,
    name: translationMap.get(exercise.pk)?.fields.name ?? "",
    how_to_perform: translationMap.get(exercise.pk)?.fields.description ?? "",
  });
  for (const muscleId of exercise.fields.muscles) {
    await db.insert(exerciseToMusclesTable).values({
      exerciseId: exercise.pk,
      muscleId: muscleId,
    });
  }
  for (const equipmentId of exercise.fields.equipment) {
    await db.insert(exerciseToEquipmentTable).values({
      exerciseId: exercise.pk,
      equipmentId: equipmentId,
    });
  }
}

const goop = await db.query.exercises.findMany({
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

console.dir(goop, { depth: null });

async function eraseOldTables() {
  const tables = [
    categoryTable,
    equipmentTable,
    musclesTable,
    licenceTable,
    exercisesTable,
  ];
  for (const table of tables) {
    await db.delete(table);
  }
}
