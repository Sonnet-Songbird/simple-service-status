import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1.5rem' }}>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin">service-status-notice</Link>
      </nav>
      {children}
    </div>
  )
}
