'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { User, Calendar, FileText, Settings } from 'lucide-react'

const navigation = [
  { name: 'Minhas Reservas', href: '/conta/reservas', icon: Calendar },
  { name: 'Meu Perfil', href: '/conta/perfil', icon: User },
  { name: 'Documentos', href: '/conta/documentos', icon: FileText },
  { name: 'Configurações', href: '/conta/configuracoes', icon: Settings },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
