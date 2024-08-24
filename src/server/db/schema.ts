import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `fitforge_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdById: text("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  emailVerified: int("email_verified", {
    mode: "timestamp",
  }).default(sql`(unixepoch())`),
  image: text("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

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
