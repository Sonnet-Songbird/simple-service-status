import { and, asc, eq, gt } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/db/schema'
import type { ScheduleRow } from '@/db/schema'

export function resolveUpcomingSchedule(
  db: BetterSQLite3Database<typeof schema>,
  serviceId: number,
  now: number,
): ScheduleRow | null {
  const row = db
    .select()
    .from(schema.schedule)
    .where(
      and(
        eq(schema.schedule.serviceId, serviceId),
        eq(schema.schedule.lifecycleState, 'scheduled'),
        gt(schema.schedule.startsAt, new Date(now)),
      ),
    )
    .orderBy(asc(schema.schedule.startsAt), asc(schema.schedule.id))
    .limit(1)
    .get()
  return row ?? null
}
