import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { db } from '@/db/client'
import { host, service } from '@/db/schema'
import { resolveActiveSchedule } from '@/lib/schedule/resolveActiveSchedule'
import { NewServiceForm } from './NewServiceForm'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const services = db.select().from(service).all()
  const now = Date.now()

  const rows = services.map((s) => {
    const hostCount = db.select().from(host).where(eq(host.serviceId, s.id)).all().length
    const active = resolveActiveSchedule(db, s.id, now)
    return { service: s, hostCount, active }
  })

  return (
    <main>
      <h1>Services</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Slug</th>
            <th style={cellStyle}>Hosts</th>
            <th style={cellStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.service.id}>
              <td style={cellStyle}>
                <Link href={`/admin/services/${row.service.id}`}>{row.service.displayName}</Link>
              </td>
              <td style={cellStyle}>{row.service.slug}</td>
              <td style={cellStyle}>{row.hostCount}</td>
              <td style={cellStyle}>{row.active !== null ? 'Active downtime' : 'Fallback'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>New service</h2>
      <NewServiceForm />
    </main>
  )
}

const cellStyle = { border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'left' as const }
