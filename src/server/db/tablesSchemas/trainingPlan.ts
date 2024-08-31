import { index, int, text, unique } from "drizzle-orm/sqlite-core";
import { createTable } from "../utils";
import { sql } from "drizzle-orm";
import { exercises } from "./exercises";
import { users } from "./users";

export const trainingPlan = createTable(
  "training_plan",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    user_id: int("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
    startDate: int("start_date", { mode: "timestamp" }),
    endDate: int("end_date", { mode: "timestamp" }),
    description: text("description", { length: 5000 }).default("").notNull(),
  },
  (example) => ({
    nameIndex: index("training_plan_name_idx").on(example.name),
  }),
);

export const weeklyWorkoutPlan = createTable(
  "weekly_workout_plan",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    trainingPlanId: int("training_plan_id", { mode: "number" })
      .notNull()
      .references(() => trainingPlan.id),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
    description: text("description", { length: 5000 }).default("").notNull(),
  },
  (example) => ({
    nameIndex: index("workout_plan_name_idx").on(example.name),
  }),
);

export const workoutPieces = createTable(
  "workout_piece",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    ordering: int("ordering", { mode: "number" }).default(0).notNull(),
    workoutPlanId: int("workout_plan_id", { mode: "number" })
      .notNull()
      .references(() => weeklyWorkoutPlan.id),
    restSecs: int("rest_secs", { mode: "number" }).default(0).notNull(),
  },
  (workoutPiece) => ({
    unq: unique("workout_piece_uniq").on(
      workoutPiece.workoutPlanId,
      workoutPiece.ordering,
    ),
  }),
);

export const resistanceWorkoutPiece = createTable("resistance_workout_piece", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  workoutPieceId: int("workout_plan_id", { mode: "number" })
    .notNull()
    .references(() => workoutPieces.id),

  // How do we enforce that the exercise is a resistance exercise?
  exerciseId: int("exercise_id", { mode: "number" })
    .notNull()
    .references(() => exercises.id),
  sets: int("value", { mode: "number" }).default(1).notNull(),
  rep_ranges: text("rep_ranges", { length: 256 }).notNull(),
});

export const cardioWorkoutPiece = createTable("cardio_workout_piece", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  workoutPieceId: int("workout_plan_id", { mode: "number" })
    .notNull()
    .references(() => workoutPieces.id),

  // How do we enforce that the exercise is a cardio exercise?
  exerciseId: int("exercise_id", { mode: "number" })
    .notNull()
    .references(() => exercises.id),
  value: int("value", { mode: "number" }).default(0).notNull(),
  unit: text("unit", { length: 256 }).default("min").notNull(),
});

export const supersetWorkoutPieces = createTable("superset_workout_piece", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  workoutPlanId: int("workout_plan_id", { mode: "number" })
    .notNull()
    .references(() => weeklyWorkoutPlan.id),
});

export const supersetWorkoutComponents = createTable(
  "superset_workout_component",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    supersetWorkoutPieceId: int("superset_workout_piece_id", { mode: "number" })
      .notNull()
      .references(() => supersetWorkoutPieces.id),
    exerciseId: int("exercise_id", { mode: "number" })
      .notNull()
      .references(() => exercises.id),
    rep_ranges: text("rep_ranges", { length: 256 }).notNull(),
  },
  (supersetWorkoutComponent) => ({
    unq: unique("superset_workout_component_uniq").on(
      supersetWorkoutComponent.supersetWorkoutPieceId,
      supersetWorkoutComponent.exerciseId,
    ),
  }),
);
