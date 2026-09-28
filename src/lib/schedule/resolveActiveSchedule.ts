import { and, asc, eq, gte, lte } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/db/schema'
import type { ScheduleRow } from '@/db/schema'

export function resolveActiveSchedule(
  db: BetterSQLite3Database<typeof schema>,
  serviceId: number,
  now: number,
): ScheduleRow | null {
  const nowDate = new Date(now)
  const row = db
    .select()
    .from(schema.schedule)
    .where(
      and(
        eq(schema.schedule.serviceId, serviceId),
        eq(schema.schedule.lifecycleState, 'scheduled'),
        lte(schema.schedule.startsAt, nowDate),
        gte(schema.schedule.endsAt, nowDate),
      ),
    )
    .orderBy(asc(schema.schedule.startsAt), asc(schema.schedule.id))
    .limit(1)
    .get()
  return row ?? null
}

export type SchedulePhase = 'upcoming' | 'active' | 'ended'

export function computeSchedulePhase(row: Pick<ScheduleRow, 'startsAt' | 'endsAt'>, now: number): SchedulePhase {
  if (now < row.startsAt.getTime()) return 'upcoming'
  if (now < row.endsAt.getTime()) return 'active'
  return 'ended'
}
