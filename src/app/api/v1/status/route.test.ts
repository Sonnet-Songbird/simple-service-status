import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.NOTICE_DB_PATH = join(mkdtempSync(join(tmpdir(), 'status-route-test-')), 'test.sqlite3')

const { db } = await import('@/db/client')
const { runMigrations } = await import('@/db/migrate')
const { service } = await import('@/db/schema')
const { GET } = await import('./route')

runMigrations()

const now = new Date()
db.insert(service)
  .values({ slug: 'demo', displayName: 'Demo', fallbackNoticeMessage: 'fallback', createdAt: now, updatedAt: now })
  .run()

test('returns 200 with StatusResponseDto for a registered service', async () => {
  const response = await GET(new Request('https://status.example/api/v1/status?service=demo'))
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.service.slug, 'demo')
  assert.equal(body.state, 'operational_unknown')
})

test('returns 400 when service query param is missing', async () => {
  const response = await GET(new Request('https://status.example/api/v1/status'))
  assert.equal(response.status, 400)
  const body = await response.json()
  assert.equal(body.error, 'invalid_request')
})

test('returns 404 for an unregistered service', async () => {
  const response = await GET(new Request('https://status.example/api/v1/status?service=missing'))
  assert.equal(response.status, 404)
  const body = await response.json()
  assert.equal(body.error, 'service_not_found')
})

test('returns 429 once the rate limit is exceeded', async () => {
  const url = 'https://status.example/api/v1/status?service=demo'
  let lastStatus = 200
  for (let i = 0; i < 65; i++) {
    const response = await GET(new Request(url, { headers: { 'x-forwarded-for': '203.0.113.9' } }))
    lastStatus = response.status
  }
  assert.equal(lastStatus, 429)
})
