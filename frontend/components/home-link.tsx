'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HomeLinkProps {
  className?: string
  children: React.ReactNode
}

export function HomeLink({ className, children }: HomeLinkProps) {
  const pathname = usePathname()

  if (pathname === '/') {
    return (
      <button
        className={className}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {children}
      </button>
    )
  }

  return (
    <Link href="/" className={className}>
      {children}
    </Link>
  )
}
