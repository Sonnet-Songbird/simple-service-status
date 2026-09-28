export type CallerIdentity =
  | { readonly mode: 'explicit-slug'; readonly serviceSlug: string }
  | { readonly mode: 'host-header'; readonly hostname: string }

export class CallerIdentityUnresolvedError extends Error {}

export interface ResolveCallerIdentityInput {
  readonly explicitServiceSlug: string | null
  readonly hostHeader: string | null
}

export function resolveCallerIdentity(input: ResolveCallerIdentityInput): CallerIdentity {
  if (input.explicitServiceSlug !== null) {
    return { mode: 'explicit-slug', serviceSlug: input.explicitServiceSlug }
  }
  if (input.hostHeader !== null) {
    return { mode: 'host-header', hostname: input.hostHeader }
  }
  throw new CallerIdentityUnresolvedError()
}
