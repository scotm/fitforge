import { relations, sql } from "drizzle-orm";
import { index, int, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../utils";

export const equipment = createTable(
  "equipment",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("equipment_name_idx").on(example.name),
  }),
);

export const muscles = createTable(
  "muscle",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    short_name: text("short_name", { length: 256 }),
    is_front: int("is_front", { mode: "boolean" }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("muscle_name_idx").on(example.name),
  }),
);

export const category = createTable(
  "category",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("category_name_idx").on(example.name),
  }),
);

export const exercises = createTable(
  "exercise",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    categoryId: int("category_id", { mode: "number" })
      .notNull()
      .references(() => category.id),
    licenceId: int("licence_id", { mode: "number" })
      .notNull()
      .references(() => licence.id),
    name: text("name", { length: 256 }),
    how_to_perform: text("how_to_perform", { length: 5000 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("exercise_name_idx").on(example.name),
  }),
);

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  category: one(category, {
    fields: [exercises.categoryId],
    references: [category.id],
  }),
  licence: one(licence, {
    fields: [exercises.licenceId],
    references: [licence.id],
  }),
  muscles: many(exerciseToMuscles),
  // muscles_secondary: many(muscles),
  equipment: many(exerciseToEquipment),
}));

export const categoriesRelations = relations(category, ({ many }) => ({
  exercises: many(exercises),
}));

export const musclesRelations = relations(muscles, ({ many }) => ({
  exercises: many(exerciseToMuscles),
}));

export const equipmentRelations = relations(equipment, ({ many }) => ({
  exercises: many(exerciseToEquipment),
}));

export const exerciseToMuscles = createTable(
  "exercise_to_muscle",
  {
    exerciseId: int("exercise_id", { mode: "number" })
      .notNull()
      .references(() => exercises.id),
    muscleId: int("muscle_id", { mode: "number" })
      .notNull()
      .references(() => muscles.id),
  },
  (example) => ({
    nameIndex: index("exercise_to_muscle_idx").on(
      example.exerciseId,
      example.muscleId,
    ),
  }),
);

export const exerciseToMusclesRelations = relations(
  exerciseToMuscles,
  ({ one }) => ({
    exercises: one(exercises, {
      fields: [exerciseToMuscles.exerciseId],
      references: [exercises.id],
    }),
    muscles: one(muscles, {
      fields: [exerciseToMuscles.muscleId],
      references: [muscles.id],
    }),
  }),
);

export const exerciseToEquipment = createTable(
  "exercise_to_equipment",
  {
    exerciseId: int("exercise_id", { mode: "number" })
      .notNull()
      .references(() => exercises.id),
    equipmentId: int("equipment_id", { mode: "number" })
      .notNull()
      .references(() => equipment.id),
  },
  (example) => ({
    nameIndex: index("exercise_to_equipment_idx").on(
      example.exerciseId,
      example.equipmentId,
    ),
  }),
);

export const exerciseToEquipmentRelations = relations(
  exerciseToEquipment,
  ({ one }) => ({
    exercises: one(exercises, {
      fields: [exerciseToEquipment.exerciseId],
      references: [exercises.id],
    }),
    equipment: one(equipment, {
      fields: [exerciseToEquipment.equipmentId],
      references: [equipment.id],
    }),
  }),
);

export const licence = createTable(
  "licence",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    full_name: text("full_name", { length: 256 }),
    short_name: text("short_name", { length: 256 }),
    url: text("url", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("licence_name_idx").on(example.full_name),
  }),
);

export const licenceRelations = relations(licence, ({ many }) => ({
  exercises: many(exercises),
}));
