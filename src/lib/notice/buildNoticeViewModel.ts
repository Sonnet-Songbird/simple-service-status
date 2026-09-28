import type { ScheduleRow, ServiceRow } from '@/db/schema'

export interface NoticeViewModel {
  readonly service: ServiceRow
  readonly activeSchedule: ScheduleRow | null
  readonly upcomingSchedule: ScheduleRow | null
  readonly generatedAt: number
}

export function buildNoticeViewModel(
  service: ServiceRow,
  activeSchedule: ScheduleRow | null,
  upcomingSchedule: ScheduleRow | null,
  generatedAt: number,
): NoticeViewModel {
  return { service, activeSchedule, upcomingSchedule, generatedAt }
}
