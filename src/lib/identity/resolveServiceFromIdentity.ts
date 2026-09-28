import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/db/schema'
import type { ServiceRow } from '@/db/schema'
import type { CallerIdentity } from './resolveCallerIdentity'

export class ServiceNotFoundError extends Error {
  constructor(readonly identifier: string) {
    super(identifier)
  }
}

export function resolveServiceFromIdentity(
  db: BetterSQLite3Database<typeof schema>,
  identity: CallerIdentity,
): ServiceRow {
  switch (identity.mode) {
    case 'explicit-slug': {
      const row = db.select().from(schema.service).where(eq(schema.service.slug, identity.serviceSlug)).get()
      if (row === undefined) throw new ServiceNotFoundError(identity.serviceSlug)
      return row
    }
    case 'host-header': {
      const row = db
        .select({ service: schema.service })
        .from(schema.host)
        .innerJoin(schema.service, eq(schema.host.serviceId, schema.service.id))
        .where(eq(schema.host.hostname, identity.hostname))
        .get()
      if (row === undefined) throw new ServiceNotFoundError(identity.hostname)
      return row.service
    }
  }
}
