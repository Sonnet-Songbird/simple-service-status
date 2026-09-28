import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ErrorResponseDto, StatusResponseDto } from './schemas'

test('StatusResponseDto accepts a fully populated payload', () => {
  const payload = {
    service: { slug: 'demo', displayName: 'Demo' },
    state: 'scheduled_maintenance',
    activeSchedule: { id: 1, startsAt: 1000, endsAt: 2000, noticeMessage: 'maintenance' },
    upcomingSchedule: null,
    generatedAt: 1500,
  }
  assert.deepEqual(StatusResponseDto.parse(payload), payload)
})

test('StatusResponseDto rejects an unknown state value', () => {
  const payload = {
    service: { slug: 'demo', displayName: 'Demo' },
    state: 'not-a-real-state',
    activeSchedule: null,
    upcomingSchedule: null,
    generatedAt: 1500,
  }
  assert.throws(() => StatusResponseDto.parse(payload))
})

test('ErrorResponseDto round-trips', () => {
  const payload = { error: 'service_not_found', message: 'no service registered for "demo"' }
  assert.deepEqual(ErrorResponseDto.parse(payload), payload)
})
