import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";

export const videosTable = pgTable("videos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(), // auto-generated ID
  prompt: text().notNull(),                               // video ka prompt
  videoUrl: text().notNull(),                             // video ka URL/link
});
