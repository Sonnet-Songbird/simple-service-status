import { db } from '@/db/client'
import { CallerIdentityUnresolvedError, resolveCallerIdentity } from '@/lib/identity/resolveCallerIdentity'
import { resolveRequestHostname } from '@/lib/identity/resolveRequestHostname'
import { ServiceNotFoundError, resolveServiceFromIdentity } from '@/lib/identity/resolveServiceFromIdentity'
import { resolveActiveSchedule } from '@/lib/schedule/resolveActiveSchedule'
import { resolveUpcomingSchedule } from '@/lib/schedule/resolveUpcomingSchedule'
import { buildNoticeViewModel } from '@/lib/notice/buildNoticeViewModel'
import {
  STATIC_EMERGENCY_NOTICE_HTML,
  renderDowntimeNotice,
  renderFallbackNotice,
  renderUnknownHostNotice,
} from '@/lib/notice/renderNoticeHtml'

function htmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const identity = resolveCallerIdentity({
      explicitServiceSlug: url.searchParams.get('service'),
      hostHeader: resolveRequestHostname(request),
    })

    const service = resolveServiceFromIdentity(db, identity)
    const now = Date.now()
    const activeSchedule = resolveActiveSchedule(db, service.id, now)
    const upcomingSchedule = resolveUpcomingSchedule(db, service.id, now)
    const vm = buildNoticeViewModel(service, activeSchedule, upcomingSchedule, now)

    return htmlResponse(activeSchedule !== null ? renderDowntimeNotice(vm) : renderFallbackNotice(vm))
  } catch (error) {
    if (error instanceof CallerIdentityUnresolvedError || error instanceof ServiceNotFoundError) {
      return htmlResponse(renderUnknownHostNotice())
    }
    return htmlResponse(STATIC_EMERGENCY_NOTICE_HTML)
  }
}
