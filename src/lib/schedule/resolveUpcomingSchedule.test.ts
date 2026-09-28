import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTestDb } from '@/db/testDb'
import { schedule, service } from '@/db/schema'
import { resolveUpcomingSchedule } from './resolveUpcomingSchedule'

function seedService(db: ReturnType<typeof createTestDb>) {
  const now = new Date()
  const row = db
    .insert(service)
    .values({ slug: 'demo', displayName: 'Demo', fallbackNoticeMessage: 'fallback', createdAt: now, updatedAt: now })
    .returning()
    .get()
  return row!.id
}

test('returns the earliest future schedule', () => {
  const db = createTestDb()
  const serviceId = seedService(db)
  const now = new Date()
  db.insert(schedule)
    .values([
      { serviceId, startsAt: new Date(5000), endsAt: new Date(6000), noticeMessage: 'later', createdAt: now, updatedAt: now },
      { serviceId, startsAt: new Date(3000), endsAt: new Date(4000), noticeMessage: 'sooner', createdAt: now, updatedAt: now },
    ])
    .run()

  assert.equal(resolveUpcomingSchedule(db, serviceId, 1000)?.noticeMessage, 'sooner')
})

test('excludes cancelled and past schedules', () => {
  const db = createTestDb()
  const serviceId = seedService(db)
  const now = new Date()
  db.insert(schedule)
    .values([
      { serviceId, startsAt: new Date(1), endsAt: new Date(2), noticeMessage: 'past', createdAt: now, updatedAt: now },
      {
        serviceId,
        startsAt: new Date(5000),
        endsAt: new Date(6000),
        noticeMessage: 'cancelled',
        lifecycleState: 'cancelled',
        createdAt: now,
        updatedAt: now,
      },
    ])
    .run()

  assert.equal(resolveUpcomingSchedule(db, serviceId, 1000), null)
})
