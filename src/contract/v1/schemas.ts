import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { service, host, schedule } from '@/db/schema'

export const serviceInsertSchema = createInsertSchema(service, {
  slug: (s) => s.min(1).max(64).regex(/^[a-z0-9-]+$/),
  displayName: (s) => s.min(1).max(120),
  fallbackNoticeMessage: (s) => s.min(1).max(2000),
}).omit({ id: true, createdAt: true, updatedAt: true })

export const hostInsertSchema = createInsertSchema(host, {
  hostname: (s) =>
    s
      .min(1)
      .max(253)
      .regex(/^[a-z0-9.-]+$/i)
      .transform((v) => v.toLowerCase()),
}).omit({ id: true, createdAt: true })

export const scheduleInsertSchema = createInsertSchema(schedule, {
  noticeMessage: (s) => s.min(1).max(2000),
})
  .omit({ id: true, createdAt: true, updatedAt: true, lifecycleState: true })
  .extend({ startsAt: z.coerce.date(), endsAt: z.coerce.date() })
  .refine((v) => v.endsAt > v.startsAt, { message: 'endsAt must be after startsAt', path: ['endsAt'] })

export const requestHostnameSchema = z
  .string()
  .min(1)
  .max(253)
  .regex(/^[a-z0-9.-]+$/i)
  .transform((v) => v.toLowerCase())

export const requestServiceSlugSchema = z.string().min(1).max(64)

export const StatusQuerySchema = z.object({
  service: requestServiceSlugSchema,
})

export const ScheduleDto = z.object({
  id: z.number().int(),
  startsAt: z.number().int(),
  endsAt: z.number().int(),
  noticeMessage: z.string(),
})
export type ScheduleDto = z.infer<typeof ScheduleDto>

export const statusResponseStateValues = ['scheduled_maintenance', 'operational_unknown'] as const

export const StatusResponseDto = z.object({
  service: z.object({ slug: z.string(), displayName: z.string() }),
  state: z.enum(statusResponseStateValues),
  activeSchedule: ScheduleDto.nullable(),
  upcomingSchedule: ScheduleDto.nullable(),
  generatedAt: z.number().int(),
})
export type StatusResponseDto = z.infer<typeof StatusResponseDto>

export const errorResponseCodeValues = ['invalid_request', 'service_not_found', 'rate_limited'] as const

export const ErrorResponseDto = z.object({
  error: z.enum(errorResponseCodeValues),
  message: z.string(),
})
export type ErrorResponseDto = z.infer<typeof ErrorResponseDto>
