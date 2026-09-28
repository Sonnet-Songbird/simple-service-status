import { db } from '@/db/client'
import { StatusQuerySchema, type ErrorResponseDto, type StatusResponseDto } from '@/contract/v1/schemas'
import { resolveCallerIdentity } from '@/lib/identity/resolveCallerIdentity'
import { ServiceNotFoundError, resolveServiceFromIdentity } from '@/lib/identity/resolveServiceFromIdentity'
import { resolveActiveSchedule } from '@/lib/schedule/resolveActiveSchedule'
import { resolveUpcomingSchedule } from '@/lib/schedule/resolveUpcomingSchedule'
import { buildNoticeViewModel } from '@/lib/notice/buildNoticeViewModel'
import { toStatusResponseDto } from '@/lib/notice/toStatusResponseDto'
import { statusEndpointRateLimiter } from '@/lib/rate-limit/tokenBucket'

const RESPONSE_HEADERS = {
  'content-type': 'application/json',
  'cache-control': 'public, max-age=15, stale-while-revalidate=45',
  'access-control-allow-origin': '*',
} as const

function jsonResponse(status: number, body: StatusResponseDto | ErrorResponseDto): Response {
  return new Response(JSON.stringify(body), { status, headers: RESPONSE_HEADERS })
}

function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for') ?? 'unknown'
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const parsedQuery = StatusQuerySchema.safeParse({ service: url.searchParams.get('service') })
  if (!parsedQuery.success) {
    return jsonResponse(400, { error: 'invalid_request', message: 'query parameter "service" is required' })
  }

  const rateLimitKey = `${clientKey(request)}:${parsedQuery.data.service}`
  if (!statusEndpointRateLimiter.consume(rateLimitKey, Date.now())) {
    return jsonResponse(429, { error: 'rate_limited', message: 'too many requests' })
  }

  const identity = resolveCallerIdentity({ explicitServiceSlug: parsedQuery.data.service, hostHeader: null })

  let service
  try {
    service = resolveServiceFromIdentity(db, identity)
  } catch (error) {
    if (error instanceof ServiceNotFoundError) {
      return jsonResponse(404, { error: 'service_not_found', message: `no service registered for "${error.identifier}"` })
    }
    throw error
  }

  const now = Date.now()
  const activeSchedule = resolveActiveSchedule(db, service.id, now)
  const upcomingSchedule = resolveUpcomingSchedule(db, service.id, now)
  const vm = buildNoticeViewModel(service, activeSchedule, upcomingSchedule, now)

  return jsonResponse(200, toStatusResponseDto(vm))
}
