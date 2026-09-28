import type { ScheduleDto, StatusResponseDto } from '@/contract/v1/schemas'
import type { NoticeViewModel } from './buildNoticeViewModel'
import type { ScheduleRow } from '@/db/schema'

function toScheduleDto(row: ScheduleRow): ScheduleDto {
  return { id: row.id, startsAt: row.startsAt.getTime(), endsAt: row.endsAt.getTime(), noticeMessage: row.noticeMessage }
}

export function toStatusResponseDto(vm: NoticeViewModel): StatusResponseDto {
  return {
    service: { slug: vm.service.slug, displayName: vm.service.displayName },
    state: vm.activeSchedule !== null ? 'scheduled_maintenance' : 'operational_unknown',
    activeSchedule: vm.activeSchedule !== null ? toScheduleDto(vm.activeSchedule) : null,
    upcomingSchedule: vm.upcomingSchedule !== null ? toScheduleDto(vm.upcomingSchedule) : null,
    generatedAt: vm.generatedAt,
  }
}
