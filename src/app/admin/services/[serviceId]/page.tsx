import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { host, schedule, service } from '@/db/schema'
import { computeSchedulePhase } from '@/lib/schedule/resolveActiveSchedule'
import { AddHostForm } from './AddHostForm'
import { AddScheduleForm } from './AddScheduleForm'
import { cancelSchedule, deleteHost } from './actions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ serviceId: string }>
}

export default async function ServiceWorkspacePage({ params }: PageProps) {
  const { serviceId: serviceIdParam } = await params
  const serviceId = Number(serviceIdParam)

  const serviceRow = db.select().from(service).where(eq(service.id, serviceId)).get()
  if (serviceRow === undefined) notFound()

  const hosts = db.select().from(host).where(eq(host.serviceId, serviceId)).all()
  const schedules = db
    .select()
    .from(schedule)
    .where(eq(schedule.serviceId, serviceId))
    .all()
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())

  const now = Date.now()

  return (
    <main>
      <h1>{serviceRow.displayName}</h1>
      <p>
        slug: <code>{serviceRow.slug}</code>
      </p>

      <section>
        <h2>Hosts</h2>
        <ul>
          {hosts.map((h) => (
            <li key={h.id}>
              {h.hostname}{' '}
              <form action={deleteHost.bind(null, serviceId, h.id)} style={{ display: 'inline' }}>
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
        <AddHostForm serviceId={serviceId} />
      </section>

      <section>
        <h2>Schedules</h2>
        <ul>
          {schedules.map((s) => (
            <li key={s.id}>
              [{s.lifecycleState === 'cancelled' ? 'Cancelled' : computeSchedulePhase(s, now)}]{' '}
              {s.startsAt.toISOString()} — {s.endsAt.toISOString()}: {s.noticeMessage}{' '}
              {s.lifecycleState === 'scheduled' && (
                <form action={cancelSchedule.bind(null, serviceId, s.id)} style={{ display: 'inline' }}>
                  <button type="submit">Cancel</button>
                </form>
              )}
            </li>
          ))}
        </ul>
        <AddScheduleForm serviceId={serviceId} />
      </section>
    </main>
  )
}
