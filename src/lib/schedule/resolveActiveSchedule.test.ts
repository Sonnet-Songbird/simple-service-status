import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTestDb } from '@/db/testDb'
import { schedule, service } from '@/db/schema'
import { computeSchedulePhase, resolveActiveSchedule } from './resolveActiveSchedule'

function seedService(db: ReturnType<typeof createTestDb>) {
  const now = new Date()
  const row = db
    .insert(service)
    .values({ slug: 'demo', displayName: 'Demo', fallbackNoticeMessage: 'fallback', createdAt: now, updatedAt: now })
    .returning()
    .get()
  return row!.id
}

test('returns the schedule when now is within [startsAt, endsAt]', () => {
  const db = createTestDb()
  const serviceId = seedService(db)
  const now = new Date()
  db.insert(schedule)
    .values({
      serviceId,
      startsAt: new Date(1000),
      endsAt: new Date(2000),
      noticeMessage: 'maintenance',
      createdAt: now,
      updatedAt: now,
    })
    .run()

  assert.equal(resolveActiveSchedule(db, serviceId, 1000)?.noticeMessage, 'maintenance') // inclusive lower bound
  assert.equal(resolveActiveSchedule(db, serviceId, 2000)?.noticeMessage, 'maintenance') // inclusive upper bound
  assert.equal(resolveActiveSchedule(db, serviceId, 999), null)
  assert.equal(resolveActiveSchedule(db, serviceId, 2001), null)
})

test('picks the earliest-starting schedule when ranges overlap', () => {
  const db = createTestDb()
  const serviceId = seedService(db)
  const now = new Date()
  db.insert(schedule)
    .values([
      { serviceId, startsAt: new Date(2000), endsAt: new Date(5000), noticeMessage: 'later', createdAt: now, updatedAt: now },
      { serviceId, startsAt: new Date(1000), endsAt: new Date(5000), noticeMessage: 'earlier', createdAt: now, updatedAt: now },
    ])
    .run()

  assert.equal(resolveActiveSchedule(db, serviceId, 2500)?.noticeMessage, 'earlier')
})

test('excludes cancelled schedules', () => {
  const db = createTestDb()
  const serviceId = seedService(db)
  const now = new Date()
  db.insert(schedule)
    .values({
      serviceId,
      startsAt: new Date(1000),
      endsAt: new Date(2000),
      noticeMessage: 'cancelled one',
      lifecycleState: 'cancelled',
      createdAt: now,
      updatedAt: now,
    })
    .run()

  assert.equal(resolveActiveSchedule(db, serviceId, 1500), null)
})

test('computeSchedulePhase classifies upcoming/active/ended', () => {
  const row = { startsAt: new Date(1000), endsAt: new Date(2000) }
  assert.equal(computeSchedulePhase(row, 500), 'upcoming')
  assert.equal(computeSchedulePhase(row, 1500), 'active')
  assert.equal(computeSchedulePhase(row, 2500), 'ended')
})
