'use client'

import { useActionState } from 'react'
import { createService, type ActionState } from './actions'

const initialState: ActionState = { fieldErrors: {} }

export function NewServiceForm() {
  const [state, formAction, pending] = useActionState(createService, initialState)

  return (
    <form action={formAction} style={{ display: 'grid', gap: '0.5rem', maxWidth: '28rem' }}>
      <label>
        Slug
        <input name="slug" placeholder="my-service" required />
        {state.fieldErrors.slug && <p style={{ color: 'crimson' }}>{state.fieldErrors.slug}</p>}
      </label>
      <label>
        Display name
        <input name="displayName" required />
        {state.fieldErrors.displayName && <p style={{ color: 'crimson' }}>{state.fieldErrors.displayName}</p>}
      </label>
      <label>
        Description
        <input name="description" />
      </label>
      <label>
        Fallback notice message
        <textarea name="fallbackNoticeMessage" required />
        {state.fieldErrors.fallbackNoticeMessage && (
          <p style={{ color: 'crimson' }}>{state.fieldErrors.fallbackNoticeMessage}</p>
        )}
      </label>
      <button type="submit" disabled={pending}>
        Create service
      </button>
    </form>
  )
}
