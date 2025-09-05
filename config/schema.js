import { integer, pgTable, text,timestamp  } from "drizzle-orm/pg-core";

export const videosTable = pgTable("videos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(), // auto-generated ID
  prompt: text().notNull(),                               // video ka prompt
  videoUrl: text().notNull(),                             // video ka URL/link
});


export const WhatsAppjobsTable = pgTable("jobs", {
  id: text().primaryKey(),                        // UUID as primary key
  userPhone: text().notNull(),                    // user ka phone
  userPrompt: text().notNull(),                   // user ka diya hua prompt
  enhancedPrompt: text(),                         // AI-enhanced prompt
  status: text().notNull().default("pending"),    // pending -> processing -> completed / failed
  videoUrl: text(),                               // generated video ka URL
  createdAt: timestamp().defaultNow().notNull(),  // job creation time
});