'use client'

import { useActionState } from 'react'
import { createHost, type ActionState } from './actions'

const initialState: ActionState = { fieldErrors: {} }

export function AddHostForm({ serviceId }: { serviceId: number }) {
  const [state, formAction, pending] = useActionState(createHost.bind(null, serviceId), initialState)

  return (
    <form action={formAction} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
      <div>
        <input name="hostname" placeholder="app.example.com" required />
        {state.fieldErrors.hostname && <p style={{ color: 'crimson', margin: 0 }}>{state.fieldErrors.hostname}</p>}
      </div>
      <button type="submit" disabled={pending}>
        Add host
      </button>
    </form>
  )
}
