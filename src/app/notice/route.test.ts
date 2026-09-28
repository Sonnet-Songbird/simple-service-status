import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.NOTICE_DB_PATH = join(mkdtempSync(join(tmpdir(), 'notice-route-test-')), 'test.sqlite3')

const { db } = await import('@/db/client')
const { runMigrations } = await import('@/db/migrate')
const { service, schedule } = await import('@/db/schema')
const { GET } = await import('./route')

runMigrations()

const now = new Date()
const seededService = db
  .insert(service)
  .values({ slug: 'demo', displayName: 'Demo', fallbackNoticeMessage: 'fallback message', createdAt: now, updatedAt: now })
  .returning()
  .get()
db.insert(service)
  .values({ slug: 'demo-fallback', displayName: 'Demo Fallback', fallbackNoticeMessage: 'fallback message', createdAt: now, updatedAt: now })
  .run()

test('returns active downtime notice with status 200', async () => {
  db.insert(schedule)
    .values({
      serviceId: seededService!.id,
      startsAt: new Date(Date.now() - 1000),
      endsAt: new Date(Date.now() + 100_000),
      noticeMessage: 'under maintenance',
      createdAt: now,
      updatedAt: now,
    })
    .run()

  const response = await GET(new Request('https://status.example/notice?service=demo'))
  assert.equal(response.status, 200)
  assert.match(await response.text(), /under maintenance/)
})

test('returns fallback notice when no active schedule, still status 200', async () => {
  const response = await GET(new Request('https://status.example/notice?service=demo-fallback'))
  assert.equal(response.status, 200)
  assert.match(await response.text(), /fallback message/)
})

test('returns 200 with unknown-host page when service is not registered', async () => {
  const response = await GET(new Request('https://status.example/notice?service=does-not-exist'))
  assert.equal(response.status, 200)
  assert.match(await response.text(), /Service Unavailable/)
})

test('returns 200 with unknown-host page when identity cannot be resolved', async () => {
  const response = await GET(new Request('https://status.example/notice'))
  assert.equal(response.status, 200)
  assert.match(await response.text(), /Service Unavailable/)
})
