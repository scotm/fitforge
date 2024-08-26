import { createTable } from "../utils";
import { int, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const measurementType = createTable("measurement_type", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { enum: ["weight", "distance", "height", "bodyfat"] }),
});

export const measurements = createTable("measurement", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  user: int("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  measurementTypeId: int("measurement_type_id", { mode: "number" })
    .notNull()
    .references(() => measurementType.id),
  value: int("value", { mode: "number" }),
});
