import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CallerIdentityUnresolvedError, resolveCallerIdentity } from './resolveCallerIdentity'

test('prefers explicit slug over host header', () => {
  const identity = resolveCallerIdentity({ explicitServiceSlug: 'demo', hostHeader: 'demo.example.com' })
  assert.deepEqual(identity, { mode: 'explicit-slug', serviceSlug: 'demo' })
})

test('falls back to host header when no explicit slug', () => {
  const identity = resolveCallerIdentity({ explicitServiceSlug: null, hostHeader: 'demo.example.com' })
  assert.deepEqual(identity, { mode: 'host-header', hostname: 'demo.example.com' })
})

test('throws when neither is present', () => {
  assert.throws(
    () => resolveCallerIdentity({ explicitServiceSlug: null, hostHeader: null }),
    CallerIdentityUnresolvedError,
  )
})
