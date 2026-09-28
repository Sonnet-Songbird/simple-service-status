import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from './schema'

const dbPath = process.env.NOTICE_DB_PATH ?? './data/notice.sqlite3'
mkdirSync(dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('busy_timeout = 5000')

export const db = drizzle(sqlite, { schema })
