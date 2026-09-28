'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db/client'
import { host, schedule } from '@/db/schema'
import { hostInsertSchema, scheduleInsertSchema } from '@/contract/v1/schemas'

export interface ActionState {
  readonly fieldErrors: Record<string, string>
}

const emptyState: ActionState = { fieldErrors: {} }

export async function createHost(serviceId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = hostInsertSchema.safeParse({ hostname: formData.get('hostname'), serviceId })
  if (!parsed.success) return flatten(parsed.error)

  try {
    db.insert(host)
      .values({ ...parsed.data, createdAt: new Date() })
      .run()
  } catch {
    return { fieldErrors: { hostname: 'hostname already registered' } }
  }

  revalidatePath(`/admin/services/${serviceId}`)
  return emptyState
}

export async function deleteHost(serviceId: number, hostId: number): Promise<void> {
  db.delete(host).where(eq(host.id, hostId)).run()
  revalidatePath(`/admin/services/${serviceId}`)
}

export async function createSchedule(serviceId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = scheduleInsertSchema.safeParse({
    serviceId,
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    noticeMessage: formData.get('noticeMessage'),
  })
  if (!parsed.success) return flatten(parsed.error)

  const now = new Date()
  db.insert(schedule)
    .values({
      serviceId,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      noticeMessage: parsed.data.noticeMessage,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  revalidatePath(`/admin/services/${serviceId}`)
  return emptyState
}

export async function cancelSchedule(serviceId: number, scheduleId: number): Promise<void> {
  db.update(schedule)
    .set({ lifecycleState: 'cancelled', updatedAt: new Date() })
    .where(eq(schedule.id, scheduleId))
    .run()
  revalidatePath(`/admin/services/${serviceId}`)
}

function flatten(error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }): ActionState {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    fieldErrors[key] = issue.message
  }
  return { fieldErrors }
}
