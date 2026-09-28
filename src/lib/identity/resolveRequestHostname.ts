import { requestHostnameSchema } from '@/contract/v1/schemas'

export function resolveRequestHostname(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-host')
  const raw = forwarded ?? request.headers.get('host') ?? ''
  const withoutPort = raw.split(':')[0] ?? ''
  const parsed = requestHostnameSchema.safeParse(withoutPort)
  return parsed.success ? parsed.data : null
}
