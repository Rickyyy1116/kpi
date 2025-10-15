import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`)
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`)
});

export const teamMembers = sqliteTable('team_members', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['owner','member'] }).notNull()
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  title: text('title').notNull(),
  description: text('description'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  targetValue: real('target_value').notNull(),
  unit: text('unit').notNull(),
  dueDate: integer('due_date'),
  status: text('status', { enum: ['active','archived'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`)
});

export const kpis = sqliteTable('kpis', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull().references(() => goals.id),
  title: text('title').notNull(),
  description: text('description'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  targetValue: real('target_value').notNull(),
  unit: text('unit').notNull(),
  direction: text('direction', { enum: ['up','down'] }).notNull(),
  frequency: text('frequency', { enum: ['daily','weekly','monthly'] }).notNull(),
  weight: real('weight').default(1),
  status: text('status', { enum: ['active','archived'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`)
});

export const kpiUpdates = sqliteTable('kpi_updates', {
  id: text('id').primaryKey(),
  kpiId: text('kpi_id').notNull().references(() => kpis.id),
  value: real('value').notNull(),
  note: text('note'),
  recordedAt: integer('recorded_at', { mode: 'timestamp_ms' }).notNull(),
  createdBy: text('created_by').notNull().references(() => users.id)
});

// Relations
export const goalsRelations = relations(goals, ({ one, many }) => ({
  team: one(teams, {
    fields: [goals.teamId],
    references: [teams.id],
  }),
  owner: one(users, {
    fields: [goals.ownerId],
    references: [users.id],
  }),
  kpis: many(kpis),
}));

export const kpisRelations = relations(kpis, ({ one, many }) => ({
  goal: one(goals, {
    fields: [kpis.goalId],
    references: [goals.id],
  }),
  owner: one(users, {
    fields: [kpis.ownerId],
    references: [users.id],
  }),
  updates: many(kpiUpdates),
}));

export const kpiUpdatesRelations = relations(kpiUpdates, ({ one }) => ({
  kpi: one(kpis, {
    fields: [kpiUpdates.kpiId],
    references: [kpis.id],
  }),
  creator: one(users, {
    fields: [kpiUpdates.createdBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));
