import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTestDb } from '@/db/testDb'
import { host, service } from '@/db/schema'
import { ServiceNotFoundError, resolveServiceFromIdentity } from './resolveServiceFromIdentity'

function seed(db: ReturnType<typeof createTestDb>) {
  const now = new Date()
  const row = db
    .insert(service)
    .values({ slug: 'demo', displayName: 'Demo', fallbackNoticeMessage: 'fallback', createdAt: now, updatedAt: now })
    .returning()
    .get()
  db.insert(host)
    .values({ hostname: 'app.example.com', serviceId: row!.id, createdAt: now })
    .run()
  return row!
}

test('resolves by explicit slug', () => {
  const db = createTestDb()
  const seeded = seed(db)
  const resolved = resolveServiceFromIdentity(db, { mode: 'explicit-slug', serviceSlug: 'demo' })
  assert.equal(resolved.id, seeded.id)
})

test('resolves by host header', () => {
  const db = createTestDb()
  const seeded = seed(db)
  const resolved = resolveServiceFromIdentity(db, { mode: 'host-header', hostname: 'app.example.com' })
  assert.equal(resolved.id, seeded.id)
})

test('throws ServiceNotFoundError for unknown slug', () => {
  const db = createTestDb()
  assert.throws(
    () => resolveServiceFromIdentity(db, { mode: 'explicit-slug', serviceSlug: 'missing' }),
    ServiceNotFoundError,
  )
})

test('throws ServiceNotFoundError for unknown hostname', () => {
  const db = createTestDb()
  assert.throws(
    () => resolveServiceFromIdentity(db, { mode: 'host-header', hostname: 'missing.example.com' }),
    ServiceNotFoundError,
  )
})
