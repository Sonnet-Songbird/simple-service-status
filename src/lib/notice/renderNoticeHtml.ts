import type { NoticeViewModel } from './buildNoticeViewModel'

const PAGE_STYLE = `
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0;
    display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  main { max-width: 32rem; padding: 2rem; text-align: center; }
  h1 { font-size: 1.5rem; margin-bottom: 1rem; }
  p { line-height: 1.6; color: #94a3b8; }
`

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function page(title: string, message: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<title>${escapeHtml(title)}</title><style>${PAGE_STYLE}</style></head>` +
    `<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></main></body></html>`
}

export function renderDowntimeNotice(vm: NoticeViewModel): string {
  const schedule = vm.activeSchedule
  if (schedule === null) throw new Error('renderDowntimeNotice requires an active schedule')
  return page(`${vm.service.displayName} — Scheduled Maintenance`, schedule.noticeMessage)
}

export function renderFallbackNotice(vm: NoticeViewModel): string {
  return page(vm.service.displayName, vm.service.fallbackNoticeMessage)
}

export function renderUnknownHostNotice(): string {
  return page('Service Unavailable', 'This service could not be identified.')
}

export const STATIC_EMERGENCY_NOTICE_HTML = page(
  'Service Unavailable',
  'We are experiencing a temporary issue. Please try again shortly.',
)
