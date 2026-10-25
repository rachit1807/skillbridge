import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expires: integer("expires").notNull(),
  signingKey: text("signing_key").notNull(),
});
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  courseId: text("course_id").notNull(),
  completed: text("completed").notNull().default("[]"),
  notes: text("notes").notNull().default(""),
});

export const authAttempts = sqliteTable("auth_attempts", {
  id: text("id").primaryKey(),
  count: integer("count").notNull(),
  reset: integer("reset").notNull(),
});
