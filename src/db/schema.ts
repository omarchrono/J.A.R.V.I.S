import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  action: text("action"),
  rawJson: text("raw_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: text("priority").default("medium").notNull(),
  due: text("due").default("").notNull(),
  done: boolean("done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  remindTime: text("remind_time").notNull(),
  remindDate: text("remind_date").notNull(),
  triggered: boolean("triggered").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(),
  details: text("details"),
  level: text("level").default("info").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
