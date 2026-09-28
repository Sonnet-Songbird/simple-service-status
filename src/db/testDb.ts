import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.exec(`
    CREATE TABLE service (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      fallback_notice_message TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE host (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostname TEXT NOT NULL UNIQUE,
      service_id INTEGER NOT NULL REFERENCES service(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL REFERENCES service(id) ON DELETE CASCADE,
      starts_at INTEGER NOT NULL,
      ends_at INTEGER NOT NULL,
      notice_message TEXT NOT NULL,
      lifecycle_state TEXT NOT NULL DEFAULT 'scheduled',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE status_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_id INTEGER NOT NULL REFERENCES host(id) ON DELETE CASCADE,
      checked_at INTEGER NOT NULL,
      check_status TEXT NOT NULL,
      response_time_ms INTEGER
    );
  `)
  return drizzle(sqlite, { schema })
}

export type TestDb = ReturnType<typeof createTestDb>
