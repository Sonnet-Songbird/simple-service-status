import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const service = sqliteTable(
  'service',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    fallbackNoticeMessage: text('fallback_notice_message').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({ slugUnique: uniqueIndex('service_slug_unique').on(t.slug) }),
)

export const host = sqliteTable(
  'host',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    hostname: text('hostname').notNull(),
    serviceId: integer('service_id')
      .notNull()
      .references(() => service.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    hostnameUnique: uniqueIndex('host_hostname_unique').on(t.hostname),
    serviceIdIdx: index('host_service_id_idx').on(t.serviceId),
  }),
)

export const scheduleLifecycleStateValues = ['scheduled', 'cancelled'] as const
export type ScheduleLifecycleState = (typeof scheduleLifecycleStateValues)[number]

export const schedule = sqliteTable(
  'schedule',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    serviceId: integer('service_id')
      .notNull()
      .references(() => service.id, { onDelete: 'cascade' }),
    startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
    endsAt: integer('ends_at', { mode: 'timestamp_ms' }).notNull(),
    noticeMessage: text('notice_message').notNull(),
    lifecycleState: text('lifecycle_state', { enum: scheduleLifecycleStateValues })
      .notNull()
      .default('scheduled'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    lookupIdx: index('schedule_lookup_idx').on(t.serviceId, t.lifecycleState, t.startsAt, t.endsAt),
  }),
)

export const statusCheckValues = ['up', 'down', 'degraded'] as const
export type StatusCheck = (typeof statusCheckValues)[number]

export const statusLog = sqliteTable(
  'status_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    hostId: integer('host_id')
      .notNull()
      .references(() => host.id, { onDelete: 'cascade' }),
    checkedAt: integer('checked_at', { mode: 'timestamp_ms' }).notNull(),
    checkStatus: text('check_status', { enum: statusCheckValues }).notNull(),
    responseTimeMs: integer('response_time_ms'),
  },
  (t) => ({ hostCheckedAtIdx: index('status_log_host_checked_at_idx').on(t.hostId, t.checkedAt) }),
)

export const serviceRelations = relations(service, ({ many }) => ({
  hosts: many(host),
  schedules: many(schedule),
}))

export const hostRelations = relations(host, ({ one, many }) => ({
  service: one(service, { fields: [host.serviceId], references: [service.id] }),
  statusLogs: many(statusLog),
}))

export const scheduleRelations = relations(schedule, ({ one }) => ({
  service: one(service, { fields: [schedule.serviceId], references: [service.id] }),
}))

export const statusLogRelations = relations(statusLog, ({ one }) => ({
  host: one(host, { fields: [statusLog.hostId], references: [host.id] }),
}))

export type ServiceRow = typeof service.$inferSelect
export type HostRow = typeof host.$inferSelect
export type ScheduleRow = typeof schedule.$inferSelect
export type StatusLogRow = typeof statusLog.$inferSelect
