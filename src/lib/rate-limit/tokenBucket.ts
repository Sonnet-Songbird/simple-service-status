interface Bucket {
  tokens: number
  lastRefillAt: number
}

export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>()

  constructor(
    private readonly capacity: number,
    private readonly refillPerMs: number,
  ) {}

  consume(key: string, now: number): boolean {
    const existing = this.buckets.get(key)
    const bucket = existing ?? { tokens: this.capacity, lastRefillAt: now }

    const elapsed = now - bucket.lastRefillAt
    const refilled = Math.min(this.capacity, bucket.tokens + elapsed * this.refillPerMs)

    if (refilled < 1) {
      this.buckets.set(key, { tokens: refilled, lastRefillAt: now })
      return false
    }

    this.buckets.set(key, { tokens: refilled - 1, lastRefillAt: now })
    return true
  }
}

export const statusEndpointRateLimiter = new TokenBucketRateLimiter(60, 60 / 60_000)
