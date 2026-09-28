'use client'

import { useActionState } from 'react'
import { createSchedule, type ActionState } from './actions'

const initialState: ActionState = { fieldErrors: {} }

export function AddScheduleForm({ serviceId }: { serviceId: number }) {
  const [state, formAction, pending] = useActionState(createSchedule.bind(null, serviceId), initialState)

  return (
    <form action={formAction} style={{ display: 'grid', gap: '0.5rem', maxWidth: '28rem' }}>
      <label>
        Starts at
        <input type="datetime-local" name="startsAt" required />
      </label>
      <label>
        Ends at
        <input type="datetime-local" name="endsAt" required />
        {state.fieldErrors.endsAt && <p style={{ color: 'crimson' }}>{state.fieldErrors.endsAt}</p>}
      </label>
      <label>
        Notice message
        <textarea name="noticeMessage" required />
        {state.fieldErrors.noticeMessage && <p style={{ color: 'crimson' }}>{state.fieldErrors.noticeMessage}</p>}
      </label>
      <button type="submit" disabled={pending}>
        Add schedule
      </button>
    </form>
  )
}
