'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db/client'
import { service } from '@/db/schema'
import { serviceInsertSchema } from '@/contract/v1/schemas'

export interface ActionState {
  readonly fieldErrors: Record<string, string>
}

export async function createService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = serviceInsertSchema.safeParse({
    slug: formData.get('slug'),
    displayName: formData.get('displayName'),
    description: formData.get('description') || null,
    fallbackNoticeMessage: formData.get('fallbackNoticeMessage'),
  })
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) }

  const now = new Date()
  db.insert(service)
    .values({ ...parsed.data, createdAt: now, updatedAt: now })
    .run()

  revalidatePath('/admin')
  return { fieldErrors: {} }
}

export async function deleteService(serviceId: number): Promise<void> {
  db.delete(service).where(eq(service.id, serviceId)).run()
  revalidatePath('/admin')
}

function flattenFieldErrors(error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    result[key] = issue.message
  }
  return result
}
